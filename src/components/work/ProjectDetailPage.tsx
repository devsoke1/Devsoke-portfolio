"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useBooking } from "@/context/BookingContext";
import type { Project, Service } from "@/lib/portfolio/types";
import { getProjectUrl, getServiceUrl } from "@/lib/portfolio/routes";
import { resolveImageUrl } from "@/lib/media/resolve";
import {
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Home,
} from "lucide-react";

interface ProjectDetailPageProps {
  project: Project;
  relatedServices: Service[];
  relatedProjects: Project[];
  previousProject: Project | null;
  nextProject: Project | null;
}

export default function ProjectDetailPage({
  project,
  relatedServices,
  relatedProjects,
  previousProject,
  nextProject,
}: ProjectDetailPageProps) {
  const { openBooking } = useBooking();
  const primaryService = relatedServices[0]?.bookingService || project.tag;
  const hasTimeline = project.timeline.trim().length > 0;
  const hasTech = project.tech.length > 0;

  return (
    <div className="pt-28 sm:pt-36 md:pt-40 pb-16 sm:pb-24 bg-brand-bg min-h-screen relative overflow-x-hidden">
      {/* Background blueprint grid with radial fade */}
      <div className="absolute inset-0 bg-grid-blueprint bg-radial-fade pointer-events-none z-0" />
      <div className="absolute top-24 -left-20 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-brand-plum/15 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-24 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-brand-rose/10 blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative z-10 pb-12 sm:pb-16">
        <div className="site-container">
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
            <Link href="/work" className="hover:text-brand-rose-text transition-colors flex-shrink-0">
              Work
            </Link>
            <ChevronRight size={13} className="flex-shrink-0 text-gray-700" />
            <span className="truncate text-brand-rose-text min-w-0">{project.title}</span>
          </nav>

          {/* Heading and Meta Strip */}
          <div className="max-w-4xl space-y-5 sm:space-y-6">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading text-brand-fg leading-tight">
              {project.title}
            </h1>
            <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl">
              {project.desc}
            </p>

            {/* Project Specs Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
              <div className="p-3.5 rounded-2xl bg-brand-card/90 border border-brand-rose/15">
                <span className="text-[10px] font-mono uppercase font-bold text-gray-500 block">Business</span>
                <span className="text-xs sm:text-sm font-semibold text-brand-fg mt-1 block truncate">
                  {project.client}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-brand-card/90 border border-brand-rose/15">
                <span className="text-[10px] font-mono uppercase font-bold text-gray-500 block">Category</span>
                <span className="text-xs sm:text-sm font-semibold text-brand-fg mt-1 block">
                  {project.tag}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-brand-card/90 border border-brand-rose/15 flex flex-col justify-center">
                {project.demoUrl ? (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-rose-text hover:text-brand-fg transition-colors"
                  >
                    <span>Visit Website</span>
                    <ExternalLink size={12} />
                  </a>
                ) : (
                  <span className="text-xs font-mono text-gray-500">Website link unavailable</span>
                )}
              </div>
            </div>
            {hasTimeline && (
              <div className="max-w-xs p-3.5 rounded-2xl bg-brand-card/90 border border-brand-rose/15">
                <span className="text-[10px] font-mono uppercase font-bold text-gray-500 block">Timeline</span>
                <span className="text-xs sm:text-sm font-semibold text-brand-fg mt-1 block">
                  {project.timeline}
                </span>
              </div>
            )}
          </div>

          {/* Featured Image */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-10 sm:mt-12 rounded-3xl overflow-hidden border border-brand-rose/25 shadow-2xl relative group bg-brand-card"
          >
            <div className="h-64 sm:h-96 md:h-[480px] w-full relative">
              <img
                src={resolveImageUrl(project)}
                alt={project.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/20 to-transparent" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Project Overview Section */}
      <section className="relative z-10 py-14 sm:py-20 border-t border-brand-rose/10">
        <div className="site-container grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-4 space-y-4">
            <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-brand-fg leading-tight">
              Project Overview
            </h2>
          </div>
          <div className="lg:col-span-8 max-w-3xl space-y-6 text-gray-300 text-sm sm:text-base leading-relaxed">
            <p>{project.longDesc}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
              <div className="surface-card rounded-2xl p-5 sm:p-6 space-y-3 border border-brand-rose/20">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-brand-rose-text">
                  Website Focus
                </span>
                <h3 className="text-base font-bold font-heading text-brand-fg">Audience and Content Needs</h3>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                  {project.challenge}
                </p>
              </div>

              <div className="surface-card rounded-2xl p-5 sm:p-6 space-y-3 border border-brand-rose/20">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-brand-rose-text">
                  Key Features
                </span>
                <h3 className="text-base font-bold font-heading text-brand-fg">Visible Website Features</h3>
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                  {project.solution}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {hasTech && (
        <section className="relative z-10 py-14 sm:py-20 bg-brand-card/90 border-y border-brand-rose/10">
          <div className="site-container grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-4 space-y-4">
              <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-brand-fg">
                Visible Technology Notes
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Shown only when the technology signal is confirmed in the project record.
              </p>
            </div>
            <div className="lg:col-span-8 flex flex-wrap gap-2.5 sm:gap-3">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-rose/20 text-gray-300 font-mono text-xs sm:text-sm hover:border-brand-rose/40 hover:text-brand-fg transition-colors"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related Services */}
      {relatedServices.length > 0 && (
        <section className="relative z-10 py-14 sm:py-20">
          <div className="site-container">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-10 sm:mb-12">
              <div className="space-y-4 max-w-2xl">
                <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-brand-fg">
                  Matching Service Offerings
                </h2>
              </div>
              <Link href="/services" className="btn-secondary px-6 py-3 w-fit">
                Explore All Services <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedServices.map((service) => (
                <Link
                  key={service.slug}
                  href={getServiceUrl(service)}
                  className="surface-card surface-card-hover rounded-2xl p-6 flex flex-col justify-between space-y-4 group focus-visible:ring-2 focus-visible:ring-brand-rose-text focus-visible:outline-none"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-rose-text">
                      {service.homeTitle}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold font-heading text-brand-fg group-hover:text-brand-rose-text transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                      {service.shortDescription}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1 text-xs font-bold text-brand-rose-text group-hover:text-brand-fg transition-colors pt-2">
                    <span>Learn more</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related Work */}
      {relatedProjects.length > 0 && (
        <section className="relative z-10 py-14 sm:py-20 bg-brand-card/90 border-y border-brand-rose/10">
          <div className="site-container">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-10 sm:mb-12">
              <div className="space-y-4 max-w-2xl">
                <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-brand-fg">
                  Other Selected Projects
                </h2>
              </div>
              <Link href="/work" className="btn-secondary px-6 py-3 w-fit">
                View All Work <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {relatedProjects.map((p) => (
                <Link
                  key={p.id}
                  href={getProjectUrl(p)}
                  className="surface-card surface-card-hover group relative rounded-3xl overflow-hidden flex flex-col h-full focus-visible:ring-2 focus-visible:ring-brand-rose-text focus-visible:outline-none"
                >
                  <div className="h-44 sm:h-52 relative overflow-hidden">
                    <div className="absolute top-3 left-3 z-10 text-[10px] px-3 py-1 rounded-full bg-brand-bg/90 backdrop-blur border border-brand-rose/30 text-brand-rose-text font-bold uppercase tracking-wider font-mono">
                      {p.tag}
                    </div>
                    <img
                      src={resolveImageUrl(p)}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-card via-brand-card/20 to-transparent" />
                  </div>
                  <div className="p-5 sm:p-6 flex-grow space-y-3">
                    <h3 className="text-base sm:text-lg font-bold font-heading text-brand-fg group-hover:text-brand-rose-text transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Adjacent Navigation & Final CTA */}
      <section className="relative z-10 py-14 sm:py-20">
        <div className="site-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-10">
            {previousProject && (
              <Link
                href={getProjectUrl(previousProject)}
                className="surface-card surface-card-hover rounded-2xl p-5 sm:p-6 group focus-visible:ring-2 focus-visible:ring-brand-rose-text focus-visible:outline-none"
              >
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-gray-500">
                  Previous Project
                </span>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <h3 className="text-base sm:text-lg font-bold font-heading text-brand-fg group-hover:text-brand-rose-text transition-colors">
                    {previousProject.title}
                  </h3>
                  <ArrowRight size={16} className="text-brand-rose-text rotate-180 flex-shrink-0" />
                </div>
              </Link>
            )}
            {nextProject && (
              <Link
                href={getProjectUrl(nextProject)}
                className="surface-card surface-card-hover rounded-2xl p-5 sm:p-6 group focus-visible:ring-2 focus-visible:ring-brand-rose-text focus-visible:outline-none"
              >
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-gray-500">
                  Next Project
                </span>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <h3 className="text-base sm:text-lg font-bold font-heading text-brand-fg group-hover:text-brand-rose-text transition-colors">
                    {nextProject.title}
                  </h3>
                  <ArrowRight size={16} className="text-brand-rose-text flex-shrink-0" />
                </div>
              </Link>
            )}
          </div>

          <div className="surface-card rounded-3xl p-6 sm:p-10 md:p-12 border border-brand-rose/30 text-center max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-brand-rose/20 blur-2xl pointer-events-none" />
            <h2 className="text-xl sm:text-3xl font-black font-heading text-brand-fg">
              Need a website with a similar level of clarity?
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm mt-3 mb-6 max-w-xl mx-auto leading-relaxed">
              Share the business, audience, and website goals so the next step can be scoped honestly.
            </p>
            <button
              type="button"
              onClick={() =>
                openBooking({
                  service: primaryService,
                  projectContext: project.title,
                  ctaLabel: "Discuss similar project",
                  ctaLocation: "Project detail bottom CTA",
                })
              }
              className="btn-primary w-full sm:w-auto px-8 py-3.5 sm:py-4 text-xs uppercase tracking-wider shadow-lg shadow-brand-rose/25"
            >
              Discuss Similar Project
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
