"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useBooking } from "@/context/BookingContext";
import type { Project, Service } from "@/lib/portfolio/types";
import { getServiceUrl, getProjectUrl } from "@/lib/portfolio/routes";
import { resolveImageUrl } from "@/lib/media/resolve";
import {
  ArrowRight,
  ChevronRight,
  Code2,
  Home,
  ShieldCheck,
  Terminal,
  Workflow,
  Zap,
} from "lucide-react";

type AboutClientProps = {
  services: Service[];
  featuredProjects: Project[];
  faqSection?: ReactNode;
};

export default function AboutClient({
  services,
  featuredProjects,
  faqSection,
}: AboutClientProps) {
  const { openBooking } = useBooking();

  const coreStack = [
    { category: "Frontend & Interface", tools: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion", "Three.js / WebGL"] },
    { category: "Backend & Systems", tools: ["Node.js", "Python", "FastAPI", "Express.js", "GraphQL", "WebSockets"] },
    { category: "Data & Cloud Infrastructure", tools: ["PostgreSQL", "Redis", "Pinecone", "MongoDB", "AWS S3", "Docker"] },
    { category: "AI & Model Workflows", tools: ["LangChain", "OpenAI API", "PyTorch", "Hugging Face", "Vector Embeddings"] },
  ];

  const studioPillars = [
    {
      icon: Code2,
      title: "Modular Engineering Backbone",
      desc: "Every system is built with typed contracts, clean boundaries, and reusable component hierarchies so applications can scale without becoming brittle.",
    },
    {
      icon: Zap,
      title: "Performance by Default",
      desc: "We prioritize Server-Side Rendering, edge caching, minimal client bundle weight, and smooth GPU-accelerated motion over unnecessary complexity.",
    },
    {
      icon: ShieldCheck,
      title: "Pragmatic Architecture",
      desc: "We select frameworks and databases based on real product constraints, avoiding over-engineering while ensuring clear migration paths.",
    },
    {
      icon: Workflow,
      title: "End-to-End Precision",
      desc: "From initial layout wireframing and state modeling to cross-device QA and static route optimization, every detail is engineered with care.",
    },
  ];

  return (
    <div className="pt-28 sm:pt-36 md:pt-40 pb-16 sm:pb-24 bg-brand-bg min-h-screen relative overflow-x-hidden">
      {/* Blueprint Grid & Lighting */}
      <div className="absolute inset-0 bg-grid-blueprint bg-radial-fade pointer-events-none z-0" />
      <div className="absolute top-24 -left-20 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-brand-plum/15 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-24 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-brand-rose/10 blur-3xl pointer-events-none" />

      {/* 1. Hero Section */}
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
            <span className="truncate text-brand-rose-text min-w-0">About</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)] gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.65 }}
              className="space-y-5 sm:space-y-6"
            >
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading text-brand-fg leading-tight">
                About <span className="text-brand-rose-text">Devsoke</span>
              </h1>
              <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl">
                Devsoke is a digital engineering and design studio specializing in modern web applications, interactive 3D experiences, AI workflows, and operational telemetry dashboards.
              </p>
              <p className="text-gray-400 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl">
                We combine front-end craft with disciplined system architecture to build products that look distinctive, load rapidly, and remain maintainable as user demand grows.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    openBooking({
                      ctaLabel: "About hero project discussion",
                      ctaLocation: "About hero",
                    })
                  }
                  className="btn-primary px-7 sm:px-8 py-3.5 sm:py-4 shadow-lg shadow-brand-rose/25 flex items-center justify-center gap-2"
                >
                  Request Project Discussion <ArrowRight size={16} />
                </button>
                <Link
                  href="/work"
                  className="btn-secondary px-7 sm:px-8 py-3.5 sm:py-4 flex items-center justify-center"
                >
                  View Project Profiles
                </Link>
              </div>
            </motion.div>

            {/* Abstract Visual Grid Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.75, delay: 0.1 }}
              className="surface-card rounded-3xl p-6 sm:p-8 border border-brand-rose/25 shadow-2xl relative overflow-hidden"
              aria-hidden="true"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-brand-rose/15 blur-2xl pointer-events-none" />
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-brand-rose/15">
                  <div className="flex items-center gap-2">
                    <Terminal size={16} className="text-brand-rose-text" />
                    <span className="text-xs font-mono font-bold text-gray-300">STUDIO MANIFEST</span>
                  </div>
                  <span className="text-[10px] font-mono text-brand-rose-text font-bold">Devsoke system</span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-brand-bg/80 border border-brand-rose/15 flex justify-between items-center">
                    <span className="text-gray-400">Core Focus</span>
                    <span className="text-brand-fg font-semibold">Web / 3D / AI / SaaS</span>
                  </div>
                  <div className="p-3 rounded-xl bg-brand-bg/80 border border-brand-rose/15 flex justify-between items-center">
                    <span className="text-gray-400">Design Standard</span>
                    <span className="text-brand-rose-text font-semibold">Dark Rose Aesthetic</span>
                  </div>
                  <div className="p-3 rounded-xl bg-brand-bg/80 border border-brand-rose/15 flex justify-between items-center">
                    <span className="text-gray-400">Architecture</span>
                    <span className="text-brand-fg font-semibold">Modular & Typed</span>
                  </div>
                  <div className="p-3 rounded-xl bg-brand-bg/80 border border-brand-rose/15 flex justify-between items-center">
                    <span className="text-gray-400">Deployment</span>
                    <span className="text-gray-300 font-semibold">Database-backed Routes</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Studio Pillars / Philosophy */}
      <section className="relative z-10 py-14 sm:py-20 border-t border-brand-rose/10 bg-brand-card/90">
        <div className="site-container">
          <div className="max-w-3xl mb-10 sm:mb-12 space-y-4">
            <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-brand-fg">
              How We Approach Software
            </h2>
            <p className="text-gray-300 text-xs sm:text-base leading-relaxed">
              We focus on building reliable software with clean abstractions rather than pursuing ephemeral hype or bloated toolchains.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {studioPillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="surface-card surface-card-hover rounded-2xl p-6 sm:p-7 space-y-3"
                >
                  <div className="p-3 bg-brand-rose/15 rounded-xl w-fit border border-brand-rose/30">
                    <Icon size={22} className="text-brand-rose-text" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold font-heading text-brand-fg">
                    {pillar.title}
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                    {pillar.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Core Capabilities Grid */}
      <section className="relative z-10 py-14 sm:py-20">
        <div className="site-container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-10 sm:mb-12">
            <div className="space-y-4 max-w-2xl">
              <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-brand-fg">
                Dedicated Service Offerings
              </h2>
            </div>
            <Link href="/services" className="btn-secondary px-6 py-3 w-fit">
              View All Services <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {services.map((srv) => (
              <Link
                key={srv.slug}
                href={getServiceUrl(srv)}
                className="surface-card surface-card-hover rounded-2xl p-6 flex flex-col justify-between space-y-4 group focus-visible:ring-2 focus-visible:ring-brand-rose-text focus-visible:outline-none"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-rose-text">
                    {srv.tagline}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold font-heading text-brand-fg group-hover:text-brand-rose-text transition-colors">
                    {srv.title}
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                    {srv.shortDescription}
                  </p>
                </div>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-brand-rose-text group-hover:text-brand-fg transition-colors pt-2">
                  <span>Explore service</span>
                  <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Technology Foundation */}
      <section className="relative z-10 py-14 sm:py-20 bg-brand-card/90 border-y border-brand-rose/10">
        <div className="site-container">
          <div className="max-w-3xl mb-10 sm:mb-12 space-y-4">
            <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-brand-fg">
              Tools We Rely On
            </h2>
            <p className="text-gray-300 text-xs sm:text-base leading-relaxed">
              Our engineering stack is chosen for stability, developer ergonomics, and high execution speed across both client and server environments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coreStack.map((group) => (
              <div key={group.category} className="surface-card rounded-2xl p-6 space-y-4 border border-brand-rose/20">
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-brand-rose-text">
                  {group.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {group.tools.map((tool) => (
                    <span
                      key={tool}
                      className="px-3 py-1.5 rounded-lg bg-brand-bg border border-brand-rose/15 text-gray-300 font-mono text-xs hover:border-brand-rose/40 hover:text-brand-fg transition-colors"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Selected Work Showcase */}
      <section className="relative z-10 py-14 sm:py-20">
        <div className="site-container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-10 sm:mb-12">
            <div className="space-y-4 max-w-2xl">
              <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-brand-fg">
                Featured Project Profiles
              </h2>
            </div>
            <Link href="/work" className="btn-secondary px-6 py-3 w-fit">
              View All Work <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {featuredProjects.map((p) => (
              <Link
                key={p.slug}
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

      {faqSection}

      {/* 6. Final CTA */}
      <section className="relative z-10 py-14 sm:py-20 border-t border-brand-rose/10">
        <div className="site-container">
          <div className="surface-card rounded-3xl p-6 sm:p-10 md:p-12 border border-brand-rose/30 text-center max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-brand-rose/20 blur-2xl pointer-events-none" />
            <h2 className="text-xl sm:text-3xl font-black font-heading text-brand-fg">
              Have a project in mind?
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm mt-3 mb-6 max-w-xl mx-auto leading-relaxed">
              Whether you need a custom 3D web experience, a resilient SaaS dashboard, or an AI pipeline integration, let&apos;s discuss the architecture.
            </p>
            <button
              type="button"
              onClick={() =>
                openBooking({
                  ctaLabel: "About bottom discovery call",
                  ctaLocation: "About bottom CTA",
                })
              }
              className="btn-primary w-full sm:w-auto px-8 py-3.5 sm:py-4 text-xs uppercase tracking-wider shadow-lg shadow-brand-rose/25"
            >
              Request Discovery Call
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
