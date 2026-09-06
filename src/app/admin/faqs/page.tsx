import Link from "next/link";
import { Edit, PlusCircle, Search, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminFaqs } from "@/lib/faqs/repository";
import {
  faqPlacementLabels,
  faqPlacements,
  type FaqPlacementValue,
} from "@/lib/faqs/types";
import { isFaqPlacement } from "@/lib/faqs/validation";
import AdminShell from "../_components/AdminShell";
import ConfirmSubmitButton from "../_components/ConfirmSubmitButton";
import { deleteFaqAction, toggleFaqPublishedAction } from "./actions";
import FaqToggleButton from "./FaqToggleButton";

type AdminFaqsPageProps = {
  searchParams: Promise<{
    status?: string;
    error?: string;
    q?: string;
    placement?: string;
    state?: string;
  }>;
};

export const dynamic = "force-dynamic";

const statusMessages: Record<string, string> = {
  created: "FAQ created.",
  updated: "FAQ updated.",
  deleted: "FAQ deleted.",
  published: "FAQ published.",
  unpublished: "FAQ unpublished.",
};

const errorMessages: Record<string, string> = {
  missing: "FAQ was not found.",
};

function parsePlacement(value?: string): FaqPlacementValue | undefined {
  return value && isFaqPlacement(value) ? value : undefined;
}

function parseStatus(value?: string): "published" | "draft" | undefined {
  return value === "published" || value === "draft" ? value : undefined;
}

export default async function AdminFaqsPage({
  searchParams,
}: AdminFaqsPageProps) {
  const [admin, params] = await Promise.all([requireAdmin(), searchParams]);
  const filters = {
    query: params.q?.trim() || undefined,
    placement: parsePlacement(params.placement),
    status: parseStatus(params.state),
  };
  const faqs = await getAdminFaqs(filters);
  const statusMessage = params.status ? statusMessages[params.status] : null;
  const errorMessage = params.error ? errorMessages[params.error] : null;

  return (
    <AdminShell admin={admin} active="faqs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-brand-fg">FAQs</h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage database-backed public questions by page placement.
          </p>
        </div>
        <Link
          href="/admin/faqs/new"
          className="btn-primary px-5 py-3 text-xs uppercase tracking-wider flex items-center gap-1.5 w-full sm:w-auto justify-center shadow-md shadow-brand-rose/25"
        >
          <PlusCircle size={14} /> Create FAQ
        </Link>
      </div>

      {statusMessage && (
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-400">
          {statusMessage}
        </div>
      )}
      {errorMessage && (
        <div className="rounded-2xl border border-brand-rose/30 bg-brand-rose/10 p-4 text-xs font-semibold text-brand-rose-text">
          {errorMessage}
        </div>
      )}

      <section className="surface-card rounded-3xl p-5 sm:p-7 shadow-sm space-y-5">
        <form action="/admin/faqs" className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_220px_180px_auto] gap-3">
          <label className="relative">
            <span className="sr-only">Search FAQs</span>
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              name="q"
              defaultValue={filters.query ?? ""}
              placeholder="Search questions, answers, keys, services..."
              className="w-full rounded-xl border border-brand-rose/20 bg-brand-bg py-3 pl-9 pr-4 text-xs text-brand-fg placeholder:text-gray-500 focus:border-brand-rose focus:outline-none"
            />
          </label>

          <label>
            <span className="sr-only">Filter by placement</span>
            <select
              name="placement"
              defaultValue={filters.placement ?? ""}
              className="w-full rounded-xl border border-brand-rose/20 bg-brand-bg px-4 py-3 text-xs text-brand-fg focus:border-brand-rose focus:outline-none"
            >
              <option value="">All placements</option>
              {faqPlacements.map((placement) => (
                <option key={placement} value={placement}>
                  {faqPlacementLabels[placement]}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="sr-only">Filter by state</span>
            <select
              name="state"
              defaultValue={filters.status ?? ""}
              className="w-full rounded-xl border border-brand-rose/20 bg-brand-bg px-4 py-3 text-xs text-brand-fg focus:border-brand-rose focus:outline-none"
            >
              <option value="">All states</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </label>

          <button type="submit" className="btn-secondary px-5 py-3 text-xs uppercase tracking-wider">
            Filter
          </button>
        </form>

        {faqs.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-xs">
            No FAQs match the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full min-w-[980px] text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-brand-rose/15 text-gray-400 uppercase font-bold tracking-wider">
                  <th className="pb-3 pr-4 pl-2">Question</th>
                  <th className="pb-3 pr-4">Placement</th>
                  <th className="pb-3 pr-4">Service</th>
                  <th className="pb-3 pr-4">Order</th>
                  <th className="pb-3 pr-4">State</th>
                  <th className="pb-3 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-rose/10">
                {faqs.map((faq) => (
                  <tr key={faq.id} className="hover:bg-brand-rose/[0.04] transition-colors">
                    <td className="py-4 pr-4 pl-2">
                      <span className="font-bold text-gray-200 block">{faq.question}</span>
                      <span className="text-[10px] text-gray-500 font-mono">{faq.key}</span>
                    </td>
                    <td className="py-4 pr-4 font-mono text-gray-400">
                      {faqPlacementLabels[faq.placement]}
                    </td>
                    <td className="py-4 pr-4 text-gray-400">
                      {faq.service ? faq.service.title : "Not applicable"}
                    </td>
                    <td className="py-4 pr-4 font-mono text-gray-400">{faq.order}</td>
                    <td className="py-4 pr-4">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          faq.isPublished
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/25"
                            : "bg-amber-500/10 text-amber-500 border border-amber-500/25"
                        }`}
                      >
                        {faq.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="py-4 pr-2">
                      <div className="flex justify-end gap-2">
                        <form action={toggleFaqPublishedAction}>
                          <input type="hidden" name="id" value={faq.id} />
                          <FaqToggleButton isPublished={faq.isPublished} />
                        </form>
                        <Link
                          href={`/admin/faqs/${faq.id}/edit`}
                          className="p-2 border border-brand-rose/20 hover:border-brand-rose text-gray-300 hover:text-brand-fg rounded-xl transition-all"
                          title="Edit FAQ"
                        >
                          <Edit size={14} />
                        </Link>
                        <form action={deleteFaqAction}>
                          <input type="hidden" name="id" value={faq.id} />
                          <ConfirmSubmitButton
                            message={`Delete FAQ "${faq.question}"? This cannot be undone.`}
                            className="p-2 border border-brand-rose/20 hover:border-brand-rose text-brand-rose-text rounded-xl transition-all disabled:opacity-50"
                          >
                            <Trash2 size={14} />
                          </ConfirmSubmitButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminShell>
  );
}
