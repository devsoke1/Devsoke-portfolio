import { requireAdmin } from "@/lib/auth/session";
import AdminShell from "../../_components/AdminShell";
import ServiceForm from "../ServiceForm";
import { createServiceAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewServicePage() {
  const admin = await requireAdmin();

  return (
    <AdminShell admin={admin} active="services">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black font-heading text-brand-fg">Create Service</h1>
        <p className="text-xs text-gray-400 mt-1">Add a service page record. Keep unpublished until content is ready.</p>
      </div>
      <ServiceForm action={createServiceAction} submitLabel="Create Service" />
    </AdminShell>
  );
}
