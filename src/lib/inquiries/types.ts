export type InquiryStatus = "PENDING" | "APPROVED" | "CONTACTED" | "COMPLETED" | "ARCHIVED";
export type InquirySource = "BOOKING_MODAL" | "CONTACT_PAGE";

export interface InquiryInput {
  name: string;
  email: string;
  company?: string | null;
  service: string;
  budget: string;
  timeline: string;
  preferredDate: string;
  message?: string | null;
  source?: InquirySource;
  projectContext?: string | null;
  entryPath?: string | null;
  referrer?: string | null;
  ctaLabel?: string | null;
  ctaLocation?: string | null;
  submissionToken?: string | null;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  company: string | null;
  service: string;
  budget: string;
  timeline: string;
  message: string | null;
  preferredDate: string;
  source: InquirySource;
  projectContext: string | null;
  entryPath: string | null;
  referrer: string | null;
  ctaLabel: string | null;
  ctaLocation: string | null;
  status: InquiryStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminInquiry extends Inquiry {
  ipHash?: string | null;
}

export interface InquiryStats {
  total: number;
  pending: number;
  approved: number;
  contacted: number;
  completed: number;
  archived: number;
  newCount: number; // pending count for badges
}

export interface InquiryFilter {
  status?: InquiryStatus | "ALL";
  source?: InquirySource | "ALL";
  search?: string;
  page?: number;
  limit?: number;
}

export interface InquirySubmissionResponse {
  success: boolean;
  message: string;
  inquiryId?: string;
  errors?: Record<string, string>;
}
