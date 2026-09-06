import "server-only";

import { db } from "@/lib/db";
import {
  deletePhysicalFile,
  type SavedFileInfo,
} from "./storage";
import type { MediaItem, MediaStats } from "./types";

function serializeMedia(
  media: {
    id: string;
    storageKey: string;
    originalFilename: string;
    mimeType: string;
    size: number;
    width: number | null;
    height: number | null;
    alt: string | null;
    createdAt: Date;
    _count?: {
      projects: number;
      blogPosts: number;
    };
  }
): MediaItem {
  const projectCount = media._count?.projects ?? 0;
  const blogCount = media._count?.blogPosts ?? 0;

  return {
    id: media.id,
    url: `/media/${media.id}`,
    originalFilename: media.originalFilename,
    mimeType: media.mimeType,
    size: media.size,
    width: media.width,
    height: media.height,
    alt: media.alt,
    createdAt: media.createdAt.toISOString(),
    projectCount,
    blogCount,
    usageCount: projectCount + blogCount,
  };
}

export async function getAdminMediaList(): Promise<MediaItem[]> {
  const list = await db.media.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          projects: true,
          blogPosts: true,
        },
      },
    },
  });

  return list.map(serializeMedia);
}

export async function getMediaById(id: string) {
  return db.media.findUnique({
    where: { id },
  });
}

export async function getMediaUsage(id: string) {
  const media = await db.media.findUnique({
    where: { id },
    include: {
      projects: {
        select: { id: true, title: true, slug: true },
      },
      blogPosts: {
        select: { id: true, title: true, slug: true },
      },
    },
  });

  if (!media) return null;

  return {
    projectCount: media.projects.length,
    blogCount: media.blogPosts.length,
    totalUsage: media.projects.length + media.blogPosts.length,
    projects: media.projects,
    blogPosts: media.blogPosts,
  };
}

export async function createMediaRecord(
  fileInfo: SavedFileInfo,
  alt?: string | null
): Promise<MediaItem> {
  try {
    const created = await db.media.create({
      data: {
        storageKey: fileInfo.storageKey,
        originalFilename: fileInfo.originalFilename,
        mimeType: fileInfo.mimeType,
        size: fileInfo.size,
        width: fileInfo.width,
        height: fileInfo.height,
        alt: alt?.trim() ? alt.trim() : null,
      },
    });

    return serializeMedia(created);
  } catch (error) {
    // Compensation: If database insert fails after physical write, delete physical file
    await deletePhysicalFile(fileInfo.storageKey);
    throw error;
  }
}

export async function updateMediaAltText(id: string, alt: string | null): Promise<MediaItem> {
  const updated = await db.media.update({
    where: { id },
    data: {
      alt: alt?.trim() ? alt.trim() : null,
    },
    include: {
      _count: {
        select: {
          projects: true,
          blogPosts: true,
        },
      },
    },
  });

  return serializeMedia(updated);
}

export async function deleteMediaRecord(id: string): Promise<{ success: boolean; error?: string }> {
  const usage = await getMediaUsage(id);
  if (!usage) {
    return { success: false, error: "Media item not found." };
  }

  if (usage.totalUsage > 0) {
    const refs = [];
    if (usage.projectCount > 0) refs.push(`${usage.projectCount} project(s)`);
    if (usage.blogCount > 0) refs.push(`${usage.blogCount} blog post(s)`);
    return {
      success: false,
      error: `Cannot delete media because it is currently used by ${refs.join(" and ")}. Remove or replace those associations first.`,
    };
  }

  const media = await getMediaById(id);
  if (!media) {
    return { success: false, error: "Media item not found." };
  }

  // Delete physical file from storage
  await deletePhysicalFile(media.storageKey);

  // Delete database record
  await db.media.delete({
    where: { id },
  });

  return { success: true };
}

export async function getMediaStats(): Promise<MediaStats> {
  const [totalCount, sizeSum] = await Promise.all([
    db.media.count(),
    db.media.aggregate({
      _sum: { size: true },
    }),
  ]);

  return {
    totalCount,
    totalSizeBytes: sizeSum._sum.size ?? 0,
  };
}
