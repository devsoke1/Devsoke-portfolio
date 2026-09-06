import type { Metadata } from "next";
import { getPublishedProjects } from "@/lib/projects/repository";
import WorkPageClient from "./WorkPageClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Selected Work & Project Profiles | Devsoke",
  description:
    "Explore Devsoke project profiles for restaurant, repair, local-service, and e-commerce websites.",
};

export default async function WorkPage() {
  const projects = await getPublishedProjects();

  return <WorkPageClient projects={projects} />;
}
