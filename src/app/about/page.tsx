import type { Metadata } from "next";
import AboutClient from "@/components/about/AboutClient";
import PublicFaqSection from "@/components/faq/PublicFaqSection";
import { getPublishedFaqsForPlacement } from "@/lib/faqs/repository";
import { getPublishedServices } from "@/lib/services/repository";
import { getFeaturedProjects } from "@/lib/projects/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Devsoke | Software Websites and Apps",
  description:
    "Learn about Devsoke's engineering philosophy, capabilities, and approach to building high-performance web applications, interactive 3D interfaces, and AI workflows.",
};

export default async function AboutPage() {
  const [services, featuredProjects, faqs] = await Promise.all([
    getPublishedServices(),
    getFeaturedProjects(3),
    getPublishedFaqsForPlacement("ABOUT"),
  ]);

  return (
    <AboutClient
      services={services}
      featuredProjects={featuredProjects}
      faqSection={
        <PublicFaqSection
          faqs={faqs}
          heading="About Devsoke"
          intro="Practical answers about how service scope and project fit are approached."
          variant="muted"
        />
      }
    />
  );
}
