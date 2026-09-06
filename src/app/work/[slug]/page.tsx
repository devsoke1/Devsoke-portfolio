import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectDetailPage from "@/components/work/ProjectDetailPage";
import {
  getAdjacentPublishedProjects,
  getPublishedProjectBySlug,
  getRelatedProjectsForProjectSlug,
} from "@/lib/projects/repository";
import { getPublishedServicesBySlugs } from "@/lib/services/repository";

export const dynamic = "force-dynamic";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project Not Found | Devsoke",
    };
  }

  return {
    title: `${project.title} | Devsoke Project Profile`,
    description: project.desc,
  };
}

export default async function Page({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const [relatedServices, relatedProjects, adjacent] = await Promise.all([
    getPublishedServicesBySlugs(project.serviceSlugs),
    getRelatedProjectsForProjectSlug(project.slug, 3),
    getAdjacentPublishedProjects(project.slug),
  ]);

  return (
    <ProjectDetailPage
      project={project}
      relatedServices={relatedServices}
      relatedProjects={relatedProjects}
      previousProject={adjacent.previous}
      nextProject={adjacent.next}
    />
  );
}
