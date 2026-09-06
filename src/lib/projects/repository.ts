import "server-only";

import type { Prisma } from "@prisma/client";
import db from "@/lib/db";
import type { AdminProject, Project } from "@/lib/portfolio/types";
import type { ProjectInput } from "@/lib/portfolio/validation";

const projectOrder = [
  { order: "asc" },
  { createdAt: "asc" },
  { title: "asc" },
] satisfies Prisma.ProjectOrderByWithRelationInput[];

const projectSelect = {
  id: true,
  slug: true,
  title: true,
  category: true,
  tag: true,
  desc: true,
  longDesc: true,
  challenge: true,
  solution: true,
  image: true,
  featuredMediaId: true,
  featuredMedia: {
    select: {
      id: true,
    },
  },
  tech: true,
  client: true,
  timeline: true,
  demoUrl: true,
  order: true,
  isFeatured: true,
  isPublished: true,
  services: {
    select: {
      service: {
        select: {
          id: true,
          slug: true,
          title: true,
        },
      },
    },
  },
} satisfies Prisma.ProjectSelect;

type ProjectRow = Prisma.ProjectGetPayload<{ select: typeof projectSelect }>;

export class RelatedServiceSelectionError extends Error {
  constructor() {
    super("One or more selected services could not be found.");
    this.name = "RelatedServiceSelectionError";
  }
}

export function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    tag: row.tag,
    desc: row.desc,
    longDesc: row.longDesc,
    challenge: row.challenge,
    solution: row.solution,
    image: row.image,
    featuredMediaId: row.featuredMediaId,
    featuredMedia: row.featuredMedia ? { id: row.featuredMedia.id } : null,
    tech: row.tech,
    client: row.client,
    timeline: row.timeline,
    demoUrl: row.demoUrl ?? undefined,
    order: row.order,
    isFeatured: row.isFeatured,
    isPublished: row.isPublished,
    serviceSlugs: row.services.map((entry) => entry.service.slug),
  };
}

function toAdminProject(row: ProjectRow): AdminProject {
  return {
    ...toProject(row),
    relatedServices: row.services.map((entry) => entry.service),
  };
}

function uniqueIds(ids: string[]) {
  return Array.from(new Set(ids.filter(Boolean)));
}

async function verifyServiceIds(
  tx: Prisma.TransactionClient,
  serviceIds: string[],
) {
  const ids = uniqueIds(serviceIds);

  if (ids.length === 0) {
    return ids;
  }

  const count = await tx.service.count({
    where: {
      id: { in: ids },
    },
  });

  if (count !== ids.length) {
    throw new RelatedServiceSelectionError();
  }

  return ids;
}

function toProjectData(input: ProjectInput) {
  return {
    slug: input.slug,
    title: input.title,
    category: input.category,
    tag: input.tag,
    desc: input.desc,
    longDesc: input.longDesc,
    challenge: input.challenge,
    solution: input.solution,
    image: input.image,
    featuredMediaId: input.featuredMediaId ?? null,
    tech: input.tech,
    client: input.client,
    timeline: input.timeline,
    demoUrl: input.demoUrl ?? null,
    order: input.order,
    isFeatured: input.isFeatured,
    isPublished: input.isPublished,
  };
}

export async function getPublishedProjects() {
  const projects = await db.project.findMany({
    where: { isPublished: true },
    select: projectSelect,
    orderBy: projectOrder,
  });

  return projects.map(toProject);
}

export async function getFeaturedProjects(limit = 3) {
  const featured = await db.project.findMany({
    where: {
      isPublished: true,
      isFeatured: true,
    },
    select: projectSelect,
    orderBy: projectOrder,
    take: limit,
  });

  if (featured.length >= limit) {
    return featured.map(toProject);
  }

  const fallback = await db.project.findMany({
    where: {
      isPublished: true,
      id: { notIn: featured.map((project) => project.id) },
    },
    select: projectSelect,
    orderBy: projectOrder,
    take: limit - featured.length,
  });

  return [...featured, ...fallback].map(toProject);
}

export async function getAdminProjects() {
  const projects = await db.project.findMany({
    select: projectSelect,
    orderBy: projectOrder,
  });

  return projects.map(toAdminProject);
}

export async function getPublishedProjectBySlug(slug: string) {
  const project = await db.project.findFirst({
    where: {
      slug,
      isPublished: true,
    },
    select: projectSelect,
  });

  return project ? toProject(project) : null;
}

export async function getAdminProjectById(id: string) {
  const project = await db.project.findUnique({
    where: { id },
    select: projectSelect,
  });

  return project ? toAdminProject(project) : null;
}

export async function getPublishedProjectsForServiceSlug(slug: string) {
  const projects = await db.project.findMany({
    where: {
      isPublished: true,
      services: {
        some: {
          service: {
            slug,
            isPublished: true,
          },
        },
      },
    },
    select: projectSelect,
    orderBy: projectOrder,
  });

  return projects.map(toProject);
}

export async function getRelatedProjectsForProjectSlug(slug: string, limit = 3) {
  const current = await db.project.findFirst({
    where: {
      slug,
      isPublished: true,
    },
    select: {
      id: true,
      services: {
        select: {
          serviceId: true,
        },
      },
    },
  });

  if (!current) {
    return [];
  }

  const serviceIds = current.services.map((entry) => entry.serviceId);
  const relatedByService =
    serviceIds.length > 0
      ? await db.project.findMany({
          where: {
            id: { not: current.id },
            isPublished: true,
            services: {
              some: {
                serviceId: { in: serviceIds },
              },
            },
          },
          select: projectSelect,
          orderBy: projectOrder,
          take: limit,
        })
      : [];

  if (relatedByService.length >= limit) {
    return relatedByService.map(toProject);
  }

  const fallback = await db.project.findMany({
    where: {
      id: {
        notIn: [current.id, ...relatedByService.map((project) => project.id)],
      },
      isPublished: true,
    },
    select: projectSelect,
    orderBy: projectOrder,
    take: limit - relatedByService.length,
  });

  return [...relatedByService, ...fallback].map(toProject);
}

export async function getAdjacentPublishedProjects(slug: string) {
  const projects = await getPublishedProjects();
  const index = projects.findIndex((project) => project.slug === slug);

  if (index === -1 || projects.length < 2) {
    return { previous: null, next: null };
  }

  return {
    previous: projects[(index - 1 + projects.length) % projects.length],
    next: projects[(index + 1) % projects.length],
  };
}

export async function createProject(input: ProjectInput) {
  return db.$transaction(async (tx) => {
    const serviceIds = await verifyServiceIds(tx, input.serviceIds);
    const project = await tx.project.create({
      data: toProjectData(input),
      select: projectSelect,
    });

    if (serviceIds.length > 0) {
      await tx.projectService.createMany({
        data: serviceIds.map((serviceId) => ({
          projectId: project.id,
          serviceId,
        })),
        skipDuplicates: true,
      });
    }

    const createdProject = await tx.project.findUniqueOrThrow({
      where: { id: project.id },
      select: projectSelect,
    });

    return toAdminProject(createdProject);
  });
}

export async function updateProject(id: string, input: ProjectInput) {
  return db.$transaction(async (tx) => {
    const serviceIds = await verifyServiceIds(tx, input.serviceIds);

    await tx.project.update({
      where: { id },
      data: toProjectData(input),
      select: { id: true },
    });

    await tx.projectService.deleteMany({
      where: { projectId: id },
    });

    if (serviceIds.length > 0) {
      await tx.projectService.createMany({
        data: serviceIds.map((serviceId) => ({
          projectId: id,
          serviceId,
        })),
        skipDuplicates: true,
      });
    }

    const updatedProject = await tx.project.findUniqueOrThrow({
      where: { id },
      select: projectSelect,
    });

    return toAdminProject(updatedProject);
  });
}

export async function deleteProject(id: string) {
  const project = await db.project.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      title: true,
    },
  });

  if (!project) {
    return {
      ok: false as const,
      message: "Project was not found.",
    };
  }

  await db.project.delete({
    where: { id },
  });

  return {
    ok: true as const,
    project,
  };
}
