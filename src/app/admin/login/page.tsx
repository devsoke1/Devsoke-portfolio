import { redirectAuthenticatedAdmin } from "@/lib/auth/session";
import AdminLoginForm from "./AdminLoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  await redirectAuthenticatedAdmin();

  return <AdminLoginForm />;
}
