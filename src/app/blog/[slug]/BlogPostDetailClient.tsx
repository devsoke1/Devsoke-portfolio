"use client";

import Link from "next/link";
import { useBooking } from "@/context/BookingContext";
import {
  ArrowLeft,
  Calendar,
  Clock,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import type { BlogPost } from "@/lib/blog/types";
import MarkdownContent from "@/components/blog/MarkdownContent";
import { resolveImageUrl } from "@/lib/media/resolve";

interface BlogPostDetailClientProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
}

export default function BlogPostDetailClient({
  post,
  relatedPosts,
}: BlogPostDetailClientProps) {
  const { openBooking } = useBooking();

  const formatPublishDate = (dateString: string | null) => {
    if (!dateString) return "Recently published";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="pt-28 sm:pt-36 md:pt-40 pb-16 sm:pb-24 bg-brand-bg min-h-screen relative overflow-x-hidden">
      {/* Background blueprint grid with radial fade */}
      <div className="absolute inset-0 bg-grid-blueprint bg-radial-fade pointer-events-none z-0" />

      {/* Ambient Lighting */}
      <div className="absolute top-10 -left-20 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-brand-rose/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-brand-plum/15 blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-xs text-gray-400 mb-6 sm:mb-8 font-mono font-semibold uppercase tracking-wider">
          <Link href="/blog" className="hover:text-brand-rose-text transition-colors py-1">
            Newsroom
          </Link>
          <ChevronRight size={12} className="text-gray-600 flex-shrink-0" />
          <span className="text-brand-rose-text truncate max-w-[140px] sm:max-w-[280px]">
            {post.title}
          </span>
        </div>

        {/* Back Link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-gray-400 hover:text-brand-fg mb-6 transition-colors py-1"
        >
          <ArrowLeft size={14} /> Back to articles
        </Link>

        {/* Article Meta Header */}
        <div className="space-y-4 mb-8">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-brand-rose-text">
            {post.category}
          </p>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black font-heading text-brand-fg leading-[1.18]">
            {post.title}
          </h1>

          <div className="flex flex-wrap gap-3 sm:gap-4 items-center text-xs text-gray-400 border-y border-brand-rose/15 py-3.5 sm:py-4 mt-6">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-brand-rose/20 border border-brand-rose/30 flex items-center justify-center text-[10px] font-bold text-brand-rose-text">
                {post.author.charAt(0)}
              </div>
              <span className="font-semibold text-gray-200">{post.author}</span>
            </div>
            <div className="h-4 w-px bg-brand-rose/15 hidden sm:block" />
            <div className="flex items-center gap-1.5 font-mono">
              <Calendar size={13} className="text-brand-rose-text" />{" "}
              {formatPublishDate(post.publishedAt)}
            </div>
            <div className="h-4 w-px bg-brand-rose/15 hidden sm:block" />
            <div className="flex items-center gap-1.5 font-mono">
              <Clock size={13} className="text-brand-rose-text" /> {post.readTime}
            </div>
          </div>
        </div>

        {/* Article Featured Image */}
        <div className="w-full h-56 sm:h-80 md:h-96 rounded-3xl overflow-hidden mb-8 sm:mb-10 border border-brand-rose/20 shadow-2xl relative bg-brand-bg">
          <img
            src={resolveImageUrl(post)}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Article Content Rendered */}
        <article className="font-sans pb-10 sm:pb-12 border-b border-brand-rose/15">
          <MarkdownContent content={post.content} titleToOmit={post.title} />
        </article>

        {/* Related Articles Section (if available) */}
        {relatedPosts.length > 0 && (
          <div className="mt-12 sm:mt-16">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl sm:text-2xl font-bold font-heading text-brand-fg">
                Related Articles
              </h3>
              <Link
                href="/blog"
                className="text-xs font-mono text-brand-rose-text hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/blog/${rel.slug}`}
                  className="surface-card surface-card-hover group rounded-2xl p-4 flex flex-col justify-between h-full border border-brand-rose/15"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-brand-rose-text uppercase">
                      {rel.category}
                    </span>
                    <h4 className="text-sm font-bold font-heading text-brand-fg group-hover:text-brand-rose-text transition-colors line-clamp-2">
                      {rel.title}
                    </h4>
                  </div>
                  <div className="pt-3 mt-3 border-t border-brand-rose/10 flex items-center justify-between text-[10px] text-gray-400 font-mono">
                    <span>{rel.readTime}</span>
                    <span className="text-brand-rose-text group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Read <ArrowRight size={10} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA Block */}
        <div className="surface-card rounded-3xl p-6 sm:p-10 md:p-12 border border-brand-rose/30 text-center space-y-4 shadow-2xl mt-12 sm:mt-16 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-brand-rose/20 blur-2xl pointer-events-none" />
          <h4 className="font-heading font-bold text-xl sm:text-3xl text-brand-fg">
            Like what we build?
          </h4>
          <p className="text-gray-300 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            Devsoke turns complex product ideas into clean code, interactive 3D graphics, and automated business workflows.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() =>
                openBooking({
                  service:
                    post.category === "AI"
                      ? "AI Integration & Development"
                      : post.category === "Design"
                      ? "Web Design / UI-UX"
                      : "Web Development",
                  ctaLabel: "Blog article project CTA",
                  ctaLocation: `Blog article: ${post.slug}`,
                })
              }
              className="btn-primary w-full sm:w-auto px-8 py-3.5 text-xs shadow-lg shadow-brand-rose/25 inline-block"
            >
              Request a Project Discussion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
