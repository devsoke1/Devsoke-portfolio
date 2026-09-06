"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useBooking } from "@/context/BookingContext";
import { getProjectUrl, getServiceUrl } from "@/lib/portfolio/routes";
import { resolveImageUrl } from "@/lib/media/resolve";
import type {
  Project,
  Service,
  ServiceIconName,
  ServiceVisualVariant,
} from "@/lib/portfolio/types";
import {
  ArrowRight,
  BarChart4,
  ChevronRight,
  Code2,
  Cpu,
  Home,
  Layers,
  LineChart,
  ShoppingBag,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

interface ServiceDetailPageProps {
  service: Service;
  relatedProjects: Project[];
  previousService: Service | null;
  nextService: Service | null;
  faqSection?: ReactNode;
}

const serviceIconMap: Record<ServiceIconName, LucideIcon> = {
  Code2,
  Cpu,
  BarChart4,
  ShoppingBag,
  Smartphone,
  Layers,
  LineChart,
};

const visualNodes: Record<ServiceVisualVariant, string[]> = {
  blueprint: ["Component Map", "Route Layer", "UI State", "API Surface", "QA Pass"],
  neural: ["Prompt Layer", "Context Index", "Model Route", "Review Loop", "Fallbacks"],
  telemetry: ["Live Feed", "Charts", "Filters", "Roles", "Reports"],
  commerce: ["Catalog", "Cart", "Checkout", "Inventory", "Content"],
  mobile: ["Screens", "Gestures", "Offline", "Native APIs", "Release"],
  saas: ["Tenants", "Accounts", "Workflows", "Dashboards", "Handoff"],
  growth: ["Crawl", "Metadata", "Schema", "Speed", "Signals"],
};

const capabilityGridClass: Record<ServiceVisualVariant, string> = {
  blueprint: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  neural: "grid-cols-1 md:grid-cols-2",
  telemetry: "grid-cols-1 md:grid-cols-2",
  commerce: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  mobile: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  saas: "grid-cols-1 md:grid-cols-2",
  growth: "grid-cols-1 md:grid-cols-2",
};

export default function ServiceDetailPage({
  service,
  relatedProjects,
  previousService,
  nextService,
  faqSection,
}: ServiceDetailPageProps) {
  const { openBooking } = useBooking();
  const Icon = serviceIconMap[service.icon];

  return (
    <div className="pt-28 sm:pt-36 md:pt-40 pb-16 sm:pb-24 bg-brand-bg min-h-screen relative overflow-x-hidden">
      <div className="absolute inset-0 bg-grid-blueprint bg-radial-fade pointer-events-none z-0" />
      <div className="absolute top-24 -left-20 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-brand-plum/15 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-24 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-brand-rose/10 blur-3xl pointer-events-none" />

      <section className="relative z-10 pb-14 sm:pb-20">
        <div className="site-container">
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex min-w-0 items-center gap-2 overflow-hidden text-[11px] font-mono font-bold uppercase tracking-wider text-gray-500"
          >
            <Link href="/" className="inline-flex items-center gap-1 hover:text-brand-rose-text transition-colors flex-shrink-0">
              <Home size={12} />
              Home
            </Link>
            <ChevronRight size={13} className="flex-shrink-0 text-gray-700" />
            <Link href="/services" className="hover:text-brand-rose-text transition-colors flex-shrink-0">
              Services
            </Link>
            <ChevronRight size={13} className="flex-shrink-0 text-gray-700" />
            <span className="truncate text-brand-rose-text min-w-0">{service.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.65 }}
              className="space-y-5 sm:space-y-6 min-w-0"
            >
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading text-brand-fg leading-tight">
                {service.title}
              </h1>
              <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl">
                {service.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    openBooking({
                      service: service.bookingService,
                      ctaLabel: "Request this service",
                      ctaLocation: "Service detail hero",
                    })
                  }
                  className="btn-primary px-7 sm:px-8 py-3.5 sm:py-4 shadow-lg shadow-brand-rose/25 flex items-center justify-center gap-2"
                >
                  Request This Service <ArrowRight size={16} />
                </button>
                <Link
                  href="/work"
                  className="btn-secondary px-7 sm:px-8 py-3.5 sm:py-4 flex items-center justify-center"
                >
                  View Our Work
                </Link>
              </div>
            </motion.div>

            <ServiceSignalVisual service={service} Icon={Icon} />
          </div>
        </div>
      </section>

      <section className="relative z-10 py-14 sm:py-20 border-t border-brand-rose/10">
        <div className="site-container grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-4 space-y-4">
            <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-brand-fg leading-tight">
              {service.overviewHeading}
            </h2>
          </div>
          <div className="lg:col-span-8 max-w-3xl space-y-4 text-gray-300 text-sm sm:text-base leading-relaxed">
            {service.overview.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-14 sm:py-20 bg-brand-card/90 border-y border-brand-rose/10">
        <div className="site-container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-10 sm:mb-12">
            <div className="space-y-4 max-w-2xl">
              <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-brand-fg">
                What this service covers
              </h2>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-md">
              Short, practical areas of work that match the existing service scope.
            </p>
          </div>

          <div className={`grid ${capabilityGridClass[service.visualVariant]} gap-4 sm:gap-5`}>
            {service.capabilities.map((capability, index) => (
              <motion.div
                key={capability}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.38, delay: index * 0.04 }}
                className="surface-card surface-card-hover rounded-2xl p-4 sm:p-5 min-h-[120px] flex flex-col justify-between gap-4"
              >
                <span className="font-mono text-[11px] font-bold text-brand-rose-text">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-sm sm:text-base font-semibold leading-snug text-brand-fg">
                  {capability}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-14 sm:py-20">
        <div className="site-container">
          <div className="max-w-3xl mb-10 sm:mb-12 space-y-4">
            <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-brand-fg">
              How the work moves
            </h2>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5" aria-label={`${service.title} process`}>
            {service.process.map((step, index) => (
              <motion.li
                key={step.title}
                initial={{ opacity: 0, y: index % 2 === 0 ? 18 : -18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-70px" }}
                transition={{ duration: 0.42, delay: index * 0.05 }}
                className="relative border border-brand-rose/15 border-t-white/10 rounded-2xl p-5 bg-brand-card/70 min-h-[210px]"
              >
                <span className="text-brand-rose-text font-mono text-xs font-black">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-8 text-base font-bold font-heading text-brand-fg">
                  {step.title}
                </h3>
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-gray-400">
                  {step.description}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {service.technologies.length > 0 && (
        <section className="relative z-10 py-14 sm:py-20 bg-brand-card/90 border-y border-brand-rose/10">
          <div className="site-container grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-4 space-y-4">
              <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-brand-fg">
                Relevant stack
              </h2>
            </div>
            <div className="lg:col-span-8 flex flex-wrap gap-2 sm:gap-3">
              {service.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-3.5 sm:px-4 py-2 rounded-xl bg-brand-bg border border-brand-rose/15 text-gray-300 font-mono text-xs hover:border-brand-rose/40 hover:text-brand-fg transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {relatedProjects.length > 0 && (
        <section className="relative z-10 py-14 sm:py-20">
          <div className="site-container">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-10 sm:mb-12">
              <div className="space-y-4 max-w-2xl">
                <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-brand-fg">
                  Relevant projects
                </h2>
              </div>
              <Link href="/work" className="btn-secondary px-6 py-3 w-fit">
                View All Work <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {relatedProjects.map((project) => (
                <Link
                  key={project.id}
                  href={getProjectUrl(project)}
                  className="surface-card surface-card-hover group relative rounded-3xl overflow-hidden flex flex-col h-full focus-visible:ring-2 focus-visible:ring-brand-rose-text focus-visible:outline-none"
                  aria-label={`View ${project.title} project profile`}
                >
                  <div className="h-44 sm:h-52 relative overflow-hidden">
                    <div className="absolute top-3 left-3 z-10 text-[10px] px-3 py-1 rounded-full bg-brand-bg/90 backdrop-blur border border-brand-rose/30 text-brand-rose-text font-bold uppercase tracking-wider font-mono">
                      {project.tag}
                    </div>
                    <img
                      src={resolveImageUrl(project)}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-card via-brand-card/20 to-transparent" />
                  </div>
                  <div className="p-5 sm:p-6 flex-grow space-y-3">
                    <h3 className="text-base sm:text-lg font-bold font-heading text-brand-fg group-hover:text-brand-rose-text transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                      {project.desc}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {faqSection}

      <section className="relative z-10 py-14 sm:py-20">
        <div className="site-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-10">
            {previousService && (
              <Link
                href={getServiceUrl(previousService)}
                className="surface-card surface-card-hover rounded-2xl p-5 sm:p-6 group focus-visible:ring-2 focus-visible:ring-brand-rose-text focus-visible:outline-none"
              >
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-gray-500">
                  Previous Service
                </span>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <h3 className="text-base sm:text-lg font-bold font-heading text-brand-fg group-hover:text-brand-rose-text transition-colors">
                    {previousService.title}
                  </h3>
                  <ArrowRight size={16} className="text-brand-rose-text rotate-180 flex-shrink-0" />
                </div>
              </Link>
            )}
            {nextService && (
              <Link
                href={getServiceUrl(nextService)}
                className="surface-card surface-card-hover rounded-2xl p-5 sm:p-6 group focus-visible:ring-2 focus-visible:ring-brand-rose-text focus-visible:outline-none"
              >
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-gray-500">
                  Next Service
                </span>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <h3 className="text-base sm:text-lg font-bold font-heading text-brand-fg group-hover:text-brand-rose-text transition-colors">
                    {nextService.title}
                  </h3>
                  <ArrowRight size={16} className="text-brand-rose-text flex-shrink-0" />
                </div>
              </Link>
            )}
          </div>

          <div className="surface-card rounded-3xl p-6 sm:p-10 md:p-12 border border-brand-rose/30 text-center max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-brand-rose/20 blur-2xl pointer-events-none" />
            <h2 className="text-xl sm:text-3xl font-black font-heading text-brand-fg">
              Have a project in mind?
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm mt-3 mb-6 max-w-xl mx-auto leading-relaxed">
              Share the service area, scope, and goals. We&apos;ll shape the next step around what the product actually needs.
            </p>
            <button
              type="button"
              onClick={() =>
                openBooking({
                  service: service.bookingService,
                  ctaLabel: "Request a discussion",
                  ctaLocation: "Service detail bottom CTA",
                })
              }
              className="btn-primary w-full sm:w-auto px-8 py-3.5 sm:py-4 text-xs uppercase tracking-wider shadow-lg shadow-brand-rose/25"
            >
              Request a Discussion
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function ServiceSignalVisual({ service, Icon }: { service: Service; Icon: LucideIcon }) {
  const nodes = visualNodes[service.visualVariant];
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.75, delay: 0.1 }}
      className="relative min-h-[320px] sm:min-h-[380px] lg:min-h-[440px]"
      aria-hidden="true"
    >
      <div className="absolute inset-6 rounded-full bg-brand-rose/15 blur-3xl" />
      <div className="surface-card rounded-3xl p-5 sm:p-7 h-full min-h-[320px] sm:min-h-[380px] lg:min-h-[440px] relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-blueprint opacity-60" />
        <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-brand-rose/35 to-transparent" />
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-brand-rose/25 to-transparent" />

        <div className="relative z-10 grid grid-cols-2 gap-3 sm:gap-4">
          <div className="col-span-2 rounded-2xl border border-brand-rose/25 bg-brand-bg/85 p-5 sm:p-6 flex items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-brand-rose-text">
                {service.tagline}
              </span>
              <p className="mt-2 text-sm sm:text-base font-bold font-heading text-brand-fg">
                {service.homeTitle}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-brand-rose/15 border border-brand-rose/30 shadow-sm shadow-brand-rose/20 flex-shrink-0">
              <Icon size={28} className="text-brand-rose-text" />
            </div>
          </div>

          {nodes.slice(1).map((node, index) => (
            <motion.div
              key={node}
              animate={
                prefersReducedMotion
                  ? { y: 0 }
                  : { y: index % 2 === 0 ? [0, -4, 0] : [0, 4, 0] }
              }
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 4 + index, repeat: Infinity, ease: "easeInOut" }
              }
              className="rounded-2xl border border-brand-rose/15 bg-brand-bg/70 p-4 min-h-[92px] flex flex-col justify-between"
            >
              <span className="text-[10px] font-mono font-bold text-gray-500">
                NODE {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-gray-200">
                {node}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 mt-5">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500 mb-2">
            <span>System Shape</span>
            <span>{nodes[0]}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden bg-brand-rose/10 border border-brand-rose/15">
            <motion.div
              initial={{ width: "28%" }}
              animate={
                prefersReducedMotion
                  ? { width: "48%" }
                  : { width: ["28%", "72%", "48%", "84%", "36%"] }
              }
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 7, repeat: Infinity, ease: "easeInOut" }
              }
              className="h-full rounded-full bg-gradient-to-r from-brand-plum to-brand-rose"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
