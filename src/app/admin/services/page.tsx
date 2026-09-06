import Link from "next/link";
import { Edit, ExternalLink, PlusCircle, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { getServiceUrl } from "@/lib/portfolio/routes";
import { getAdminServices } from "@/lib/services/repository";
import AdminShell from "../_components/AdminShell";
import ConfirmSubmitButton from "../_components/ConfirmSubmitButton";
import { deleteServiceAction } from "./actions";

type AdminServicesPageProps = {
  searchParams: Promise<{
    status?: string;
    error?: string;
  }>;
};

export const dynamic = "force-dynamic";

const statusMessages: Record<string, string> = {
  created: "Service created.",
  updated: "Service updated.",
  deleted: "Service deleted.",
};

const errorMessages: Record<string, string> = {
  missing: "Service was not found.",
  "related-projects": "Remove project associations before deleting this service.",
};

export default async function AdminServicesPage({
  searchParams,
}: AdminServicesPageProps) {
  const [admin, services, params] = await Promise.all([
    requireAdmin(),
    getAdminServices(),
    searchParams,
  ]);
  const statusMessage = params.status ? statusMessages[params.status] : null;
  const errorMessage = params.error ? errorMessages[params.error] : null;

  return (
    <AdminShell admin={admin} active="services">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-brand-fg">Services</h1>
          <p className="text-xs text-gray-400 mt-1">Manage PostgreSQL-backed service pages and their public order.</p>
        </div>
        <Link
          href="/admin/services/new"
          className="btn-primary px-5 py-3 text-xs uppercase tracking-wider flex items-center gap-1.5 w-full sm:w-auto justify-center shadow-md shadow-brand-rose/25"
        >
          <PlusCircle size={14} /> Create Service
        </Link>
      </div>

      {statusMessage && (
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-400">
          {statusMessage}
        </div>
      )}
      {errorMessage && (
        <div className="rounded-2xl border border-brand-rose/30 bg-brand-rose/10 p-4 text-xs font-semibold text-brand-rose-text">
          {errorMessage}
        </div>
      )}

      <section className="surface-card rounded-3xl p-5 sm:p-7 shadow-sm">
        {services.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-xs">
            No services yet.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full min-w-[760px] text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-brand-rose/15 text-gray-400 uppercase font-bold tracking-wider">
                  <th className="pb-3 pr-4 pl-2">Service</th>
                  <th className="pb-3 pr-4">Slug</th>
                  <th className="pb-3 pr-4">Order</th>
                  <th className="pb-3 pr-4">Projects</th>
                  <th className="pb-3 pr-4">State</th>
                  <th className="pb-3 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-rose/10">
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-brand-rose/[0.04] transition-colors">
                    <td className="py-4 pr-4 pl-2">
                      <span className="font-bold text-gray-200 block">{service.title}</span>
                      <span className="text-[10px] text-gray-500">{service.tagline}</span>
                    </td>
                    <td className="py-4 pr-4 font-mono text-gray-400">{service.slug}</td>
                    <td className="py-4 pr-4 font-mono text-gray-400">{service.order}</td>
                    <td className="py-4 pr-4 text-gray-400">{service.relatedProjectCount}</td>
                    <td className="py-4 pr-4">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          service.isPublished
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/25"
                            : "bg-amber-500/10 text-amber-500 border border-amber-500/25"
                        }`}
                      >
                        {service.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="py-4 pr-2">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={getServiceUrl(service)}
                          className="p-2 border border-brand-rose/20 hover:border-brand-rose text-gray-300 hover:text-brand-fg rounded-xl transition-all"
                          title="View public service"
                        >
                          <ExternalLink size={14} />
                        </Link>
                        <Link
                          href={`/admin/services/${service.id}/edit`}
                          className="p-2 border border-brand-rose/20 hover:border-brand-rose text-gray-300 hover:text-brand-fg rounded-xl transition-all"
                          title="Edit service"
                        >
                          <Edit size={14} />
                        </Link>
                        <form action={deleteServiceAction}>
                          <input type="hidden" name="id" value={service.id} />
                          <ConfirmSubmitButton
                            message={`Delete service "${service.title}"? Related projects will not be deleted.`}
                            className="p-2 border border-brand-rose/20 hover:border-brand-rose text-brand-rose-text rounded-xl transition-all disabled:opacity-50"
                          >
                            <Trash2 size={14} />
                          </ConfirmSubmitButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminShell>
  );
}
