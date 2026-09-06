"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Calendar, Mail, MapPin } from "lucide-react";
import BrandMark from "@/components/brand/BrandMark";
import { useBooking } from "@/context/BookingContext";
import { serviceSlugs } from "@/lib/portfolio/routes";

export default function Footer() {
  const pathname = usePathname();
  const { openBooking } = useBooking();

  const isAdminPage = pathname?.startsWith("/admin");
  if (isAdminPage) return null;

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-auto overflow-hidden border-t border-brand-border bg-brand-bg text-sm text-gray-400">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-brand-rose/50 to-transparent" />

      <div className="site-container py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4 lg:gap-12">
          <div className="space-y-4">
            <Link href="/" className="inline-block py-1" aria-label="Devsoke home">
              <BrandMark className="h-9 w-auto" decorative />
            </Link>
            <p className="max-w-sm text-xs leading-relaxed text-gray-400">
              Software websites, AI workflows, ecommerce systems, and dashboards
              for teams selling into the UK, UAE, and Europe.
            </p>
            <p className="font-heading text-sm font-extrabold text-brand-fg">
              Build. Rank. Grow.
            </p>
          </div>

          <div>
            <h4 className="mb-4 border-l-2 border-brand-rose pl-2.5 text-xs font-bold uppercase tracking-wider text-brand-fg">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/" className="inline-block py-0.5 text-gray-400 transition-colors hover:text-brand-rose-text">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="inline-block py-0.5 text-gray-400 transition-colors hover:text-brand-rose-text">
                  About Studio
                </Link>
              </li>
              <li>
                <Link href="/services" className="inline-block py-0.5 text-gray-400 transition-colors hover:text-brand-rose-text">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/work" className="inline-block py-0.5 text-gray-400 transition-colors hover:text-brand-rose-text">
                  Project Profiles
                </Link>
              </li>
              <li>
                <Link href="/contact" className="inline-block py-0.5 text-gray-400 transition-colors hover:text-brand-rose-text">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/blog" className="inline-block py-0.5 text-gray-400 transition-colors hover:text-brand-rose-text">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 border-l-2 border-brand-rose pl-2.5 text-xs font-bold uppercase tracking-wider text-brand-fg">
              Capabilities
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href={`/services/${serviceSlugs.web}`} className="inline-block py-0.5 text-gray-400 transition-colors hover:text-brand-rose-text">
                  Web App Development
                </Link>
              </li>
              <li>
                <Link href={`/services/${serviceSlugs.ai}`} className="inline-block py-0.5 text-gray-400 transition-colors hover:text-brand-rose-text">
                  AI Integration
                </Link>
              </li>
              <li>
                <Link href={`/services/${serviceSlugs.dashboards}`} className="inline-block py-0.5 text-gray-400 transition-colors hover:text-brand-rose-text">
                  Dashboards & SaaS
                </Link>
              </li>
              <li>
                <Link href={`/services/${serviceSlugs.ecommerce}`} className="inline-block py-0.5 text-gray-400 transition-colors hover:text-brand-rose-text">
                  Ecommerce Systems
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="mb-4 border-l-2 border-brand-rose pl-2.5 text-xs font-bold uppercase tracking-wider text-brand-fg">
              Get In Touch
            </h4>
            <a
              href="mailto:hello@devsoke.com"
              className="flex items-start space-x-2.5 text-xs text-gray-400 transition-colors hover:text-brand-rose-text"
            >
              <Mail size={14} className="mt-0.5 flex-shrink-0 text-brand-rose-text" />
              <span>hello@devsoke.com</span>
            </a>
            <div className="flex items-start space-x-2.5 text-xs text-gray-400">
              <MapPin size={14} className="mt-0.5 flex-shrink-0 text-brand-rose-text" />
              <span>Remote collaboration for UK, UAE, and European clients</span>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() =>
                  openBooking({
                    ctaLabel: "Footer discovery call",
                    ctaLocation: "Public footer",
                  })
                }
                className="btn-primary flex w-full items-center justify-center gap-1.5 py-3 text-xs shadow-md shadow-brand-rose/20"
              >
                Request Discovery Call <Calendar size={12} />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-brand-rose/10 pt-6 text-center text-xs text-gray-400 sm:mt-14 sm:pt-8 md:flex-row md:text-left">
          <p>(c) {currentYear} Devsoke. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link href="/privacy" className="py-1 transition-colors hover:text-brand-rose-text">
              Privacy Policy
            </Link>
            <Link href="/terms" className="py-1 transition-colors hover:text-brand-rose-text">
              Terms of Service
            </Link>
            <Link href="/admin/login" className="inline-flex items-center gap-1 py-1 transition-colors hover:text-brand-rose-text">
              Staff Login <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
