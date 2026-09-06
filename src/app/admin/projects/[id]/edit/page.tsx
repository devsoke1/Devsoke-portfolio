import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminProjectById } from "@/lib/projects/repository";
import { getServiceOptions } from "@/lib/services/repository";
import AdminShell from "../../../_components/AdminShell";
import ProjectForm from "../../ProjectForm";
import { updateProjectAction } from "../../actions";

type EditProjectPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params;
  const [admin, project, services] = await Promise.all([
    requireAdmin(),
    getAdminProjectById(id),
    getServiceOptions(),
  ]);

  if (!project) {
    notFound();
  }

  const updateAction = updateProjectAction.bind(null, project.id);

  return (
    <AdminShell admin={admin} active="projects">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black font-heading text-brand-fg">Edit Project</h1>
        <p className="text-xs text-gray-400 mt-1">Update project content and service associations.</p>
      </div>
      <ProjectForm
        action={updateAction}
        project={project}
        services={services}
        submitLabel="Save Project"
      />
    </AdminShell>
  );
}
