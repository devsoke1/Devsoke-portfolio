import type { PublicFaq } from "@/lib/faqs/types";
import FaqAccordion from "./FaqAccordion";

type PublicFaqSectionProps = {
  faqs: PublicFaq[];
  heading?: string;
  intro?: string;
  variant?: "default" | "muted";
};

function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function buildFaqJsonLd(faqs: PublicFaq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export default function PublicFaqSection({
  faqs,
  heading = "Common Questions",
  intro,
  variant = "default",
}: PublicFaqSectionProps) {
  if (faqs.length === 0) {
    return null;
  }

  const backgroundClass =
    variant === "muted" ? "bg-brand-card/90 border-y border-brand-border" : "";

  return (
    <section className={`relative z-10 py-14 sm:py-20 ${backgroundClass}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(buildFaqJsonLd(faqs)),
        }}
      />
      <div className="site-container grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="space-y-4 lg:col-span-4">
          <h2 className="text-2xl font-extrabold font-heading text-brand-fg sm:text-4xl">
            {heading}
          </h2>
          {intro && (
            <p className="text-xs leading-relaxed text-gray-400 sm:text-sm">
              {intro}
            </p>
          )}
        </div>
        <div className="lg:col-span-8">
          <FaqAccordion faqs={faqs} />
        </div>
      </div>
    </section>
  );
}
