import HomeClient from "./HomeClient";
import PublicFaqSection from "@/components/faq/PublicFaqSection";
import { getPublishedFaqsForPlacement } from "@/lib/faqs/repository";
import { getFeaturedProjects } from "@/lib/projects/repository";
import { getPublishedServices } from "@/lib/services/repository";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [services, featuredProjects, faqs] = await Promise.all([
    getPublishedServices(),
    getFeaturedProjects(3),
    getPublishedFaqsForPlacement("HOME", 4),
  ]);

  return (
    <HomeClient
      services={services}
      featuredProjects={featuredProjects}
      faqSection={
        <PublicFaqSection
          faqs={faqs}
          heading="Project Questions"
          intro="A few practical answers before you send a project request."
          variant="muted"
        />
      }
    />
  );
}
