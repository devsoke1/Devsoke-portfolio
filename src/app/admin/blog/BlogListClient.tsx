"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  FileEdit,
  FileText,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import AdminShell from "../_components/AdminShell";
import ConfirmSubmitButton from "../_components/ConfirmSubmitButton";
import { deleteBlogPostAction } from "./actions";
import type { AdminBlogPost, BlogStatus } from "@/lib/blog/types";

type AdminSummary = {
  email: string;
  name: string | null;
  role: "SUPER_ADMIN" | "ADMIN" | "EDITOR";
};

type BlogListClientProps = {
  admin: AdminSummary;
  posts: AdminBlogPost[];
};

export default function BlogListClient({ admin, posts }: BlogListClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.slug.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === "ALL" || post.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const countByStatus = {
    ALL: posts.length,
    PUBLISHED: posts.filter((p) => p.status === "PUBLISHED").length,
    DRAFT: posts.filter((p) => p.status === "DRAFT").length,
    ARCHIVED: posts.filter((p) => p.status === "ARCHIVED").length,
  };

  const getStatusBadge = (status: BlogStatus) => {
    switch (status) {
      case "PUBLISHED":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            Published
          </span>
        );
      case "DRAFT":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-400">
            Draft
          </span>
        );
      case "ARCHIVED":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-gray-500/15 border border-gray-500/30 text-gray-400">
            Archived
          </span>
        );
    }
  };

  return (
    <AdminShell admin={admin} active="blog">
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-rose/15 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black font-heading text-brand-fg flex items-center gap-2.5">
              <FileText className="text-brand-rose-text" size={26} />
              Newsroom & Blog CMS
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Manage articles, technical tutorials, and announcements live in PostgreSQL.
            </p>
          </div>

          <Link
            href="/admin/blog/new"
            className="btn-primary px-5 py-3 text-xs shadow-md shadow-brand-rose/25 inline-flex items-center gap-2 w-fit"
          >
            <Plus size={15} /> Write Article
          </Link>
        </div>

        {/* Filters & Search Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1">
            {(["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all border whitespace-nowrap ${
                  selectedStatus === st
                    ? "bg-brand-rose/15 border-brand-rose/40 text-brand-fg shadow-sm"
                    : "border-brand-rose/10 hover:border-brand-rose/25 bg-brand-card text-gray-400 hover:text-brand-fg"
                }`}
              >
                {st === "ALL" ? "All Posts" : st}{" "}
                <span className="text-[10px] text-brand-rose-text ml-1">
                  ({countByStatus[st]})
                </span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search by title, category, author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-brand-card border border-brand-rose/20 focus:border-brand-rose focus:outline-none rounded-xl py-2.5 pl-10 pr-4 text-xs text-brand-fg placeholder:text-gray-500"
            />
            <Search className="absolute left-3.5 top-3 text-gray-400" size={14} />
          </div>
        </div>

        {/* Posts Table / List */}
        {filteredPosts.length === 0 ? (
          <div className="surface-card rounded-2xl p-12 border border-brand-rose/20 text-center max-w-md mx-auto space-y-4">
            <p className="text-sm text-gray-300">No blog posts found matching your filter.</p>
            {posts.length === 0 ? (
              <Link
                href="/admin/blog/new"
                className="btn-primary px-5 py-2.5 text-xs inline-flex items-center gap-2"
              >
                <Plus size={14} /> Write First Article
              </Link>
            ) : (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedStatus("ALL");
                }}
                className="text-xs font-mono text-brand-rose-text hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="surface-card rounded-2xl border border-brand-rose/15 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-card text-gray-400 uppercase font-mono tracking-wider border-b border-brand-rose/15">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">Article</th>
                    <th className="py-3.5 px-4 font-bold">Category</th>
                    <th className="py-3.5 px-4 font-bold">Status</th>
                    <th className="py-3.5 px-4 font-bold">Author</th>
                    <th className="py-3.5 px-4 font-bold">Published</th>
                    <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-rose/10 text-gray-300">
                  {filteredPosts.map((post) => (
                    <tr
                      key={post.id}
                      className="hover:bg-brand-rose/5 transition-colors group"
                    >
                      {/* Title & Slug */}
                      <td className="py-4 px-4 max-w-xs sm:max-w-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-brand-bg flex-shrink-0 border border-brand-rose/15">
                            <img
                              src={post.image}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-brand-fg group-hover:text-brand-rose-text transition-colors truncate">
                              {post.title}
                            </h3>
                            <p className="text-[11px] font-mono text-gray-500 truncate">
                              /blog/{post.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 font-mono">
                        <span className="px-2 py-0.5 rounded bg-brand-bg border border-brand-rose/15 text-[10px] text-gray-300">
                          {post.category}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">{getStatusBadge(post.status)}</td>

                      {/* Author */}
                      <td className="py-4 px-4 text-gray-300 whitespace-nowrap">
                        {post.author}
                      </td>

                      {/* Publish Date */}
                      <td className="py-4 px-4 text-gray-400 font-mono text-[11px] whitespace-nowrap">
                        {post.publishedAt ? (
                          new Date(post.publishedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {post.status === "PUBLISHED" && (
                            <Link
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              title="View Public Post"
                              className="p-2 rounded-lg bg-brand-card border border-brand-rose/15 hover:border-brand-rose/40 text-gray-400 hover:text-brand-rose-text transition-colors"
                            >
                              <ExternalLink size={13} />
                            </Link>
                          )}
                          <Link
                            href={`/admin/blog/${post.id}/edit`}
                            title="Edit Post"
                            className="p-2 rounded-lg bg-brand-card border border-brand-rose/15 hover:border-brand-rose/40 text-gray-300 hover:text-brand-fg transition-colors"
                          >
                            <FileEdit size={13} />
                          </Link>
                          <form
                            action={async () => {
                              await deleteBlogPostAction(post.id);
                            }}
                          >
                            <ConfirmSubmitButton
                              message={`Are you sure you want to permanently delete "${post.title}"? This cannot be undone.`}
                              className="p-2 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900/60 transition-colors"
                            >
                              <Trash2 size={13} />
                            </ConfirmSubmitButton>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
