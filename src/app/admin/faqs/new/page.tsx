import { requireAdmin } from "@/lib/auth/session";
import { getServiceOptions } from "@/lib/services/repository";
import AdminShell from "../../_components/AdminShell";
import FaqForm from "../FaqForm";
import { createFaqAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewFaqPage() {
  const [admin, services] = await Promise.all([
    requireAdmin(),
    getServiceOptions(),
  ]);

  return (
    <AdminShell admin={admin} active="faqs">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black font-heading text-brand-fg">Create FAQ</h1>
        <p className="text-xs text-gray-400 mt-1">
          Add a database-managed FAQ and choose where it should appear publicly.
        </p>
      </div>
      <FaqForm
        action={createFaqAction}
        services={services}
        submitLabel="Create FAQ"
      />
    </AdminShell>
  );
}
