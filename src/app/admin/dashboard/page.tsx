import { requireAdmin } from "@/lib/auth/session";
import { getAdminBlogPosts, getBlogStats } from "@/lib/blog/repository";
import { getAdminProjects } from "@/lib/projects/repository";
import { getAdminServices } from "@/lib/services/repository";
import { getMediaStats } from "@/lib/media/repository";
import { getAdminInquiries, getInquiryStats } from "@/lib/inquiries/repository";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();

  const [posts, blogStats, projects, services, mediaStats, inquiryData, inquiryStats] =
    await Promise.all([
      getAdminBlogPosts(),
      getBlogStats(),
      getAdminProjects(),
      getAdminServices(),
      getMediaStats(),
      getAdminInquiries({ limit: 5 }),
      getInquiryStats(),
    ]);

  return (
    <DashboardClient
      admin={admin}
      posts={posts.slice(0, 5)}
      blogStats={blogStats}
      projectCount={projects.length}
      serviceCount={services.length}
      mediaCount={mediaStats.totalCount}
      inquiries={inquiryData.inquiries}
      inquiryStats={inquiryStats}
    />
  );
}
