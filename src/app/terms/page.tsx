import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | Devsoke",
  description:
    "Terms and conditions governing the use of the Devsoke digital studio website, portfolio showcases, and online resources.",
};

export default function TermsPage() {
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
          <span className="truncate text-brand-rose-text min-w-0">Terms of Service</span>
        </nav>

        {/* Page Content Container */}
        <div className="max-w-3xl mx-auto space-y-10 sm:space-y-12">
          {/* Header */}
          <div className="space-y-4 border-b border-brand-rose/15 pb-8">
            <h1 className="text-3xl sm:text-5xl font-black font-heading text-brand-fg leading-tight">
              Terms of Service
            </h1>
            <p className="text-xs font-mono text-gray-500">
              Last updated: September 2, 2026
            </p>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              These Terms of Service govern your access to and use of the Devsoke website, project profiles, and digital portfolio materials.
            </p>
          </div>

          {/* Policy Sections */}
          <div className="space-y-8 text-sm sm:text-base text-gray-300 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-bold font-heading text-brand-fg">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or browsing this website, you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service. If you do not agree to these terms, please discontinue use of this site.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold font-heading text-brand-fg">
                2. Intellectual Property & Portfolio Content
              </h2>
              <p>
                All materials displayed on this site, including text, code snippets, visual designs, graphic assets, typography, brand marks, and layout architectures, are the property of Devsoke or its respective content licensors, protected by copyright and intellectual property laws.
              </p>
              <p className="text-gray-400 text-xs sm:text-sm">
                You may view and reference the content for personal, non-commercial evaluation purposes. You may not reproduce, redistribute, modify, or republish site assets without prior written consent.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold font-heading text-brand-fg">
                3. Project Profiles & Technical Demonstrations
              </h2>
              <p>
                The project profiles, telemetry visualizations, interactive demos, and project summaries presented on this website are provided for illustrative and portfolio presentation purposes. They demonstrate technical capabilities and architectural methodologies.
              </p>
              <p className="text-gray-400 text-xs sm:text-sm">
                Specific client agreements, deliverable scopes, warranties, and commercial terms for professional engagements are governed by separate, formal service contracts.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold font-heading text-brand-fg">
                4. Third-Party Links & Resources
              </h2>
              <p>
                This website may contain hyperlinks to third-party platforms, open-source repositories, and external resources. Devsoke does not endorse, control, or assume liability for the accuracy, content, or practices of any third-party websites.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold font-heading text-brand-fg">
                5. Disclaimer of Warranties
              </h2>
              <p>
                This website and all associated materials are provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind, whether express, implied, or statutory, including warranties of merchantability, fitness for a particular purpose, or non-infringement.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold font-heading text-brand-fg">
                6. Limitation of Liability
              </h2>
              <p>
                To the fullest extent permitted by applicable law, Devsoke shall not be liable for any direct, indirect, incidental, consequential, or punitive damages resulting from your use of or inability to access this website or its content.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold font-heading text-brand-fg">
                7. Revisions to Terms
              </h2>
              <p>
                We reserve the right to revise or modify these Terms of Service at any time. Any changes will be posted on this page with an updated &quot;Last updated&quot; date. Continued use of the website following revisions constitutes acceptance of the modified terms.
              </p>
            </section>

            <section className="space-y-3 pt-4 border-t border-brand-rose/15">
              <h2 className="text-xl font-bold font-heading text-brand-fg">
                8. Contact Information
              </h2>
              <p>
                For questions regarding these Terms of Service, please reach out via email at:
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
