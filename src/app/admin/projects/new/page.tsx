import { requireAdmin } from "@/lib/auth/session";
import { getServiceOptions } from "@/lib/services/repository";
import AdminShell from "../../_components/AdminShell";
import ProjectForm from "../ProjectForm";
import { createProjectAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const [admin, services] = await Promise.all([
    requireAdmin(),
    getServiceOptions(),
  ]);

  return (
    <AdminShell admin={admin} active="projects">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black font-heading text-brand-fg">Create Project</h1>
        <p className="text-xs text-gray-400 mt-1">Add a new project profile record. Keep unpublished until it is ready for the public site.</p>
      </div>
      <ProjectForm
        action={createProjectAction}
        services={services}
        submitLabel="Create Project"
      />
    </AdminShell>
  );
}
