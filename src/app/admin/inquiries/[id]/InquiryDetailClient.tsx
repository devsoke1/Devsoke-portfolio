"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Calendar,
  CheckCircle,
  Trash2,
  Save,
  MessageSquare,
  Loader2,
  Check,
} from "lucide-react";
import AdminShell from "../../_components/AdminShell";
import type { AdminInquiry, InquiryStatus } from "@/lib/inquiries/types";
import {
  deleteInquiryAction,
  updateInquiryNotesAction,
  updateInquiryStatusAction,
} from "@/lib/inquiries/actions";

type AdminSummary = {
  email: string;
  name: string | null;
  role: "SUPER_ADMIN" | "ADMIN" | "EDITOR";
};

type InquiryDetailClientProps = {
  admin: AdminSummary;
  inquiry: AdminInquiry;
};

const STATUS_OPTIONS: { id: InquiryStatus; label: string; desc: string }[] = [
  { id: "PENDING", label: "Pending Review", desc: "Newly submitted inquiry awaiting initial evaluation." },
  { id: "APPROVED", label: "Approved for Call", desc: "Qualified opportunity approved for strategy session." },
  { id: "CONTACTED", label: "Contacted / In Discussion", desc: "Direct correspondence initiated with client." },
  { id: "COMPLETED", label: "Completed / Converted", desc: "Consultation finished or deal closed." },
  { id: "ARCHIVED", label: "Archived", desc: "Stored for reference / inactive." },
];

const SOURCE_LABELS: Record<AdminInquiry["source"], string> = {
  BOOKING_MODAL: "Booking Dialog",
  CONTACT_PAGE: "Contact Page",
};

export default function InquiryDetailClient({
  admin,
  inquiry: initialInquiry,
}: InquiryDetailClientProps) {
  const router = useRouter();
  const [inquiry, setInquiry] = useState<AdminInquiry>(initialInquiry);
  const [status, setStatus] = useState<InquiryStatus>(initialInquiry.status);
  const [notes, setNotes] = useState<string>(initialInquiry.notes || "");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleStatusUpdate = async (newStatus: InquiryStatus) => {
    setIsUpdatingStatus(true);
    setNotification(null);
    try {
      const res = await updateInquiryStatusAction(inquiry.id, newStatus);
      if (res.success) {
        setStatus(newStatus);
        setInquiry((prev) => ({ ...prev, status: newStatus }));
        setNotification({ type: "success", text: "Inquiry status updated successfully." });
      } else {
        setNotification({ type: "error", text: res.error || "Failed to update status." });
      }
    } catch {
      setNotification({ type: "error", text: "Network error occurred." });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    setNotification(null);
    try {
      const res = await updateInquiryNotesAction(inquiry.id, notes);
      if (res.success) {
        setInquiry((prev) => ({ ...prev, notes }));
        setNotification({ type: "success", text: "Internal admin notes saved." });
      } else {
        setNotification({ type: "error", text: res.error || "Failed to save notes." });
      }
    } catch {
      setNotification({ type: "error", text: "Network error occurred." });
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteInquiryAction(inquiry.id);
      if (res.success) {
        router.push("/admin/inquiries");
      } else {
        setNotification({ type: "error", text: res.error || "Failed to delete inquiry." });
        setIsDeleting(false);
        setShowDeleteConfirm(false);
      }
    } catch {
      setNotification({ type: "error", text: "Network error occurred." });
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formattedCreated = new Date(inquiry.createdAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <AdminShell admin={admin} active="inquiries">
      <div className="p-5 sm:p-8 lg:p-10 max-w-5xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div>
          <Link
            href="/admin/inquiries"
            className="inline-flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-brand-rose-text transition-colors mb-4"
          >
            <ArrowLeft size={14} /> Back to Inquiries
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-rose/15 pb-6">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-brand-rose-text block mb-1">
                Inquiry Reference #{inquiry.id.slice(-8)}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-brand-fg">
                {inquiry.name}
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 flex flex-wrap items-center gap-3">
                <span>Received {formattedCreated}</span>
                <span aria-hidden="true">/</span>
                <span className="font-mono text-gray-300">
                  Source: {SOURCE_LABELS[inquiry.source] || inquiry.source}
                </span>
              </p>
            </div>

            {/* Quick Action Button */}
            <a
              href={`mailto:${encodeURIComponent(inquiry.email)}?subject=Devsoke%20Consultation%3A%20${encodeURIComponent(inquiry.service)}`}
              className="btn-primary px-5 py-3 text-xs uppercase tracking-wider shadow-lg shadow-brand-rose/25 inline-flex items-center justify-center gap-2"
            >
              <Mail size={14} /> Reply via Email
            </a>
          </div>
        </div>

        {/* Feedback Alert */}
        {notification && (
          <div
            className={`p-4 rounded-2xl text-xs font-mono flex items-center gap-2.5 ${
              notification.type === "success"
                ? "bg-emerald-950/40 border border-emerald-500/30 text-emerald-300"
                : "bg-red-950/40 border border-red-500/30 text-red-300"
            }`}
            role={notification.type === "success" ? "status" : "alert"}
          >
            {notification.type === "success" ? <Check size={14} /> : <Trash2 size={14} />}
            <span>{notification.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left 2 Cols: Details & Message */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact & Scope Overview */}
            <div className="surface-card rounded-3xl p-6 sm:p-7 border border-brand-rose/20 space-y-6">
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-gray-300 border-b border-brand-rose/15 pb-3">
                Client & Project Scope
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1 p-3.5 rounded-xl bg-brand-bg border border-brand-rose/15">
                  <span className="text-[10px] font-mono uppercase text-gray-500 block">Full Name</span>
                  <span className="font-semibold text-brand-fg text-sm">{inquiry.name}</span>
                </div>

                <div className="space-y-1 p-3.5 rounded-xl bg-brand-bg border border-brand-rose/15">
                  <span className="text-[10px] font-mono uppercase text-gray-500 block">Email Address</span>
                  <a
                    href={`mailto:${encodeURIComponent(inquiry.email)}`}
                    className="font-mono font-semibold text-brand-rose-text hover:underline block truncate"
                  >
                    {inquiry.email}
                  </a>
                </div>

                <div className="space-y-1 p-3.5 rounded-xl bg-brand-bg border border-brand-rose/15">
                  <span className="text-[10px] font-mono uppercase text-gray-500 block">Service Needed</span>
                  <span className="font-semibold text-brand-fg text-sm">{inquiry.service}</span>
                </div>

                <div className="space-y-1 p-3.5 rounded-xl bg-brand-bg border border-brand-rose/15">
                  <span className="text-[10px] font-mono uppercase text-gray-500 block">Preferred Date</span>
                  <span className="font-mono font-semibold text-brand-fg text-sm flex items-center gap-1">
                    <Calendar size={13} className="text-brand-rose-text" /> {inquiry.preferredDate}
                  </span>
                </div>

                <div className="space-y-1 p-3.5 rounded-xl bg-brand-bg border border-brand-rose/15">
                  <span className="text-[10px] font-mono uppercase text-gray-500 block">Estimated Budget</span>
                  <span className="font-mono font-semibold text-emerald-400">{inquiry.budget}</span>
                </div>

                <div className="space-y-1 p-3.5 rounded-xl bg-brand-bg border border-brand-rose/15">
                  <span className="text-[10px] font-mono uppercase text-gray-500 block">Target Timeline</span>
                  <span className="font-mono font-semibold text-gray-300">{inquiry.timeline}</span>
                </div>

                {inquiry.company && (
                  <div className="space-y-1 p-3.5 rounded-xl bg-brand-bg border border-brand-rose/15 sm:col-span-2">
                    <span className="text-[10px] font-mono uppercase text-gray-500 block">Company / Organization</span>
                    <span className="font-semibold text-brand-fg">{inquiry.company}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="surface-card rounded-3xl p-6 sm:p-7 border border-brand-rose/20 space-y-6">
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-gray-300 border-b border-brand-rose/15 pb-3">
                Lead Attribution
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1 p-3.5 rounded-xl bg-brand-bg border border-brand-rose/15">
                  <span className="text-[10px] font-mono uppercase text-gray-500 block">Source</span>
                  <span className="font-semibold text-brand-fg text-sm">
                    {SOURCE_LABELS[inquiry.source] || inquiry.source}
                  </span>
                </div>

                <div className="space-y-1 p-3.5 rounded-xl bg-brand-bg border border-brand-rose/15">
                  <span className="text-[10px] font-mono uppercase text-gray-500 block">CTA Location</span>
                  <span className="font-semibold text-brand-fg text-sm">
                    {inquiry.ctaLocation || "Not captured"}
                  </span>
                </div>

                <div className="space-y-1 p-3.5 rounded-xl bg-brand-bg border border-brand-rose/15">
                  <span className="text-[10px] font-mono uppercase text-gray-500 block">CTA Label</span>
                  <span className="font-semibold text-brand-fg text-sm">
                    {inquiry.ctaLabel || "Not captured"}
                  </span>
                </div>

                <div className="space-y-1 p-3.5 rounded-xl bg-brand-bg border border-brand-rose/15">
                  <span className="text-[10px] font-mono uppercase text-gray-500 block">Entry Path</span>
                  <span className="font-mono font-semibold text-brand-fg text-sm break-all">
                    {inquiry.entryPath || "Not captured"}
                  </span>
                </div>

                <div className="space-y-1 p-3.5 rounded-xl bg-brand-bg border border-brand-rose/15">
                  <span className="text-[10px] font-mono uppercase text-gray-500 block">Referrer</span>
                  <span className="font-mono font-semibold text-brand-fg text-sm break-all">
                    {inquiry.referrer || "Not captured"}
                  </span>
                </div>

                <div className="space-y-1 p-3.5 rounded-xl bg-brand-bg border border-brand-rose/15 sm:col-span-2">
                  <span className="text-[10px] font-mono uppercase text-gray-500 block">Project Context</span>
                  <span className="font-semibold text-brand-fg">
                    {inquiry.projectContext || "Not captured"}
                  </span>
                </div>
              </div>
            </div>

            {/* Submitted Message */}
            <div className="surface-card rounded-3xl p-6 sm:p-7 border border-brand-rose/20 space-y-4">
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-gray-300 border-b border-brand-rose/15 pb-3 flex items-center gap-2">
                <MessageSquare size={14} className="text-brand-rose-text" /> Project Requirements / Notes
              </h2>

              {inquiry.message ? (
                <div className="p-4 rounded-2xl bg-brand-bg border border-brand-rose/15 text-xs sm:text-sm text-gray-200 leading-relaxed whitespace-pre-wrap font-sans break-words">
                  {inquiry.message}
                </div>
              ) : (
                <p className="text-xs text-gray-500 font-mono italic">
                  No additional message was provided during submission.
                </p>
              )}
            </div>

            {/* Internal Admin Notes */}
            <div className="surface-card rounded-3xl p-6 sm:p-7 border border-brand-rose/20 space-y-4">
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-gray-300 border-b border-brand-rose/15 pb-3">
                Internal Team Notes
              </h2>
              <p className="text-xs text-gray-400">
                Private notes visible only to logged-in administrators. Use this to track conversation history or call outcomes.
              </p>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Scheduled discovery session for Thursday 2pm..."
                className="w-full bg-brand-bg border border-brand-rose/20 focus:border-brand-rose focus:outline-none rounded-xl p-3.5 text-xs text-brand-fg placeholder:text-gray-500 leading-relaxed resize-y font-mono"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className="btn-secondary px-5 py-2.5 text-xs uppercase tracking-wider inline-flex items-center gap-2"
                >
                  {isSavingNotes ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  Save Notes
                </button>
              </div>
            </div>
          </div>

          {/* Right Col: Status Management & Danger Zone */}
          <div className="space-y-6">
            {/* Status Workflow Card */}
            <div className="surface-card rounded-3xl p-6 border border-brand-rose/20 space-y-4">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-gray-300 border-b border-brand-rose/15 pb-3">
                Inquiry Status Workflow
              </h3>

              <div className="space-y-2">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={() => handleStatusUpdate(opt.id)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all ${
                      status === opt.id
                        ? "bg-brand-rose/20 border-brand-rose text-brand-fg shadow-sm"
                        : "border-brand-rose/15 hover:border-brand-rose/30 hover:bg-brand-rose/5 text-gray-400 bg-brand-bg"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{opt.label}</span>
                      {status === opt.id && <CheckCircle size={14} className="text-brand-rose-text" />}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 leading-snug">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="surface-card rounded-3xl p-6 border border-red-500/25 bg-red-950/10 space-y-4">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-red-300 border-b border-red-500/20 pb-3">
                Danger Zone
              </h3>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Permanently delete this inquiry from the database. For inactive leads, archiving is recommended instead.
              </p>

              {showDeleteConfirm ? (
                <div className="space-y-2.5 p-3 rounded-2xl bg-brand-bg border border-red-500/30">
                  <p className="text-xs text-red-300 font-semibold font-mono">Confirm permanent deletion?</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={handleDelete}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-xl text-xs font-bold font-mono transition-colors disabled:opacity-50"
                    >
                      {isDeleting ? "Deleting..." : "Yes, Delete"}
                    </button>
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-2 rounded-xl bg-brand-card text-gray-300 text-xs font-mono hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-2.5 px-4 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-mono font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={13} /> Delete Inquiry
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
