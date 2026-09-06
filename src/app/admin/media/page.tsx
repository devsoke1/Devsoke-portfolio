import { requireAdmin } from "@/lib/auth/session";
import { getAdminMediaList, getMediaStats } from "@/lib/media/repository";
import MediaLibraryClient from "./MediaLibraryClient";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const admin = await requireAdmin();
  const [media, stats] = await Promise.all([
    getAdminMediaList(),
    getMediaStats(),
  ]);

  return (
    <MediaLibraryClient
      admin={admin}
      initialMedia={media}
      stats={stats}
    />
  );
}

