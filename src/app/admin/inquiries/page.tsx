import { requireAdmin } from "@/lib/auth/session";
import { getAdminInquiries, getInquiryStats } from "@/lib/inquiries/repository";
import type { InquirySource, InquiryStatus } from "@/lib/inquiries/types";
import { redirect } from "next/navigation";
import InquiriesListClient from "./InquiriesListClient";

export const dynamic = "force-dynamic";

type AdminInquiriesPageProps = {
  searchParams: Promise<{
    status?: string | string[];
    source?: string | string[];
    search?: string | string[];
    page?: string | string[];
  }>;
};

const validStatuses: Array<InquiryStatus | "ALL"> = [
  "ALL",
  "PENDING",
  "APPROVED",
  "CONTACTED",
  "COMPLETED",
  "ARCHIVED",
];

const validSources: Array<InquirySource | "ALL"> = [
  "ALL",
  "BOOKING_MODAL",
  "CONTACT_PAGE",
];

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseStatus(value: string | string[] | undefined): InquiryStatus | "ALL" {
  const status = firstParam(value);
  return validStatuses.includes(status as InquiryStatus | "ALL")
    ? (status as InquiryStatus | "ALL")
    : "ALL";
}

function parseSource(value: string | string[] | undefined): InquirySource | "ALL" {
  const source = firstParam(value);
  return validSources.includes(source as InquirySource | "ALL")
    ? (source as InquirySource | "ALL")
    : "ALL";
}

function parsePage(value: string | string[] | undefined) {
  const page = Number.parseInt(firstParam(value) || "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function buildInquiriesHref(
  filters: { status: InquiryStatus | "ALL"; source: InquirySource | "ALL"; search: string },
  page: number
) {
  const params = new URLSearchParams();

  if (filters.status !== "ALL") params.set("status", filters.status);
  if (filters.source !== "ALL") params.set("source", filters.source);
  if (filters.search.trim()) params.set("search", filters.search.trim());
  if (page > 1) params.set("page", String(page));

  const query = params.toString();
  return `/admin/inquiries${query ? `?${query}` : ""}`;
}

export default async function AdminInquiriesPage({
  searchParams,
}: AdminInquiriesPageProps) {
  const params = await searchParams;
  const filters = {
    status: parseStatus(params.status),
    source: parseSource(params.source),
    search: firstParam(params.search)?.trim() || "",
  };
  const currentPage = parsePage(params.page);
  const pageSize = 25;

  const admin = await requireAdmin();
  const [{ inquiries, total }, stats] = await Promise.all([
    getAdminInquiries({
      limit: pageSize,
      page: currentPage,
      status: filters.status,
      source: filters.source,
      search: filters.search,
    }),
    getInquiryStats(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (currentPage > totalPages) {
    redirect(buildInquiriesHref(filters, totalPages));
  }

  return (
    <InquiriesListClient
      key={`${filters.status}:${filters.source}:${filters.search}:${currentPage}`}
      admin={{
        email: admin.email,
        name: admin.name,
        role: admin.role,
      }}
      initialInquiries={inquiries}
      initialTotal={total}
      filters={filters}
      currentPage={currentPage}
      pageSize={pageSize}
      stats={stats}
    />
  );
}
