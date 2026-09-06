import Link from "next/link";
import { Edit, ExternalLink, PlusCircle, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminProjects } from "@/lib/projects/repository";
import { getProjectUrl } from "@/lib/portfolio/routes";
import AdminShell from "../_components/AdminShell";
import ConfirmSubmitButton from "../_components/ConfirmSubmitButton";
import { deleteProjectAction } from "./actions";

type AdminProjectsPageProps = {
  searchParams: Promise<{
    status?: string;
    error?: string;
  }>;
};

export const dynamic = "force-dynamic";

const statusMessages: Record<string, string> = {
  created: "Project created.",
  updated: "Project updated.",
  deleted: "Project deleted.",
};

const errorMessages: Record<string, string> = {
  missing: "Project was not found.",
};

export default async function AdminProjectsPage({
  searchParams,
}: AdminProjectsPageProps) {
  const [admin, projects, params] = await Promise.all([
    requireAdmin(),
    getAdminProjects(),
    searchParams,
  ]);
  const statusMessage = params.status ? statusMessages[params.status] : null;
  const errorMessage = params.error ? errorMessages[params.error] : null;

  return (
    <AdminShell admin={admin} active="projects">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-brand-fg">Projects</h1>
          <p className="text-xs text-gray-400 mt-1">Manage PostgreSQL-backed project profiles and service relations.</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="btn-primary px-5 py-3 text-xs uppercase tracking-wider flex items-center gap-1.5 w-full sm:w-auto justify-center shadow-md shadow-brand-rose/25"
        >
          <PlusCircle size={14} /> Create Project
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
        {projects.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-xs">
            No projects yet.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full min-w-[860px] text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-brand-rose/15 text-gray-400 uppercase font-bold tracking-wider">
                  <th className="pb-3 pr-4 pl-2">Project</th>
                  <th className="pb-3 pr-4">Category</th>
                  <th className="pb-3 pr-4">Slug</th>
                  <th className="pb-3 pr-4">Services</th>
                  <th className="pb-3 pr-4">Order</th>
                  <th className="pb-3 pr-4">State</th>
                  <th className="pb-3 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-rose/10">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-brand-rose/[0.04] transition-colors">
                    <td className="py-4 pr-4 pl-2">
                      <span className="font-bold text-gray-200 block">{project.title}</span>
                      <span className="text-[10px] text-gray-500">{project.tag}</span>
                    </td>
                    <td className="py-4 pr-4 font-mono text-gray-400">{project.category}</td>
                    <td className="py-4 pr-4 font-mono text-gray-400">{project.slug}</td>
                    <td className="py-4 pr-4 text-gray-400">{project.relatedServices.length}</td>
                    <td className="py-4 pr-4 font-mono text-gray-400">{project.order}</td>
                    <td className="py-4 pr-4">
                      <div className="flex flex-wrap gap-1.5">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            project.isPublished
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/25"
                              : "bg-amber-500/10 text-amber-500 border border-amber-500/25"
                          }`}
                        >
                          {project.isPublished ? "Published" : "Draft"}
                        </span>
                        {project.isFeatured && (
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-rose/10 text-brand-rose-text border border-brand-rose/25">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 pr-2">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={getProjectUrl(project)}
                          className="p-2 border border-brand-rose/20 hover:border-brand-rose text-gray-300 hover:text-brand-fg rounded-xl transition-all"
                          title="View public project"
                        >
                          <ExternalLink size={14} />
                        </Link>
                        <Link
                          href={`/admin/projects/${project.id}/edit`}
                          className="p-2 border border-brand-rose/20 hover:border-brand-rose text-gray-300 hover:text-brand-fg rounded-xl transition-all"
                          title="Edit project"
                        >
                          <Edit size={14} />
                        </Link>
                        <form action={deleteProjectAction}>
                          <input type="hidden" name="id" value={project.id} />
                          <ConfirmSubmitButton
                            message={`Delete project "${project.title}"? This cannot be undone.`}
                            className="p-2 border border-brand-rose/20 hover:border-brand-rose text-brand-rose-text rounded-xl transition-all"
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
