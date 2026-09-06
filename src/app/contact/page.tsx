import type { Metadata } from "next";
import PublicFaqSection from "@/components/faq/PublicFaqSection";
import ContactClient from "@/components/contact/ContactClient";
import { getPublishedFaqsForPlacement } from "@/lib/faqs/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact Devsoke | Start a Project Discussion",
  description:
    "Get in touch with Devsoke for project inquiries, technical architecture consultations, 3D web interfaces, and custom software development.",
};

export default async function ContactPage() {
  const faqs = await getPublishedFaqsForPlacement("CONTACT");

  return (
    <ContactClient
      faqSection={
        <PublicFaqSection
          faqs={faqs}
          heading="Contact Questions"
          intro="Answers about enquiry details, booking expectations, and next steps."
        />
      }
    />
  );
}
