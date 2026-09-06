"use client";

import { useBooking } from "@/context/BookingContext";
import type { Project, Service, ServiceHomeIconName } from "@/lib/portfolio/types";
import { getProjectUrl, getServiceUrl } from "@/lib/portfolio/routes";
import { resolveImageUrl } from "@/lib/media/resolve";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart4,
  Cpu,
  Code2,
  Globe,
  LineChart,
  Search,
  ShoppingBag,
  BarChart3,
  Smartphone,
  Layers,
  TrendingUp,
  Activity,
  type LucideIcon,
} from "lucide-react";

// Dynamic import of 3D Canvas to prevent SSR issues
const Canvas3D = dynamic(() => import("@/components/ui/Canvas3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[300px] md:min-h-[480px] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-brand-rose border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

type HomeClientProps = {
  services: Service[];
  featuredProjects: Project[];
  faqSection?: ReactNode;
};

export default function HomeClient({
  services: portfolioServices,
  featuredProjects,
  faqSection,
}: HomeClientProps) {
  const { openBooking } = useBooking();
  const [activeTab, setActiveTab] = useState("analytics");

  const serviceIconMap: Record<ServiceHomeIconName, LucideIcon> = {
    Code2,
    Cpu,
    BarChart4,
    ShoppingBag,
    Smartphone,
    Layers,
    LineChart,
    Globe,
    BarChart3,
    Search,
  };

  // Mock Dashboard Demonstration Datasets
  const metrics = {
    analytics: {
      title: "Traffic Telemetry Component",
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      shortLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      data: [120, 240, 190, 480, 520, 310, 680],
      stat: "Active Stream Simulation",
      trend: "Real-time state demo",
    },
    ai: {
      title: "Neural Pipeline Load",
      labels: ["Llama-3", "Claude-3", "GPT-4o", "DeepSeek"],
      shortLabels: ["Llama3", "Claude3", "GPT-4o", "DeepSeek"],
      data: [92, 85, 78, 64],
      stat: "Distributed Dispatch",
      trend: "Dynamic token stream",
    },
    sales: {
      title: "Checkout Flow Telemetry",
      labels: ["Cart Adds", "Checkout", "Declined", "Successful"],
      shortLabels: ["Adds", "Check", "Decline", "Sales"],
      data: [450, 310, 12, 298],
      stat: "Multi-Step Funnel Demo",
      trend: "Simulated checkout cycle",
    },
  };

  const currentMetrics = metrics[activeTab as keyof typeof metrics];

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg relative overflow-x-hidden">
      {/* Background blueprint grid with radial fade */}
      <div className="absolute inset-0 bg-grid-blueprint bg-radial-fade pointer-events-none z-0" />

      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-28 sm:pt-36 md:pt-40 pb-12 sm:pb-16 overflow-hidden z-10">
        {/* Ambient Stage Lighting Glows */}
        <div className="absolute top-1/4 -left-20 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-brand-plum/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -right-20 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-brand-rose/15 blur-3xl pointer-events-none" />

        <div className="site-container py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center z-10">
          {/* Left Column: Heading, description, actions, and architecture highlights */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-5 sm:space-y-6 text-center lg:text-left"
          >
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading leading-[1.12] tracking-tight text-brand-fg">
              Software Websites & Apps <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-brand-rose via-brand-plum to-brand-fg bg-clip-text text-transparent">
                Built to Convert
              </span>
            </h1>

            <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
              Devsoke builds conversion-focused websites, software products, AI workflows, and dashboards for teams selling into the UK, UAE, and Europe.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4 justify-center lg:justify-start">
              <button
                type="button"
                onClick={() =>
                  openBooking({
                    ctaLabel: "Request a project discussion",
                    ctaLocation: "Home hero",
                  })
                }
                className="btn-primary px-7 sm:px-8 py-3.5 sm:py-4 shadow-lg shadow-brand-rose/25 hover:shadow-brand-rose/40 flex items-center justify-center gap-2"
              >
                Request a Project Discussion <ArrowRight size={16} />
              </button>
              <Link
                href="/work"
                className="btn-secondary px-7 sm:px-8 py-3.5 sm:py-4 flex items-center justify-center"
              >
                View Our Work
              </Link>
            </div>

            {/* Truthful Capabilities Matrix */}
            <div className="pt-6 sm:pt-8 border-t border-brand-rose/15 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 max-w-xl mx-auto lg:mx-0">
              <div className="p-2.5 rounded-xl bg-brand-card/90 border border-brand-rose/15 text-left">
                <span className="text-[10px] font-mono text-brand-rose-text font-bold block">Next.js & React</span>
                <span className="text-[11px] text-gray-300 font-medium">Modern Architecture</span>
              </div>
              <div className="p-2.5 rounded-xl bg-brand-card/90 border border-brand-rose/15 text-left">
                <span className="text-[10px] font-mono text-brand-rose-text font-bold block">Three.js & WebGL</span>
                <span className="text-[11px] text-gray-300 font-medium">Interactive 3D</span>
              </div>
              <div className="p-2.5 rounded-xl bg-brand-card/90 border border-brand-rose/15 text-left">
                <span className="text-[10px] font-mono text-brand-rose-text font-bold block">AI Integrations</span>
                <span className="text-[11px] text-gray-300 font-medium">Neural Workflows</span>
              </div>
              <div className="p-2.5 rounded-xl bg-brand-card/90 border border-brand-rose/15 text-left">
                <span className="text-[10px] font-mono text-brand-rose-text font-bold block">TypeScript & APIs</span>
                <span className="text-[11px] text-gray-300 font-medium">Full-Stack Systems</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: 3D Scene */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="w-full h-full flex items-center justify-center relative"
          >
            <Canvas3D />
          </motion.div>
        </div>
      </section>

      {/* 2. SERVICES BENTO GRID */}
      <section className="py-16 sm:py-20 md:py-24 relative border-t border-brand-rose/15 bg-brand-card/90 z-10">
        <div className="site-container relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
            <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-brand-fg">
              Our Core <span className="text-brand-rose-text">Services</span>
            </h2>
            <p className="text-gray-400 text-xs sm:text-base leading-relaxed">
              A breakdown of the modern digital solutions we architect to drive efficiency and visual excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {portfolioServices.map((srv, idx) => {
              const Icon = serviceIconMap[srv.homeIcon];

              return (
              <motion.div
                key={srv.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className={`h-full ${srv.homeGridClass}`}
              >
                <Link
                  href={getServiceUrl(srv)}
                  className="surface-card surface-card-hover p-6 sm:p-7 md:p-8 rounded-3xl flex flex-col justify-between h-full relative overflow-hidden group focus-visible:ring-2 focus-visible:ring-brand-rose-text focus-visible:outline-none"
                >
                  {/* Numbered index top-right */}
                  <div className="absolute top-6 right-6 font-mono text-xs font-bold text-gray-500 group-hover:text-brand-rose-text transition-colors">
                    {"// " + String(idx + 1).padStart(2, "0")}
                  </div>

                  <div className="space-y-4">
                    <div className="p-3 bg-brand-rose/15 rounded-2xl w-fit border border-brand-rose/30 shadow-sm shadow-brand-rose/20 group-hover:scale-105 transition-transform">
                      <Icon className="text-brand-rose-text" size={24} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold font-heading text-brand-fg group-hover:text-brand-rose-text transition-colors">{srv.homeTitle}</h3>
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">{srv.shortDescription}</p>
                  </div>
                  <div className="pt-6 mt-auto inline-flex items-center gap-1.5 text-xs font-bold text-brand-rose-text group-hover:text-brand-fg transition-colors">
                    <span>Learn more</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </Link>
              </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. SHOWCASE MOCK DASHBOARD SECTION */}
      <section className="py-16 sm:py-20 md:py-24 relative overflow-hidden bg-brand-bg border-t border-brand-rose/10 z-10">
        <div className="absolute top-1/2 left-1/4 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-brand-plum/10 blur-3xl pointer-events-none" />
        
        <div className="site-container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
            {/* Left text */}
            <div className="lg:col-span-2 space-y-5 sm:space-y-6">
              <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-brand-fg leading-tight">
                Enterprise SaaS <br />& <span className="text-brand-rose-text">Dashboards</span>
              </h2>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                We design custom administrative portals and analytics interfaces equipped with fluid data models. Below is an interactive demonstration of our data visualization components:
              </p>
              
              {/* Tab Toggles */}
              <div className="flex flex-col space-y-2 pt-1">
                {[
                  { id: "analytics", label: "Traffic Telemetry", badge: "Live Demo" },
                  { id: "ai", label: "Neural Pipeline Load", badge: "AI Cluster" },
                  { id: "sales", label: "Checkout Flow Rate", badge: "Ecommerce" },
                ].map((tab) => (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    aria-pressed={activeTab === tab.id}
                    className={`text-left px-4 py-3 sm:py-3.5 rounded-2xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-between ${
                      activeTab === tab.id
                        ? "bg-brand-rose/20 border-brand-rose text-brand-fg shadow-md shadow-brand-rose/15"
                        : "border-brand-rose/15 hover:border-brand-rose/30 hover:bg-brand-rose/5 text-gray-400 bg-brand-card"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-brand-card border border-brand-rose/20 text-gray-300">
                      {tab.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Dashboard Widget */}
            <div className="lg:col-span-3">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                className="surface-card rounded-3xl p-5 sm:p-7 md:p-8 shadow-xl relative overflow-hidden"
              >
                {/* Console Header Bar with macOS traffic dots */}
                <div className="flex items-center justify-between border-b border-brand-rose/15 pb-4 mb-5 sm:mb-6">
                  <div className="flex items-center space-x-2.5">
                    <div className="flex items-center space-x-1.5 pr-2 border-r border-brand-rose/15">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-xs font-bold font-heading uppercase tracking-widest text-brand-rose-text truncate max-w-[180px] sm:max-w-none">
                      {currentMetrics.title}
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-400 font-mono flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> UI DEMO
                  </span>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-5 sm:mb-6">
                  <div className="bg-brand-bg border border-brand-rose/15 p-3.5 sm:p-4 rounded-2xl">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block font-mono">Component State</span>
                    <span className="text-sm sm:text-base font-bold font-heading text-brand-fg flex items-center gap-1.5 mt-1 truncate">
                      <Activity size={16} className="text-brand-rose-text flex-shrink-0" /> {currentMetrics.stat}
                    </span>
                  </div>
                  <div className="bg-brand-bg border border-brand-rose/15 p-3.5 sm:p-4 rounded-2xl">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block font-mono">Visualization Type</span>
                    <span className="text-sm sm:text-base font-bold font-heading text-brand-rose-text flex items-center gap-1.5 mt-1 truncate">
                      <TrendingUp size={16} className="flex-shrink-0" /> {currentMetrics.trend}
                    </span>
                  </div>
                </div>

                {/* Visual Graph Mockup */}
                <div className="space-y-3">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block font-mono">Telemetry Data Visualization</span>
                  <div className="h-44 sm:h-48 flex items-end justify-between gap-1.5 sm:gap-3 pt-6 px-2 sm:px-4 bg-brand-bg border border-brand-rose/15 rounded-2xl relative">
                    {/* Bars */}
                    {currentMetrics.data.map((val, idx) => {
                      const maxVal = Math.max(...currentMetrics.data);
                      const heightPercent = maxVal > 0 ? (val / maxVal) * 76 + 14 : 14;
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center group relative z-10 h-full justify-end">
                          {/* Tooltip on hover */}
                          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform origin-bottom text-[10px] px-2 py-0.5 rounded-md bg-brand-rose text-brand-fg font-mono pointer-events-none z-20 whitespace-nowrap shadow-lg">
                            {currentMetrics.labels[idx]}: {val}
                          </div>
                          {/* Bar */}
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPercent}%` }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            className="w-full max-w-[36px] rounded-t-lg bg-gradient-to-t from-brand-plum to-brand-rose shadow-sm shadow-brand-rose/10 group-hover:from-brand-rose group-hover:to-brand-fg transition-colors"
                          />
                          {/* Label (Responsive) */}
                          <span className="text-[8px] sm:text-[10px] text-gray-400 font-mono mt-2 truncate w-full text-center">
                            <span className="sm:hidden">{currentMetrics.shortLabels[idx]}</span>
                            <span className="hidden sm:inline">{currentMetrics.labels[idx]}</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. RECENT PROJECTS TEASER */}
      <section className="py-16 sm:py-20 md:py-24 relative bg-brand-card/90 border-t border-brand-rose/15 z-10">
        <div className="site-container relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-brand-fg">
                Recent <span className="text-brand-rose-text">Projects</span>
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm max-w-lg">
                Explore real website projects across restaurants, repair services, and e-commerce storefronts.
              </p>
            </div>
            <Link
              href="/work"
              className="btn-secondary px-6 py-3.5 flex items-center gap-2 w-fit"
            >
              See All Work <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {featuredProjects.map((proj, idx) => (
              <motion.div
                key={proj.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="surface-card surface-card-hover group relative rounded-3xl overflow-hidden flex flex-col h-full"
              >
                <Link
                  href={getProjectUrl(proj)}
                  className="h-48 sm:h-52 overflow-hidden relative focus-visible:ring-2 focus-visible:ring-brand-rose-text focus-visible:outline-none"
                  aria-label={`View ${proj.title} project profile`}
                >
                  <div className="absolute top-3 left-3 z-10 text-[10px] px-3 py-1 rounded-full bg-brand-bg/90 backdrop-blur border border-brand-rose/30 text-brand-rose-text font-bold uppercase tracking-wider font-mono">
                    {proj.tag}
                  </div>
                  <img
                    src={resolveImageUrl(proj)}
                    alt={proj.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-card via-brand-card/20 to-transparent" />
                </Link>
                
                {/* Project Content */}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-brand-rose-text font-bold uppercase tracking-widest block font-mono">
                      {proj.tag}
                    </span>
                    <Link
                      href={getProjectUrl(proj)}
                      className="block focus-visible:ring-2 focus-visible:ring-brand-rose-text focus-visible:outline-none"
                    >
                    <h3 className="text-base sm:text-lg font-bold font-heading text-brand-fg group-hover:text-brand-rose-text transition-colors">
                      {proj.title}
                    </h3>
                    </Link>
                  </div>
                  <div className="pt-5 mt-auto">
                    <Link
                      href={getProjectUrl(proj)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-fg group-hover:text-brand-rose-text group-hover:gap-2.5 transition-all"
                    >
                      Project profile <ArrowRight size={13} className="text-brand-rose-text" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {faqSection}

      {/* 5. INTERACTIVE BOOKING CTA SECTION */}
      <section className="py-16 sm:py-20 md:py-24 relative overflow-hidden bg-brand-bg border-t border-brand-rose/10 z-10">
        {/* Ambient Glow behind CTA */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-[500px] h-80 sm:h-[500px] rounded-full bg-brand-rose/10 blur-3xl pointer-events-none" />

        <div className="site-container max-w-5xl relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="surface-card rounded-3xl p-6 sm:p-10 md:p-14 border border-brand-rose/30 text-center relative overflow-hidden shadow-xl"
          >
            {/* Ambient Corner Highlights */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-brand-rose/15 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-brand-plum/15 blur-2xl pointer-events-none" />

            <div className="max-w-2xl mx-auto space-y-5 sm:space-y-6 relative z-10">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black font-heading leading-tight tracking-wide text-brand-fg">
                Let&apos;s Craft the <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-brand-rose to-brand-fg bg-clip-text text-transparent">
                  Future of Your Business
                </span>
              </h2>
              <p className="text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed">
                Whether you need a cutting-edge 3D showcase web app, real-time metrics telemetry, customized AI automation pipeline, or custom software - we turn your concepts into clean high-end engineering.
              </p>
              <div className="pt-2 sm:pt-4">
                <button
                  type="button"
                  onClick={() =>
                    openBooking({
                      ctaLabel: "Request a strategy call",
                      ctaLocation: "Home bottom CTA",
                    })
                  }
                  className="btn-primary w-full sm:w-auto px-8 sm:px-10 py-4 text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-brand-rose/25 hover:shadow-brand-rose/40"
                >
                  Request a Strategy Call
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
