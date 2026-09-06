"use client";

import { useBooking } from "@/context/BookingContext";
import type { Service, ServiceIconName } from "@/lib/portfolio/types";
import { getServiceUrl } from "@/lib/portfolio/routes";
import { motion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Code2,
  LineChart,
  ShoppingBag,
  Cpu,
  BarChart4,
  Smartphone,
  CheckCircle2,
  Layers,
  type LucideIcon,
} from "lucide-react";

const serviceIconMap: Record<ServiceIconName, LucideIcon> = {
  Code2,
  Cpu,
  BarChart4,
  ShoppingBag,
  Smartphone,
  Layers,
  LineChart,
};

export default function ServicesPageClient({
  services,
  faqSection,
}: {
  services: Service[];
  faqSection?: ReactNode;
}) {
  const { openBooking } = useBooking();

  return (
    <div className="pt-28 sm:pt-36 md:pt-40 pb-16 sm:pb-24 bg-brand-bg min-h-screen relative overflow-x-hidden">
      {/* Background blueprint grid with radial fade */}
      <div className="absolute inset-0 bg-grid-blueprint bg-radial-fade pointer-events-none z-0" />

      <div className="site-container relative z-10">
        {/* Ambient Lighting */}
        <div className="absolute top-10 -left-20 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-brand-rose/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -right-20 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-brand-plum/15 blur-3xl pointer-events-none" />

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 space-y-4 sm:space-y-5">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading text-brand-fg leading-tight"
          >
            Capabilities & <span className="text-brand-rose-text">Services</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-300 text-xs sm:text-base leading-relaxed"
          >
            Services for teams that need stronger software delivery, clearer user journeys, and lead-ready digital products across the UK, UAE, and Europe.
          </motion.p>
        </div>

        <div className="mb-10 sm:mb-12 rounded-2xl border border-brand-rose/15 bg-brand-card/70 p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <nav
              aria-label="Jump to service"
              className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0"
            >
              {services.map((service) => (
                <Link
                  key={service.slug}
                  href={`#${service.slug}`}
                  className="whitespace-nowrap rounded-full border border-brand-rose/20 bg-brand-bg px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-300 transition-colors hover:border-brand-rose/45 hover:text-brand-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-rose-text"
                >
                  {service.homeTitle}
                </Link>
              ))}
            </nav>
            <button
              type="button"
              onClick={() =>
                openBooking({
                  service: "Not sure yet - help me scope it",
                  ctaLabel: "Help me scope it",
                  ctaLocation: "Services jump nav",
                })
              }
              className="btn-secondary w-full justify-center px-5 py-3 text-xs uppercase tracking-wider lg:w-auto"
            >
              Help Me Scope It
            </button>
          </div>
        </div>

        {/* Detailed Services Grid */}
        <div className="flex flex-col gap-8 sm:gap-10 md:gap-12">
          {services.map((service, index) => {
            const Icon = serviceIconMap[service.icon] ?? Code2;

            return (
              <motion.div
                key={service.slug}
                id={service.slug}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5 }}
                className="scroll-mt-24 sm:scroll-mt-28"
              >
                <Link
                  href={getServiceUrl(service)}
                  className="surface-card surface-card-hover p-6 sm:p-8 md:p-10 rounded-3xl grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center relative overflow-hidden group focus-visible:ring-2 focus-visible:ring-brand-rose-text focus-visible:outline-none"
                >
                  {/* Service Info */}
                  <div
                    className={`lg:col-span-7 space-y-5 sm:space-y-6 ${
                      index % 2 === 1 ? "lg:order-last lg:pl-6" : "lg:pr-6"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 sm:gap-4">
                      <div className="p-3 sm:p-3.5 bg-brand-rose/15 rounded-2xl border border-brand-rose/30 shadow-sm shadow-brand-rose/20 flex-shrink-0 group-hover:scale-105 transition-transform">
                        <Icon size={36} className="text-brand-rose-text" />
                      </div>
                      <div>
                        <span className="text-xs text-brand-rose-text font-mono font-bold tracking-wider uppercase block">
                          {service.tagline}
                        </span>
                        <h2 className="text-lg sm:text-2xl font-bold font-heading text-brand-fg">
                          {service.title}
                        </h2>
                      </div>
                    </div>

                    <p className="text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed">
                      {service.description}
                    </p>

                    {/* Bullet Points */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1">
                      {service.capabilities.map((feat) => (
                        <div
                          key={feat}
                          className="flex items-start space-x-2 text-xs sm:text-sm text-gray-300"
                        >
                          <CheckCircle2
                            size={16}
                            className="text-brand-rose-text mt-0.5 flex-shrink-0"
                          />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stack & Actions */}
                  <div
                    className={`lg:col-span-5 flex flex-col justify-between h-full space-y-5 sm:space-y-6 pt-6 border-t border-brand-rose/15 lg:border-t-0 lg:pt-0 ${
                      index % 2 === 1
                        ? "lg:order-first lg:border-r lg:border-brand-rose/15 lg:pr-6"
                        : "lg:border-l lg:border-brand-rose/15 lg:pl-6"
                    }`}
                  >
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">
                        Technology Stack
                      </h4>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {service.technologies.map((t) => (
                          <span
                            key={t}
                            className="px-2.5 sm:px-3 py-1 bg-brand-bg border border-brand-rose/15 group-hover:border-brand-rose/40 text-gray-300 group-hover:text-brand-fg font-mono text-xs rounded-lg transition-colors"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 sm:pt-4">
                      <span className="btn-secondary w-full py-3.5 text-xs shadow-sm">
                        Explore Service <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {faqSection}

        {/* Bottom CTA Card */}
        <div className="mt-16 sm:mt-20">
          <div className="surface-card rounded-3xl p-6 sm:p-10 md:p-12 border border-brand-rose/30 text-center max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-brand-rose/20 blur-2xl pointer-events-none" />
            <h3 className="text-xl sm:text-3xl font-black font-heading text-brand-fg">
              Ready to bring your project to life?
            </h3>
            <p className="text-gray-300 text-xs sm:text-sm mt-3 mb-6 max-w-xl mx-auto leading-relaxed">
              We engineer practical, scalable software interfaces with high aesthetic precision. Let&apos;s discuss your scope and requirements.
            </p>
            <button
              type="button"
              onClick={() =>
                openBooking({
                  service: "Not sure yet - help me scope it",
                  ctaLabel: "Request discovery call",
                  ctaLocation: "Services index bottom CTA",
                })
              }
              className="btn-primary w-full sm:w-auto px-8 py-3.5 sm:py-4 text-xs uppercase tracking-wider shadow-lg shadow-brand-rose/25"
            >
              Request Discovery Call
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
