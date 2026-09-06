"use client";

import Link from "next/link";
import { useBooking } from "@/context/BookingContext";
import type { Project } from "@/lib/portfolio/types";
import { getProjectUrl } from "@/lib/portfolio/routes";
import { resolveImageUrl } from "@/lib/media/resolve";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, X, Code, Eye, ArrowRight } from "lucide-react";

const categoryServiceMap: Record<string, string> = {
  web: "Web Development",
  ai: "AI Integration & Development",
  dashboard: "Company Dashboards",
  ecommerce: "E-commerce Development",
  mobile: "Mobile App Development",
  saas: "Custom Software & SaaS Tools",
  restaurants: "Web Development",
  "repair-local-services": "Web Development",
};

const categoryLabels: Record<string, string> = {
  web: "Web Apps",
  ai: "AI systems",
  dashboard: "Dashboards & SaaS",
  ecommerce: "E-commerce",
  mobile: "Mobile",
  saas: "SaaS",
  restaurants: "Restaurants",
  "repair-local-services": "Repair & Local Services",
};

function getCategoryLabel(category: string) {
  return categoryLabels[category] || category;
}

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export default function WorkPageClient({ projects }: { projects: Project[] }) {
  const { openBooking } = useBooking();
  const [filter, setFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const categories = [
    { id: "all", label: "All Work" },
    ...Array.from(new Set(projects.map((project) => project.category))).map((category) => ({
      id: category,
      label: getCategoryLabel(category),
    })),
  ];

  const filteredProjects = projects.filter(
    (p) => filter === "all" || p.category === filter
  );

  const getProjectBookingService = (project: Project) =>
    categoryServiceMap[project.category] || project.tag;

  useEffect(() => {
    if (!selectedProject) return undefined;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => previewRef.current?.focus(), 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setSelectedProject(null);
        return;
      }

      if (event.key !== "Tab" || !previewRef.current) return;

      const focusableElements = Array.from(
        previewRef.current.querySelectorAll<HTMLElement>(focusableSelector)
      ).filter((element) => element.offsetParent !== null);

      if (focusableElements.length === 0) {
        event.preventDefault();
        previewRef.current.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [selectedProject]);

  return (
    <div className="pt-28 sm:pt-36 md:pt-40 pb-16 sm:pb-24 bg-brand-bg min-h-screen relative overflow-x-hidden">
      {/* Background blueprint grid with radial fade */}
      <div className="absolute inset-0 bg-grid-blueprint bg-radial-fade pointer-events-none z-0" />

      {/* Ambient Lighting */}
      <div className="absolute top-10 -right-20 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-brand-rose/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-20 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-brand-plum/15 blur-3xl pointer-events-none" />

      <div className="site-container relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading text-brand-fg leading-tight">
            Selected <span className="text-brand-rose-text">Work</span>
          </h1>
          <p className="text-gray-300 text-xs sm:text-base leading-relaxed">
            Real website projects across restaurant, repair, local-service, and e-commerce surfaces.
          </p>
        </div>

        {/* Responsive Filters: Horizontal Scroll on Mobile */}
        <div className="flex overflow-x-auto no-scrollbar sm:flex-wrap justify-start sm:justify-center gap-2 mb-10 sm:mb-12 pb-2 px-1 scroll-smooth">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilter(cat.id)}
              aria-pressed={filter === cat.id}
              className={`px-4 sm:px-5 py-2.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase transition-all whitespace-nowrap flex-shrink-0 border ${
                filter === cat.id
                  ? "bg-gradient-to-r from-brand-rose to-brand-plum border-brand-rose text-brand-fg shadow-lg shadow-brand-rose/30"
                  : "border-brand-rose/20 hover:border-brand-rose/40 hover:bg-brand-rose/10 text-gray-300 hover:text-brand-fg bg-brand-card/70"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((proj) => (
              <motion.div
                layout
                key={proj.slug}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.3 }}
                className="surface-card surface-card-hover group rounded-3xl overflow-hidden flex flex-col h-full"
              >
                <Link
                  href={getProjectUrl(proj)}
                  className="h-48 sm:h-52 relative overflow-hidden focus-visible:ring-2 focus-visible:ring-brand-rose-text focus-visible:outline-none"
                  aria-label={`View ${proj.title} project profile`}
                >
                  <div className="absolute top-3.5 left-3.5 z-10 text-[10px] px-3 py-1 rounded-full bg-brand-bg/90 backdrop-blur border border-brand-rose/30 text-brand-rose-text font-bold uppercase tracking-wider font-mono">
                    {proj.tag}
                  </div>
                  <img
                    src={resolveImageUrl(proj)}
                    alt={proj.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-card via-brand-card/20 to-transparent" />
                </Link>

                {/* Content */}
                <div className="p-5 sm:p-7 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <Link
                      href={getProjectUrl(proj)}
                      className="block focus-visible:ring-2 focus-visible:ring-brand-rose-text focus-visible:outline-none"
                    >
                    <h3 className="text-base sm:text-lg font-bold font-heading text-brand-fg group-hover:text-brand-rose-text transition-colors">
                      {proj.title}
                    </h3>
                    </Link>
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">{proj.desc}</p>
                  </div>

                  <div className="space-y-4 pt-2">
                    {proj.tech.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {proj.tech.slice(0, 3).map((t) => (
                          <span key={t} className="text-[10px] px-2.5 py-1 rounded-lg bg-brand-bg border border-brand-rose/15 text-gray-300 font-mono">
                            {t}
                          </span>
                        ))}
                        {proj.tech.length > 3 && (
                          <span className="text-[10px] px-2.5 py-1 rounded-lg bg-brand-bg border border-brand-rose/15 text-gray-400 font-mono">
                            +{proj.tech.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* View Action Links */}
                    <div className="flex gap-2">
                      <Link
                        href={getProjectUrl(proj)}
                        className="btn-secondary flex-1 py-3 text-xs flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        Project Profile <ArrowRight size={13} />
                      </Link>
                      {proj.demoUrl && (
                        <a
                          href={proj.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary flex-1 py-3 text-xs flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          Visit Website <ExternalLink size={13} />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedProject(proj)}
                        className="p-3 rounded-xl border border-brand-rose/20 bg-brand-bg hover:bg-brand-rose/10 text-gray-300 hover:text-brand-fg transition-colors"
                        title="Quick preview"
                        aria-label={`Quick preview for ${proj.title}`}
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* CTA bottom */}
        <div className="mt-16 sm:mt-20 text-center">
          <div className="surface-card rounded-3xl p-6 sm:p-10 md:p-12 border border-brand-rose/30 max-w-3xl mx-auto shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-brand-rose/20 blur-2xl pointer-events-none" />
            <h3 className="text-xl sm:text-2xl font-black font-heading text-brand-fg">Have a website project in mind?</h3>
            <p className="text-gray-300 text-xs sm:text-sm mt-2 mb-6 leading-relaxed">Let&apos;s coordinate on a practical next step around your business goals.</p>
            <button
              type="button"
              onClick={() =>
                openBooking({
                  ctaLabel: "Start strategy discussion",
                  ctaLocation: "Work index bottom CTA",
                })
              }
              className="btn-primary w-full sm:w-auto px-8 py-3.5 sm:py-4 text-xs uppercase tracking-wider shadow-lg shadow-brand-rose/25"
            >
              Start Strategy Discussion
            </button>
          </div>
        </div>
      </div>

      {/* Project preview overlay */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3.5 sm:p-6 overflow-y-auto">
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="fixed inset-0 cursor-default bg-brand-bg/90 backdrop-blur-md"
              aria-label="Close project preview"
            />

            <motion.div
              ref={previewRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-labelledby="work-preview-title"
              aria-describedby="work-preview-description"
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              className="surface-card relative w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-3xl border border-brand-rose/30 shadow-2xl z-10 my-auto"
            >
              {/* Image banner */}
              <div className="h-48 sm:h-60 relative w-full overflow-hidden">
                <img
                  src={resolveImageUrl(selectedProject)}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-card via-brand-card/40 to-transparent" />
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-3.5 right-3.5 p-2 bg-brand-bg/80 hover:bg-brand-bg text-gray-200 hover:text-brand-fg rounded-full border border-brand-rose/30 transition-all z-20 focus-visible:ring-2 focus-visible:ring-brand-rose-text"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
                <div className="absolute bottom-4 left-5 sm:left-6 right-5 sm:right-6">
                  <span className="text-[10px] px-3 py-1 rounded-full bg-brand-rose text-brand-fg font-extrabold uppercase tracking-widest block w-fit mb-1.5 shadow-sm font-mono">
                    {selectedProject.tag}
                  </span>
                  <h2 id="work-preview-title" className="text-xl sm:text-2xl font-bold font-heading text-brand-fg">
                    {selectedProject.title}
                  </h2>
                </div>
              </div>

              {/* Grid content details */}
              <div className="p-5 sm:p-7 md:p-8 space-y-5 sm:space-y-6 text-sm text-brand-fg">
                {/* Meta details strip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3.5 px-4 bg-brand-bg border border-brand-rose/15 rounded-2xl text-center">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-gray-400 font-mono">Business</span>
                    <span className="text-xs font-semibold text-gray-200 block truncate">
                      {selectedProject.client}
                    </span>
                  </div>
                  <div className="space-y-1 sm:border-l sm:border-brand-rose/15 py-1 sm:py-0">
                    <span className="text-[9px] uppercase font-bold text-gray-400 font-mono">Category</span>
                    <span className="text-xs font-semibold text-gray-200 block">
                      {getCategoryLabel(selectedProject.category)}
                    </span>
                  </div>
                </div>

                {/* Overviews */}
                <div className="space-y-2">
                  <h4 className="font-heading font-bold text-brand-rose-text flex items-center gap-2 text-sm">
                    <Code size={16} /> Project Overview
                  </h4>
                  <p
                    id="work-preview-description"
                    className="text-gray-300 text-xs sm:text-sm leading-relaxed"
                  >
                    {selectedProject.longDesc}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2 p-3.5 rounded-2xl bg-brand-bg/60 border border-brand-rose/15">
                    <h4 className="font-heading font-bold text-gray-300 text-xs sm:text-sm">Website Focus</h4>
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                      {selectedProject.challenge}
                    </p>
                  </div>
                  <div className="space-y-2 p-3.5 rounded-2xl bg-brand-bg/60 border border-brand-rose/15">
                    <h4 className="font-heading font-bold text-brand-fg text-xs sm:text-sm">Key Features</h4>
                    <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                      {selectedProject.solution}
                    </p>
                  </div>
                </div>

                {selectedProject.tech.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block font-mono">
                      Confirmed Technology Notes
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProject.tech.map((t) => (
                        <span key={t} className="px-3 py-1 bg-brand-bg border border-brand-rose/15 text-gray-300 font-mono text-xs rounded-lg">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Live Action button */}
                <div className="pt-4 border-t border-brand-rose/15 flex flex-col sm:flex-row justify-between gap-3">
                  <Link
                    href={getProjectUrl(selectedProject)}
                    onClick={() => setSelectedProject(null)}
                    className="btn-secondary w-full sm:w-auto py-3.5 px-6 flex items-center justify-center gap-2"
                  >
                    Full Project Profile <ArrowRight size={13} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProject(null);
                      openBooking({
                        service: getProjectBookingService(selectedProject),
                        projectContext: selectedProject.title,
                        ctaLabel: "Discuss similar build",
                        ctaLocation: "Work preview modal",
                      });
                    }}
                    className="btn-primary w-full sm:flex-1 py-3.5 text-center"
                  >
                    Discuss similar build
                  </button>
                  {selectedProject.demoUrl && (
                    <a
                      href={selectedProject.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary w-full sm:w-auto py-3.5 px-5 flex items-center justify-center gap-2"
                    >
                      Visit Website <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
