import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicFaqSection from "@/components/faq/PublicFaqSection";
import ServiceDetailPage from "@/components/services/ServiceDetailPage";
import { getPublishedFaqsForService } from "@/lib/faqs/repository";
import {
  getAdjacentPublishedServices,
  getPublishedServiceBySlug,
} from "@/lib/services/repository";
import { getPublishedProjectsForServiceSlug } from "@/lib/projects/repository";

export const dynamic = "force-dynamic";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getPublishedServiceBySlug(slug);

  if (!service) {
    return {
      title: "Service Not Found | Devsoke",
    };
  }

  return {
    title: `${service.title} | Devsoke Services`,
    description: service.description,
  };
}

export default async function Page({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = await getPublishedServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const [relatedProjects, adjacent, faqs] = await Promise.all([
    getPublishedProjectsForServiceSlug(service.slug),
    getAdjacentPublishedServices(service.slug),
    getPublishedFaqsForService(service.slug),
  ]);

  return (
    <ServiceDetailPage
      service={service}
      relatedProjects={relatedProjects}
      previousService={adjacent.previous}
      nextService={adjacent.next}
      faqSection={
        <PublicFaqSection
          faqs={faqs}
          heading="Service Questions"
          intro="Answers specific to this service area and how it can be scoped."
          variant="muted"
        />
      }
    />
  );
}
