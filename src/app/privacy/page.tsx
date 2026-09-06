import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Devsoke",
  description:
    "Privacy policy detailing data handling practices, client-side browser storage, and visitor information on the Devsoke website.",
};

export default function PrivacyPage() {
  return (
    <div className="pt-28 sm:pt-36 md:pt-40 pb-16 sm:pb-24 bg-brand-bg min-h-screen relative overflow-x-hidden">
      {/* Background blueprint grid */}
      <div className="absolute inset-0 bg-grid-blueprint bg-radial-fade pointer-events-none z-0" />

      <div className="site-container relative z-10">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex min-w-0 items-center gap-2 overflow-hidden text-[11px] font-mono font-bold uppercase tracking-wider text-gray-500"
        >
          <Link href="/" className="inline-flex items-center gap-1 hover:text-brand-rose-text transition-colors flex-shrink-0">
            <Home size={12} />
            Home
          </Link>
          <ChevronRight size={13} className="flex-shrink-0 text-gray-700" />
          <span className="truncate text-brand-rose-text min-w-0">Privacy Policy</span>
        </nav>

        {/* Page Content Container */}
        <div className="max-w-3xl mx-auto space-y-10 sm:space-y-12">
          {/* Header */}
          <div className="space-y-4 border-b border-brand-rose/15 pb-8">
            <h1 className="text-3xl sm:text-5xl font-black font-heading text-brand-fg leading-tight">
              Privacy Policy
            </h1>
            <p className="text-xs font-mono text-gray-500">
              Last updated: September 2, 2026
            </p>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              This Privacy Policy explains how Devsoke collects, uses, and handles information when you visit our website and interact with our portfolio experiences.
            </p>
          </div>

          {/* Policy Sections */}
          <div className="space-y-8 text-sm sm:text-base text-gray-300 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-bold font-heading text-brand-fg">
                1. Information You Provide Directly
              </h2>
              <p>
                When you choose to request a discovery session or project consultation through our interactive booking dialog or contact channels, you may voluntarily submit certain contact and project details. This may include:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-gray-400 text-xs sm:text-sm">
                <li>Your full name and contact email address</li>
                <li>Your organization or company name (if provided)</li>
                <li>Selected service area and project scope requirements</li>
                <li>Estimated budget parameters and target delivery timeline</li>
                <li>General project description and technical notes</li>
                <li>Preferred discovery consultation date</li>
              </ul>
              <p className="text-gray-400 text-xs sm:text-sm">
                This information is submitted to and stored in the site database so Devsoke can evaluate feasibility, prepare relevant architectural context, and coordinate directly with you.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold font-heading text-brand-fg">
                2. Browser State & Client Preferences
              </h2>
              <p>
                This website may utilize standard browser storage mechanisms to preserve interface preferences and interactive presentation states locally on your device.
              </p>
              <p className="text-gray-400 text-xs sm:text-sm">
                Client-side interface preferences reside inside your personal browser and can be cleared at any time through your browser settings.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold font-heading text-brand-fg">
                3. Technical & Server Log Data
              </h2>
              <p>
                Like most standard web hosting environments, our servers automatically log basic HTTP request metadata necessary for secure transmission and resource delivery. This technical telemetry may include:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-gray-400 text-xs sm:text-sm">
                <li>Internet Protocol (IP) address</li>
                <li>Browser type, version, and operating system</li>
                <li>Requested URLs, timestamps, and HTTP response codes</li>
                <li>Referring web pages</li>
              </ul>
              <p className="text-gray-400 text-xs sm:text-sm">
                This diagnostic data is used solely to ensure site availability, investigate system errors, and maintain server integrity.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold font-heading text-brand-fg">
                4. Third-Party Services & External Links
              </h2>
              <p>
                Our portfolio may include links to external third-party project demos, open-source resources, and hosted imagery from media delivery networks such as Unsplash.
              </p>
              <p className="text-gray-400 text-xs sm:text-sm">
                We do not operate or control third-party websites. When you click an external link, you are subject to the respective privacy policies and terms of those third-party providers.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold font-heading text-brand-fg">
                5. How We Use Collected Information
              </h2>
              <p>
                Information provided during project inquiries is used strictly for:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-gray-400 text-xs sm:text-sm">
                <li>Evaluating project scope and technical feasibility</li>
                <li>Responding to your direct inquiries and coordinating consultations</li>
                <li>Delivering agreed technical architecture notes or project milestones</li>
              </ul>
              <p className="text-gray-400 text-xs sm:text-sm">
                We do not sell, rent, or trade your personal contact details to external marketing agencies or data brokers.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold font-heading text-brand-fg">
                6. Data Retention & Security
              </h2>
              <p>
                We apply standard commercial safeguards to prevent unauthorized access or disclosure of correspondence. However, no internet transmission method or electronic storage is completely impenetrable.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold font-heading text-brand-fg">
                7. Updates to This Policy
              </h2>
              <p>
                We may periodically update this Privacy Policy to reflect modifications to our site architecture or services. The revised date at the top of this document indicates when the latest revisions took effect.
              </p>
            </section>

            <section className="space-y-3 pt-4 border-t border-brand-rose/15">
              <h2 className="text-xl font-bold font-heading text-brand-fg">
                8. Contact Us
              </h2>
              <p>
                If you have questions regarding this Privacy Policy or data handling practices, please contact us at:
              </p>
              <p className="font-mono text-sm text-brand-rose-text">
                <a href="mailto:hello@devsoke.com" className="hover:underline">
                  hello@devsoke.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
