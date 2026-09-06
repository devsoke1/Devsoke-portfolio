import type { Metadata } from "next";
import PublicFaqSection from "@/components/faq/PublicFaqSection";
import { getPublishedFaqsForPlacement } from "@/lib/faqs/repository";
import { getPublishedServices } from "@/lib/services/repository";
import ServicesPageClient from "./ServicesPageClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Capabilities & Services | Devsoke",
  description:
    "Explore our full suite of digital engineering capabilities including Web App Development, AI Integrations, SaaS Dashboards, and Custom Ecommerce.",
};

export default async function ServicesPage() {
  const [services, faqs] = await Promise.all([
    getPublishedServices(),
    getPublishedFaqsForPlacement("SERVICES_INDEX"),
  ]);

  return (
    <ServicesPageClient
      services={services}
      faqSection={
        <PublicFaqSection
          faqs={faqs}
          heading="Service Questions"
          intro="Use these answers to choose a practical starting point before sending a project request."
        />
      }
    />
  );
}
