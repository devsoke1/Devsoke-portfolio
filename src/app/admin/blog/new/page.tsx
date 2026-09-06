import { requireAdmin } from "@/lib/auth/session";
import CreateBlogPostClient from "./CreateBlogPostClient";

export const dynamic = "force-dynamic";

export default async function CreateBlogPostPage() {
  const admin = await requireAdmin();

  return <CreateBlogPostClient admin={admin} />;
}
