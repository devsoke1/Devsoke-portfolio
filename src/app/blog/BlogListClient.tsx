"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Calendar, Clock, ArrowRight } from "lucide-react";
import type { BlogPost } from "@/lib/blog/types";
import { resolveImageUrl } from "@/lib/media/resolve";

export default function BlogListClient({ posts }: { posts: BlogPost[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    "all",
    ...Array.from(new Set(posts.map((post) => post.category))).sort(),
  ];

  // Filter logic
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      post.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

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

      <div className="site-container relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading text-brand-fg leading-tight">
            Insights & <span className="text-brand-rose-text">Articles</span>
          </h1>
          <p className="text-gray-300 text-xs sm:text-base leading-relaxed">
            Technical guides, visual system design rules, and updates from the Devsoke engineering desk.
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-between mb-10 sm:mb-12 max-w-4xl mx-auto">
          {/* Categories */}
          <div className="flex overflow-x-auto no-scrollbar sm:flex-wrap gap-2 w-full sm:w-auto pb-1 scroll-smooth">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                aria-pressed={selectedCategory === cat}
                className={`px-4 py-2.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-brand-rose to-brand-plum border-brand-rose text-brand-fg shadow-md shadow-brand-rose/30"
                    : "border-brand-rose/20 hover:border-brand-rose/40 hover:bg-brand-rose/10 text-gray-300 hover:text-brand-fg bg-brand-card/70"
                }`}
              >
                {cat === "all" ? "All Posts" : cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <label htmlFor="blog-search" className="sr-only">
              Search articles
            </label>
            <input
              id="blog-search"
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-brand-card border border-brand-rose/20 focus:border-brand-rose focus:outline-none rounded-xl py-2.5 pl-10 pr-4 text-xs text-brand-fg placeholder:text-gray-500 shadow-sm transition-colors"
            />
            <Search className="absolute left-3.5 top-3 text-gray-400" size={14} />
          </div>
        </div>

        {/* Blog Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 sm:py-20 surface-card rounded-3xl border border-brand-rose/20 max-w-lg mx-auto p-6">
            <p className="text-gray-300 text-sm">No articles match your search criteria.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="mt-4 px-5 py-2 text-xs font-bold uppercase tracking-wider text-brand-rose-text hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post) => (
                <motion.div
                  layout
                  key={post.slug}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.3 }}
                  className="surface-card surface-card-hover group rounded-3xl overflow-hidden flex flex-col h-full"
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="h-48 relative overflow-hidden bg-brand-bg focus-visible:ring-2 focus-visible:ring-brand-rose-text focus-visible:outline-none"
                    aria-label={`Read ${post.title}`}
                  >
                    <div className="absolute top-3.5 left-3.5 z-10 text-[10px] px-3 py-1 rounded-full bg-brand-bg/90 backdrop-blur border border-brand-rose/30 text-brand-rose-text font-bold uppercase tracking-wider font-mono">
                      {post.category}
                    </div>
                    <img
                      src={resolveImageUrl(post)}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-card via-brand-card/20 to-transparent" />
                  </Link>

                  {/* Post Content details */}
                  <div className="p-5 sm:p-7 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      {/* Meta */}
                      <div className="flex items-center space-x-3 text-[10px] text-gray-400 font-mono font-semibold uppercase tracking-wider">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} className="text-brand-rose-text" />{" "}
                          {formatPublishDate(post.publishedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} className="text-brand-rose-text" /> {post.readTime}
                        </span>
                      </div>

                      <Link
                        href={`/blog/${post.slug}`}
                        className="block focus-visible:ring-2 focus-visible:ring-brand-rose-text focus-visible:outline-none"
                      >
                        <h3 className="text-base sm:text-lg font-bold font-heading text-brand-fg group-hover:text-brand-rose-text transition-colors leading-snug">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="text-gray-400 text-xs sm:text-sm leading-relaxed line-clamp-3">
                        {post.summary}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-brand-rose/10 mt-auto flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 rounded-full bg-brand-rose/20 border border-brand-rose/30 flex items-center justify-center text-[8px] font-bold text-brand-rose-text">
                          {post.author.charAt(0)}
                        </div>
                        <span className="text-[11px] text-gray-300 font-semibold">
                          {post.author.split(" ")[0]}
                        </span>
                      </div>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-rose-text hover:text-brand-fg transition-colors group"
                      >
                        <span>Read Post</span>
                        <ArrowRight
                          size={13}
                          className="group-hover:translate-x-1.5 transition-transform"
                        />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
