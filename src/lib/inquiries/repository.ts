import "server-only";

import { db } from "@/lib/db";
import type { Booking as PrismaBooking, BookingStatus, InquirySource, Prisma } from "@prisma/client";
import type { AdminInquiry, Inquiry, InquiryFilter, InquiryInput, InquiryStats } from "./types";

function serializeInquiry(row: PrismaBooking): Inquiry {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    company: row.company,
    service: row.service,
    budget: row.budget,
    timeline: row.timeline,
    message: row.message,
    preferredDate: row.preferredDate,
    source: row.source as Inquiry["source"],
    projectContext: row.projectContext,
    entryPath: row.entryPath,
    referrer: row.referrer,
    ctaLabel: row.ctaLabel,
    ctaLocation: row.ctaLocation,
    status: row.status as Inquiry["status"],
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function serializeAdminInquiry(row: PrismaBooking): AdminInquiry {
  return {
    ...serializeInquiry(row),
    ipHash: row.ipHash,
  };
}

export async function createInquiry(
  input: InquiryInput,
  ipHash?: string | null
): Promise<Inquiry> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const submissionToken = input.submissionToken?.trim() || null;
  const inquiryData = {
    name: input.name.trim(),
    email: normalizedEmail,
    company: input.company?.trim() || null,
    service: input.service.trim(),
    budget: input.budget.trim(),
    timeline: input.timeline.trim(),
    message: input.message?.trim() || null,
    preferredDate: input.preferredDate.trim(),
    source: (input.source as InquirySource) || "BOOKING_MODAL",
    projectContext: input.projectContext?.trim() || null,
    entryPath: input.entryPath?.trim() || null,
    referrer: input.referrer?.trim() || null,
    ctaLabel: input.ctaLabel?.trim() || null,
    ctaLocation: input.ctaLocation?.trim() || null,
  };

  if (submissionToken) {
    const existingSubmission = await db.booking.findUnique({
      where: { submissionToken },
    });

    if (existingSubmission) {
      const hasCorrectedDetails =
        existingSubmission.name !== inquiryData.name ||
        existingSubmission.email !== inquiryData.email ||
        existingSubmission.company !== inquiryData.company ||
        existingSubmission.service !== inquiryData.service ||
        existingSubmission.budget !== inquiryData.budget ||
        existingSubmission.timeline !== inquiryData.timeline ||
        existingSubmission.message !== inquiryData.message ||
        existingSubmission.preferredDate !== inquiryData.preferredDate ||
        existingSubmission.source !== inquiryData.source ||
        existingSubmission.projectContext !== inquiryData.projectContext ||
        existingSubmission.entryPath !== inquiryData.entryPath ||
        existingSubmission.referrer !== inquiryData.referrer ||
        existingSubmission.ctaLabel !== inquiryData.ctaLabel ||
        existingSubmission.ctaLocation !== inquiryData.ctaLocation;

      if (!hasCorrectedDetails) {
        return serializeInquiry(existingSubmission);
      }

      const updatedSubmission = await db.booking.update({
        where: { id: existingSubmission.id },
        data: inquiryData,
      });

      return serializeInquiry(updatedSubmission);
    }
  } else {
    // Fallback dedupe for legacy submissions that do not provide an explicit token.
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentDuplicate = await db.booking.findFirst({
      where: {
        email: normalizedEmail,
        service: inquiryData.service,
        budget: inquiryData.budget,
        timeline: inquiryData.timeline,
        preferredDate: inquiryData.preferredDate,
        message: inquiryData.message,
        createdAt: { gte: oneMinuteAgo },
      },
      orderBy: { createdAt: "desc" },
    });

    if (recentDuplicate) {
      return serializeInquiry(recentDuplicate);
    }
  }

  // 2. Production-Grade PostgreSQL-Backed Rate Limiting (15-minute sliding window)
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  const RATE_LIMIT_MAX_PER_WINDOW = 5;

  if (ipHash) {
    const ipSubmissionsCount = await db.booking.count({
      where: {
        ipHash,
        createdAt: { gte: fifteenMinutesAgo },
      },
    });

    if (ipSubmissionsCount >= RATE_LIMIT_MAX_PER_WINDOW) {
      throw new Error("Rate limit exceeded: Too many inquiries submitted recently. Please try again later.");
    }
  }

  const emailSubmissionsCount = await db.booking.count({
    where: {
      email: normalizedEmail,
      createdAt: { gte: fifteenMinutesAgo },
    },
  });

  if (emailSubmissionsCount >= RATE_LIMIT_MAX_PER_WINDOW) {
    throw new Error("Rate limit exceeded: Too many inquiries submitted recently. Please try again later.");
  }

  const created = await db.booking.create({
    data: {
      ...inquiryData,
      submissionToken,
      status: "PENDING",
      ipHash: ipHash || null,
    },
  });

  return serializeInquiry(created);
}

export async function getAdminInquiries(filter?: InquiryFilter): Promise<{
  inquiries: AdminInquiry[];
  total: number;
}> {
  const where: Prisma.BookingWhereInput = {};

  if (filter?.status && filter.status !== "ALL") {
    where.status = filter.status as BookingStatus;
  }

  if (filter?.source && filter.source !== "ALL") {
    where.source = filter.source as InquirySource;
  }

  if (filter?.search && filter.search.trim().length > 0) {
    const q = filter.search.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { company: { contains: q, mode: "insensitive" } },
      { service: { contains: q, mode: "insensitive" } },
      { preferredDate: { contains: q, mode: "insensitive" } },
      { message: { contains: q, mode: "insensitive" } },
      { projectContext: { contains: q, mode: "insensitive" } },
      { entryPath: { contains: q, mode: "insensitive" } },
      { referrer: { contains: q, mode: "insensitive" } },
      { ctaLabel: { contains: q, mode: "insensitive" } },
      { ctaLocation: { contains: q, mode: "insensitive" } },
    ];
  }

  const take = Math.min(Math.max(filter?.limit ?? 50, 1), 100);
  const page = Math.max(filter?.page ?? 1, 1);
  const skip = (page - 1) * take;

  const [rows, total] = await Promise.all([
    db.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    db.booking.count({ where }),
  ]);

  return {
    inquiries: rows.map(serializeAdminInquiry),
    total,
  };
}

export async function getAdminInquiryById(id: string): Promise<AdminInquiry | null> {
  const row = await db.booking.findUnique({
    where: { id },
  });

  return row ? serializeAdminInquiry(row) : null;
}

export async function updateInquiryStatus(
  id: string,
  status: BookingStatus
): Promise<AdminInquiry> {
  const updated = await db.booking.update({
    where: { id },
    data: { status },
  });

  return serializeAdminInquiry(updated);
}

export async function updateInquiryNotes(
  id: string,
  notes: string | null
): Promise<AdminInquiry> {
  const updated = await db.booking.update({
    where: { id },
    data: { notes: notes?.trim() || null },
  });

  return serializeAdminInquiry(updated);
}

export async function archiveInquiry(id: string): Promise<AdminInquiry> {
  return updateInquiryStatus(id, "ARCHIVED");
}

export async function deleteInquiry(id: string): Promise<{ success: boolean }> {
  await db.booking.delete({
    where: { id },
  });

  return { success: true };
}

export async function getInquiryStats(): Promise<InquiryStats> {
  const [total, pending, approved, contacted, completed, archived] = await Promise.all([
    db.booking.count(),
    db.booking.count({ where: { status: "PENDING" } }),
    db.booking.count({ where: { status: "APPROVED" } }),
    db.booking.count({ where: { status: "CONTACTED" } }),
    db.booking.count({ where: { status: "COMPLETED" } }),
    db.booking.count({ where: { status: "ARCHIVED" } }),
  ]);

  return {
    total,
    pending,
    approved,
    contacted,
    completed,
    archived,
    newCount: pending,
  };
}
