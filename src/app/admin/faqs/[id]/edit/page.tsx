import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminFaqById } from "@/lib/faqs/repository";
import { getServiceOptions } from "@/lib/services/repository";
import AdminShell from "../../../_components/AdminShell";
import FaqForm from "../../FaqForm";
import { updateFaqAction } from "../../actions";

type EditFaqPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function EditFaqPage({ params }: EditFaqPageProps) {
  const { id } = await params;
  const [admin, faq, services] = await Promise.all([
    requireAdmin(),
    getAdminFaqById(id),
    getServiceOptions(),
  ]);

  if (!faq) {
    notFound();
  }

  const updateAction = updateFaqAction.bind(null, faq.id);

  return (
    <AdminShell admin={admin} active="faqs">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black font-heading text-brand-fg">Edit FAQ</h1>
        <p className="text-xs text-gray-400 mt-1">
          Update FAQ content, placement, service association, order, and publication state.
        </p>
      </div>
      <FaqForm
        action={updateAction}
        faq={faq}
        services={services}
        submitLabel="Save FAQ"
      />
    </AdminShell>
  );
}
