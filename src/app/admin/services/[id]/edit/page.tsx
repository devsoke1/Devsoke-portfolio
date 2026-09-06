import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminServiceById } from "@/lib/services/repository";
import AdminShell from "../../../_components/AdminShell";
import ServiceForm from "../../ServiceForm";
import { updateServiceAction } from "../../actions";

type EditServicePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function EditServicePage({ params }: EditServicePageProps) {
  const { id } = await params;
  const [admin, service] = await Promise.all([
    requireAdmin(),
    getAdminServiceById(id),
  ]);

  if (!service) {
    notFound();
  }

  const updateAction = updateServiceAction.bind(null, service.id);

  return (
    <AdminShell admin={admin} active="services">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black font-heading text-brand-fg">Edit Service</h1>
        <p className="text-xs text-gray-400 mt-1">Update service content, structured lists, and publish state.</p>
      </div>
      <ServiceForm
        action={updateAction}
        service={service}
        submitLabel="Save Service"
      />
    </AdminShell>
  );
}
