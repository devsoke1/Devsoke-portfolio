"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Inbox,
  Mail,
  Search,
} from "lucide-react";
import AdminShell from "../_components/AdminShell";
import type {
  AdminInquiry,
  InquirySource,
  InquiryStats,
  InquiryStatus,
} from "@/lib/inquiries/types";
import { updateInquiryStatusAction } from "@/lib/inquiries/actions";

type AdminSummary = {
  email: string;
  name: string | null;
  role: "SUPER_ADMIN" | "ADMIN" | "EDITOR";
};

type InquiryListFilters = {
  status: InquiryStatus | "ALL";
  source: InquirySource | "ALL";
  search: string;
};

type InquiriesListClientProps = {
  admin: AdminSummary;
  initialInquiries: AdminInquiry[];
  initialTotal: number;
  filters: InquiryListFilters;
  currentPage: number;
  pageSize: number;
  stats: InquiryStats;
};

const STATUS_BADGES: Record<InquiryStatus, { bg: string; text: string; label: string }> = {
  PENDING: { bg: "bg-amber-500/15 border-amber-500/30", text: "text-amber-300", label: "Pending Review" },
  APPROVED: { bg: "bg-emerald-500/15 border-emerald-500/30", text: "text-emerald-300", label: "Approved" },
  CONTACTED: { bg: "bg-blue-500/15 border-blue-500/30", text: "text-blue-300", label: "Contacted" },
  COMPLETED: { bg: "bg-purple-500/15 border-purple-500/30", text: "text-purple-300", label: "Completed" },
  ARCHIVED: { bg: "bg-gray-500/15 border-gray-500/30", text: "text-gray-400", label: "Archived" },
};

const SOURCE_LABELS: Record<InquirySource, string> = {
  BOOKING_MODAL: "Booking Dialog",
  CONTACT_PAGE: "Contact Page",
};

const statusTabs: Array<{ id: InquiryStatus | "ALL"; label: string }> = [
  { id: "ALL", label: "All Inquiries" },
  { id: "PENDING", label: "Pending" },
  { id: "APPROVED", label: "Approved" },
  { id: "CONTACTED", label: "Contacted" },
  { id: "COMPLETED", label: "Completed" },
  { id: "ARCHIVED", label: "Archived" },
];

type ListMessage = {
  type: "success" | "error";
  text: string;
};

export default function InquiriesListClient({
  admin,
  initialInquiries,
  initialTotal,
  filters,
  currentPage,
  pageSize,
  stats,
}: InquiriesListClientProps) {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<AdminInquiry[]>(initialInquiries);
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | "ALL">(filters.status);
  const [sourceFilter, setSourceFilter] = useState<InquirySource | "ALL">(filters.source);
  const [searchQuery, setSearchQuery] = useState(filters.search);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [listMessage, setListMessage] = useState<ListMessage | null>(null);

  const totalPages = Math.max(1, Math.ceil(initialTotal / pageSize));
  const hasActiveFilters =
    filters.status !== "ALL" || filters.source !== "ALL" || Boolean(filters.search);

  const buildHref = (
    nextFilters: Partial<InquiryListFilters> & { page?: number } = {}
  ) => {
    const params = new URLSearchParams();
    const nextStatus = nextFilters.status ?? statusFilter;
    const nextSource = nextFilters.source ?? sourceFilter;
    const nextSearch =
      typeof nextFilters.search === "string" ? nextFilters.search : searchQuery;
    const nextPage = nextFilters.page ?? currentPage;

    if (nextStatus !== "ALL") params.set("status", nextStatus);
    if (nextSource !== "ALL") params.set("source", nextSource);
    if (nextSearch.trim()) params.set("search", nextSearch.trim());
    if (nextPage > 1) params.set("page", String(nextPage));

    const queryString = params.toString();
    return `/admin/inquiries${queryString ? `?${queryString}` : ""}`;
  };

  const handleStatusFilter = (status: InquiryStatus | "ALL") => {
    setStatusFilter(status);
    setListMessage(null);
    router.replace(buildHref({ status, page: 1 }));
  };

  const handleSourceFilter = (source: InquirySource | "ALL") => {
    setSourceFilter(source);
    setListMessage(null);
    router.replace(buildHref({ source, page: 1 }));
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setListMessage(null);
    router.replace(buildHref({ search: searchQuery, page: 1 }));
  };

  const handleStatusChange = async (id: string, newStatus: InquiryStatus) => {
    setUpdatingId(id);
    setListMessage(null);

    try {
      const response = await updateInquiryStatusAction(id, newStatus);

      if (response.success) {
        setInquiries((current) =>
          current.map((item) =>
            item.id === id ? { ...item, status: newStatus } : item
          )
        );
        setListMessage({ type: "success", text: "Inquiry status updated." });
        router.refresh();
      } else {
        setListMessage({
          type: "error",
          text: response.error || "Failed to update inquiry status.",
        });
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      setListMessage({
        type: "error",
        text: "Failed to update inquiry status.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AdminShell admin={admin} active="inquiries">
      <div className="mx-auto max-w-7xl space-y-8 p-5 sm:p-8 lg:p-10">
        <div className="flex flex-col justify-between gap-4 border-b border-brand-rose/15 pb-6 sm:flex-row sm:items-center">
          <div>
            <div className="font-mono mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-rose-text">
              <Inbox size={14} /> Client Pipeline
            </div>
            <h1 className="font-heading text-2xl font-extrabold text-brand-fg sm:text-4xl">
              Prospective Inquiries
            </h1>
            <p className="mt-1 text-xs text-gray-400 sm:text-sm">
              Manage project leads, call requests, contact-form submissions, and
              discovery inquiries.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {[
            { label: "Total Inquiries", value: stats.total, className: "border-brand-rose/20 text-brand-fg" },
            { label: "Pending / New", value: stats.pending, className: "border-amber-500/30 bg-amber-500/5 text-amber-300" },
            { label: "Contacted", value: stats.contacted, className: "border-blue-500/30 bg-blue-500/5 text-blue-300" },
            { label: "Completed", value: stats.completed, className: "border-purple-500/30 bg-purple-500/5 text-purple-300" },
            { label: "Archived", value: stats.archived, className: "border-gray-500/30 bg-gray-500/5 text-gray-400 col-span-2 sm:col-span-1" },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`surface-card rounded-2xl border p-4 sm:p-5 ${stat.className}`}
            >
              <span className="font-mono block text-[10px] uppercase tracking-wider text-gray-400 sm:text-xs">
                {stat.label}
              </span>
              <span className="font-heading text-xl font-black sm:text-2xl">
                {stat.value}
              </span>
            </div>
          ))}
        </div>
        <p className="font-mono text-[11px] text-gray-500">
          Pipeline totals are global; the table count below reflects the active
          search, source, and status filters.
        </p>

        <div className="space-y-4">
          <div className="flex flex-col items-stretch justify-between gap-3 md:flex-row md:items-center">
            <form onSubmit={handleSearchSubmit} className="relative max-w-md flex-1">
              <label htmlFor="inquiries-search" className="sr-only">
                Search inquiries
              </label>
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                id="inquiries-search"
                type="search"
                placeholder="Search name, email, company, service, path..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="font-mono w-full rounded-xl border border-brand-rose/20 bg-brand-bg py-2.5 pl-9 pr-4 text-xs text-brand-fg placeholder:text-gray-500 focus:border-brand-rose focus:outline-none"
              />
            </form>

            <div className="flex items-center gap-2">
              <span className="font-mono flex items-center gap-1 text-[11px] uppercase tracking-wider text-gray-400">
                <Filter size={12} /> Source:
              </span>
              <select
                value={sourceFilter}
                onChange={(event) =>
                  handleSourceFilter(event.target.value as InquirySource | "ALL")
                }
                className="font-mono rounded-xl border border-brand-rose/20 bg-brand-bg px-3 py-2 text-xs text-brand-fg focus:border-brand-rose focus:outline-none"
              >
                <option value="ALL">All Sources</option>
                <option value="BOOKING_MODAL">Booking Dialog</option>
                <option value="CONTACT_PAGE">Contact Page</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 border-b border-brand-rose/15 pb-2">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleStatusFilter(tab.id)}
                aria-pressed={statusFilter === tab.id}
                className={`font-mono rounded-xl px-3.5 py-1.5 text-xs transition-all ${
                  statusFilter === tab.id
                    ? "bg-brand-rose font-bold text-brand-fg shadow-sm shadow-brand-rose/25"
                    : "text-gray-400 hover:bg-brand-card hover:text-brand-fg"
                }`}
              >
                {tab.label}
                {tab.id !== "ALL" && tab.id.toLowerCase() in stats
                  ? ` (${stats[tab.id.toLowerCase() as keyof InquiryStats]})`
                  : ""}
              </button>
            ))}
          </div>

          <div className="flex flex-col justify-between gap-3 text-xs text-gray-400 sm:flex-row sm:items-center">
            <span>
              Showing {inquiries.length} of {initialTotal} matching inquiries.
            </span>
            {hasActiveFilters && (
              <Link
                href="/admin/inquiries"
                className="w-fit font-semibold text-brand-rose-text transition-colors hover:text-brand-fg"
              >
                Clear filters
              </Link>
            )}
          </div>

          {listMessage && (
            <div
              className={`rounded-2xl border p-3 text-xs font-semibold ${
                listMessage.type === "success"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-brand-rose/30 bg-brand-rose/10 text-brand-rose-text"
              }`}
              role={listMessage.type === "error" ? "alert" : "status"}
            >
              {listMessage.text}
            </div>
          )}
        </div>

        {inquiries.length === 0 ? (
          <div className="surface-card rounded-3xl border border-brand-rose/15 p-12 text-center">
            <Inbox size={32} className="mx-auto text-gray-500" />
            <h3 className="font-heading mt-3 text-base font-bold text-brand-fg">
              No inquiries found
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-xs text-gray-400">
              {hasActiveFilters
                ? "Try adjusting the search, status, or source filters."
                : "When prospective clients submit inquiries, they will appear here."}
            </p>
          </div>
        ) : (
          <div className="surface-card overflow-hidden rounded-3xl border border-brand-rose/20 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="font-mono border-b border-brand-rose/15 bg-brand-card text-[10px] uppercase tracking-wider text-gray-400">
                  <tr>
                    <th className="px-4 py-3.5 font-semibold">Client</th>
                    <th className="px-4 py-3.5 font-semibold">Service & Budget</th>
                    <th className="px-4 py-3.5 font-semibold">Preferred Date</th>
                    <th className="px-4 py-3.5 font-semibold">Source</th>
                    <th className="px-4 py-3.5 font-semibold">Status</th>
                    <th className="px-4 py-3.5 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-rose/10 font-sans">
                  {inquiries.map((inquiry) => {
                    const badge = STATUS_BADGES[inquiry.status] || STATUS_BADGES.PENDING;
                    const dateFormatted = new Date(inquiry.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });

                    return (
                      <tr
                        key={inquiry.id}
                        className="group transition-colors hover:bg-brand-card/50"
                      >
                        <td className="px-4 py-4 align-top">
                          <div className="space-y-1">
                            <Link
                              href={`/admin/inquiries/${inquiry.id}`}
                              className="font-heading flex items-center gap-1.5 text-sm font-bold text-brand-fg transition-colors hover:text-brand-rose-text"
                            >
                              <span>{inquiry.name}</span>
                              <ChevronRight
                                size={12}
                                className="text-brand-rose-text opacity-0 transition-opacity group-hover:opacity-100"
                              />
                            </Link>
                            <a
                              href={`mailto:${encodeURIComponent(inquiry.email)}`}
                              className="font-mono inline-flex items-center gap-1 text-[11px] text-gray-400 transition-colors hover:text-brand-rose-text"
                              title="Send email"
                            >
                              <Mail size={11} /> {inquiry.email}
                            </a>
                            {inquiry.company && (
                              <span className="font-mono block text-[10px] text-gray-500">
                                Company: {inquiry.company}
                              </span>
                            )}
                            <span className="font-mono block text-[9px] text-gray-500">
                              Received: {dateFormatted}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4 align-top">
                          <div className="space-y-1">
                            <span className="block font-semibold text-brand-fg">
                              {inquiry.service}
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              <span className="font-mono rounded-md border border-brand-rose/15 bg-brand-bg px-2 py-0.5 text-[10px] text-gray-300">
                                {inquiry.budget}
                              </span>
                              <span className="font-mono rounded-md border border-brand-rose/15 bg-brand-bg px-2 py-0.5 text-[10px] text-gray-400">
                                {inquiry.timeline}
                              </span>
                            </div>
                            {inquiry.projectContext && (
                              <span className="font-mono block text-[10px] text-gray-500">
                                Project: {inquiry.projectContext}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-4 align-top">
                          <div className="font-mono flex items-center gap-1.5 text-xs text-gray-300">
                            <Calendar
                              size={13}
                              className="flex-shrink-0 text-brand-rose-text"
                            />
                            <span>{inquiry.preferredDate}</span>
                          </div>
                        </td>

                        <td className="px-4 py-4 align-top">
                          <div className="space-y-1">
                            <span className="font-mono inline-block rounded-full border border-brand-rose/20 bg-brand-bg px-2.5 py-1 text-[10px] font-semibold uppercase text-gray-300">
                              {SOURCE_LABELS[inquiry.source] || inquiry.source}
                            </span>
                            <span className="font-mono block max-w-[180px] truncate text-[10px] text-gray-500">
                              {inquiry.ctaLocation || "CTA: Not captured"}
                            </span>
                            <span className="font-mono block max-w-[180px] truncate text-[10px] text-gray-500">
                              {inquiry.entryPath || "Path: Not captured"}
                            </span>
                            <span className="font-mono block max-w-[180px] truncate text-[10px] text-gray-500">
                              {inquiry.referrer || "Referrer: Not captured"}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4 align-top">
                          <span
                            className={`font-mono inline-block rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${badge.bg} ${badge.text}`}
                          >
                            {badge.label}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-right align-top">
                          <div className="flex items-center justify-end gap-2">
                            <select
                              value={inquiry.status}
                              disabled={updatingId === inquiry.id}
                              onChange={(event) =>
                                handleStatusChange(
                                  inquiry.id,
                                  event.target.value as InquiryStatus
                                )
                              }
                              className="font-mono rounded-lg border border-brand-rose/20 bg-brand-bg px-2 py-1.5 text-[11px] text-gray-300 focus:border-brand-rose focus:outline-none disabled:opacity-50"
                            >
                              <option value="PENDING">Pending</option>
                              <option value="APPROVED">Approved</option>
                              <option value="CONTACTED">Contacted</option>
                              <option value="COMPLETED">Completed</option>
                              <option value="ARCHIVED">Archived</option>
                            </select>

                            <Link
                              href={`/admin/inquiries/${inquiry.id}`}
                              className="rounded-lg border border-brand-rose/20 bg-brand-bg p-2 text-gray-300 transition-colors hover:border-brand-rose hover:text-brand-fg"
                              title="View full inquiry details"
                              aria-label={`View inquiry from ${inquiry.name}`}
                            >
                              <ChevronRight size={14} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center justify-between gap-3 text-xs text-gray-400 sm:flex-row">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            {currentPage > 1 ? (
              <Link
                href={buildHref({ page: currentPage - 1 })}
                className="btn-secondary px-4 py-2 text-xs"
              >
                <ChevronLeft size={14} />
                Previous
              </Link>
            ) : (
              <span className="rounded-xl border border-brand-rose/10 px-4 py-2 text-gray-600">
                Previous
              </span>
            )}

            {currentPage < totalPages ? (
              <Link
                href={buildHref({ page: currentPage + 1 })}
                className="btn-secondary px-4 py-2 text-xs"
              >
                Next
                <ChevronRight size={14} />
              </Link>
            ) : (
              <span className="rounded-xl border border-brand-rose/10 px-4 py-2 text-gray-600">
                Next
              </span>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
