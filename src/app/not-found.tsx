import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="pt-28 sm:pt-36 md:pt-40 pb-16 sm:pb-24 bg-brand-bg min-h-screen relative flex items-center justify-center overflow-x-hidden">
      {/* Background blueprint grid */}
      <div className="absolute inset-0 bg-grid-blueprint bg-radial-fade pointer-events-none z-0" />
      <div className="absolute top-1/4 -left-20 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-brand-plum/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-brand-rose/15 blur-3xl pointer-events-none" />

      <div className="site-container relative z-10 text-center max-w-2xl mx-auto space-y-6">
        <div className="space-y-3">
          <h1 className="text-6xl sm:text-8xl font-black font-heading text-brand-fg tracking-tight">
            4<span className="text-brand-rose-text">0</span>4
          </h1>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-gray-200">
            Page Not Found
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm md:text-base leading-relaxed max-w-md mx-auto">
            The route or resource you requested could not be located on this server. It may have been moved, renamed, or does not exist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            href="/"
            className="btn-primary w-full sm:w-auto px-7 py-3.5 text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-rose/25"
          >
            <Home size={14} /> Return to Home
          </Link>
          <Link
            href="/services"
            className="btn-secondary w-full sm:w-auto px-7 py-3.5 text-xs flex items-center justify-center gap-2"
          >
            Explore Services <ArrowRight size={14} />
          </Link>
          <Link
            href="/contact"
            className="btn-secondary w-full sm:w-auto px-7 py-3.5 text-xs flex items-center justify-center gap-2"
          >
            Contact Devsoke
          </Link>
          <Link
            href="/work"
            className="btn-secondary w-full sm:w-auto px-7 py-3.5 text-xs flex items-center justify-center gap-2"
          >
            View Work
          </Link>
        </div>
      </div>
    </div>
  );
}
