"use client";

import Link from "next/link";
import {
  Layers,
  PlusCircle,
  ChevronRight,
  FolderKanban,
  FileText,
  ExternalLink,
  Image as ImageIcon,
  Inbox,
  Lock,
  Mail,
} from "lucide-react";
import AdminShell from "../_components/AdminShell";
import type { AdminBlogPost, BlogStats } from "@/lib/blog/types";
import type { AdminInquiry, InquiryStats } from "@/lib/inquiries/types";

type AdminSummary = {
  email: string;
  name: string | null;
  role: "SUPER_ADMIN" | "ADMIN" | "EDITOR";
};

type DashboardClientProps = {
  admin: AdminSummary;
  posts: AdminBlogPost[];
  blogStats: BlogStats;
  projectCount: number;
  serviceCount: number;
  mediaCount: number;
  inquiries: AdminInquiry[];
  inquiryStats: InquiryStats;
};

export default function DashboardClient({
  admin,
  posts,
  blogStats,
  projectCount,
  serviceCount,
  mediaCount,
  inquiries,
  inquiryStats,
}: DashboardClientProps) {
  const adminLabel = admin.name ?? admin.email;
  const adminRole = admin.role.replace("_", " ");

  return (
    <AdminShell admin={admin} active="dashboard">
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black font-heading text-brand-fg">
              Management Dashboard
            </h1>
            <p className="text-xs text-gray-400 mt-1">Signed in as {adminLabel}.</p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/admin/inquiries"
              className="btn-secondary px-4 py-2.5 text-xs flex items-center gap-1.5"
            >
              <Inbox size={14} /> View Inquiries ({inquiryStats.pending} new)
            </Link>
            <Link
              href="/admin/blog/new"
              className="btn-primary px-4 py-2.5 text-xs flex items-center gap-1.5 shadow-md shadow-brand-rose/25"
            >
              <PlusCircle size={14} /> Write Article
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {[
            {
              label: "Inquiries",
              val: inquiryStats.total,
              desc: `${inquiryStats.pending} pending / ${inquiryStats.approved} approved`,
              icon: <Inbox className="text-brand-rose-text" size={18} />,
              link: "/admin/inquiries",
            },
            {
              label: "Projects",
              val: projectCount,
              desc: "PostgreSQL project profiles",
              icon: <FolderKanban className="text-brand-rose-text" size={18} />,
              link: "/admin/projects",
            },
            {
              label: "Services",
              val: serviceCount,
              desc: "Active studio offerings",
              icon: <Layers className="text-brand-rose-text" size={18} />,
              link: "/admin/services",
            },
            {
              label: "Articles",
              val: blogStats.total,
              desc: `${blogStats.published} published • ${blogStats.draft} drafts`,
              icon: <FileText className="text-brand-rose-text" size={18} />,
              link: "/admin/blog",
            },
            {
              label: "Media Files",
              val: mediaCount,
              desc: "Self-hosted storage assets",
              icon: <ImageIcon className="text-brand-rose-text" size={18} />,
              link: "/admin/media",
            },
            {
              label: "Staff Access",
              val: adminRole,
              desc: "Verified PostgreSQL session",
              icon: <Lock className="text-brand-rose-text" size={18} />,
              link: "#",
            },
          ].map((stat, idx) => (
            <Link
              key={idx}
              href={stat.link}
              className="surface-card surface-card-hover p-5 rounded-2xl shadow-sm block group"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wider">
                  {stat.label}
                </span>
                <div className="p-2 bg-brand-rose/10 rounded-xl group-hover:bg-brand-rose/20 transition-colors">
                  {stat.icon}
                </div>
              </div>
              <div className="text-2xl font-black font-heading text-brand-fg mb-1">
                {stat.val}
              </div>
              <div className="text-[11px] text-gray-400 font-mono">{stat.desc}</div>
            </Link>
          ))}
        </div>

        {/* Client Consultation Inquiries (Bookings) Panel */}
        <section className="bg-brand-card border border-brand-rose/15 rounded-3xl p-5 sm:p-7 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-bold font-heading text-brand-fg flex items-center gap-2">
                <Inbox size={18} className="text-brand-rose-text" /> Recent Inquiries & Strategy Requests
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Prospective client leads submitted via website discovery dialogs.
              </p>
            </div>
            <Link
              href="/admin/inquiries"
              className="text-xs font-mono text-brand-rose-text hover:underline inline-flex items-center gap-1"
            >
              Manage All ({inquiryStats.total}) <ChevronRight size={12} />
            </Link>
          </div>

          {inquiries.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400 border border-dashed border-brand-rose/15 rounded-2xl">
              No inquiries recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-gray-400 uppercase font-mono tracking-wider border-b border-brand-rose/15 pb-2 text-[10px]">
                  <tr>
                    <th className="pb-3 pr-4 font-semibold">Client / Name</th>
                    <th className="pb-3 pr-4 font-semibold">Target Service</th>
                    <th className="pb-3 pr-4 font-semibold">Budget Tier</th>
                    <th className="pb-3 pr-4 font-semibold">Discussion Date</th>
                    <th className="pb-3 pr-4 font-semibold">Status</th>
                    <th className="pb-3 pr-2 font-semibold text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-rose/10 text-gray-300">
                  {inquiries.map((b) => (
                    <tr key={b.id} className="hover:bg-brand-rose/5 transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="font-bold text-brand-fg">{b.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono flex items-center gap-1 mt-0.5">
                          <Mail size={10} /> {b.email}
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 font-medium text-gray-200">{b.service}</td>
                      <td className="py-3.5 pr-4 font-mono text-emerald-400">{b.budget}</td>
                      <td className="py-3.5 pr-4 font-mono text-gray-400">{b.preferredDate}</td>
                      <td className="py-3.5 pr-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                            b.status === "APPROVED"
                              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/25"
                              : b.status === "CONTACTED"
                              ? "bg-blue-500/10 text-blue-300 border-blue-500/25"
                              : b.status === "COMPLETED"
                              ? "bg-purple-500/10 text-purple-300 border-purple-500/25"
                              : b.status === "ARCHIVED"
                              ? "bg-gray-500/10 text-gray-400 border-gray-500/25"
                              : "bg-amber-500/10 text-amber-300 border-amber-500/25"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3.5 pr-2 text-right">
                        <Link
                          href={`/admin/inquiries/${b.id}`}
                          className="p-1.5 rounded-lg bg-brand-bg border border-brand-rose/20 hover:border-brand-rose text-gray-300 hover:text-brand-fg inline-flex items-center transition-colors"
                          title="View inquiry"
                        >
                          <ChevronRight size={13} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Blog Posts CMS Panel */}
        <section className="bg-brand-card border border-brand-rose/15 rounded-3xl p-5 sm:p-7 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-bold font-heading text-brand-fg flex items-center gap-2">
              <FileText size={18} className="text-brand-rose-text" /> Recent Newsroom Articles (CMS)
            </h2>
            <Link
              href="/admin/blog"
              className="text-xs font-mono text-brand-rose-text hover:underline inline-flex items-center gap-1"
            >
              Manage All ({blogStats.total}) <ChevronRight size={12} />
            </Link>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400">
              No articles found.{" "}
              <Link href="/admin/blog/new" className="text-brand-rose-text hover:underline">
                Write your first article
              </Link>
              .
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="surface-card surface-card-hover p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border border-brand-rose/10"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-rose-text px-2 py-0.5 rounded bg-brand-rose/10 border border-brand-rose/20">
                        {post.category}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          post.status === "PUBLISHED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : post.status === "ARCHIVED"
                            ? "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {post.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-brand-fg">{post.title}</h3>
                    <p className="text-xs text-gray-400 line-clamp-1">{post.summary}</p>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {post.status === "PUBLISHED" && (
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="p-2 rounded-xl border border-brand-rose/20 hover:border-brand-rose text-gray-400 hover:text-brand-fg transition-colors"
                        title="View Live"
                      >
                        <ExternalLink size={14} />
                      </Link>
                    )}
                    <Link
                      href={`/admin/blog/${post.id}/edit`}
                      className="btn-secondary px-3 py-1.5 text-xs"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
