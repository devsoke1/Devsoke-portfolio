"use client";

import { useActionState, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import type { AdminFaq, FaqPlacementValue } from "@/lib/faqs/types";
import { faqPlacementLabels, faqPlacements } from "@/lib/faqs/types";
import type { ServiceOption } from "@/lib/portfolio/types";
import type { FaqFormState } from "./actions";

type FaqFormAction = (
  previousState: FaqFormState,
  formData: FormData,
) => Promise<FaqFormState>;

type FaqFormProps = {
  action: FaqFormAction;
  faq?: AdminFaq | null;
  services: ServiceOption[];
  submitLabel: string;
};

const initialState: FaqFormState = {
  message: "",
  errors: {},
};

const inputClass =
  "w-full bg-brand-bg border border-brand-rose/15 focus:border-brand-rose focus:outline-none rounded-xl py-3 px-4 text-xs text-brand-fg placeholder:text-gray-500 transition-colors";
const textareaClass = `${inputClass} min-h-44 resize-y leading-relaxed`;
const labelClass = "text-xs font-semibold text-gray-300";

export default function FaqForm({
  action,
  faq,
  services,
  submitLabel,
}: FaqFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [placement, setPlacement] = useState<FaqPlacementValue>(
    faq?.placement ?? "HOME",
  );

  return (
    <form action={formAction} className="space-y-6">
      {state.message && (
        <div
          aria-live="polite"
          className="rounded-2xl border border-brand-rose/30 bg-brand-rose/10 p-4 text-xs font-semibold text-brand-rose-text"
        >
          {state.message}
        </div>
      )}

      <section className="surface-card rounded-3xl p-5 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold font-heading text-brand-fg">FAQ Content</h2>
            <p className="text-xs text-gray-400 mt-1">
              Manage database-backed FAQs shown on selected public pages.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link href="/admin/faqs" className="btn-secondary px-4 py-3 text-xs flex items-center justify-center gap-1.5">
              <ArrowLeft size={14} /> Back
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary px-5 py-3 text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Save size={14} /> {isPending ? "Saving" : submitLabel}
            </button>
          </div>
        </div>

        <Field label="Question" name="question" error={state.errors.question}>
          <input
            id="question"
            name="question"
            defaultValue={faq?.question ?? ""}
            aria-invalid={Boolean(state.errors.question)}
            aria-describedby={state.errors.question ? "question-error" : undefined}
            className={inputClass}
            required
          />
        </Field>

        <Field label="Answer" name="answer" error={state.errors.answer}>
          <textarea
            id="answer"
            name="answer"
            defaultValue={faq?.answer ?? ""}
            aria-invalid={Boolean(state.errors.answer)}
            aria-describedby={state.errors.answer ? "answer-error" : undefined}
            className={textareaClass}
            required
          />
        </Field>
      </section>

      <section className="surface-card rounded-3xl p-5 sm:p-7 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Field label="Placement" name="placement" error={state.errors.placement}>
            <select
              id="placement"
              name="placement"
              value={placement}
              onChange={(event) =>
                setPlacement(event.target.value as FaqPlacementValue)
              }
              aria-invalid={Boolean(state.errors.placement)}
              aria-describedby={state.errors.placement ? "placement-error" : undefined}
              className={inputClass}
              required
            >
              {faqPlacements.map((option) => (
                <option key={option} value={option}>
                  {faqPlacementLabels[option]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Display Order" name="order" error={state.errors.order}>
            <input
              id="order"
              name="order"
              type="number"
              min="0"
              defaultValue={faq?.order ?? 0}
              aria-invalid={Boolean(state.errors.order)}
              aria-describedby={state.errors.order ? "order-error" : undefined}
              className={inputClass}
            />
          </Field>

          <label className="flex items-center gap-3 rounded-xl border border-brand-rose/15 bg-brand-bg px-4 py-3 text-xs font-semibold text-gray-300">
            <input
              type="checkbox"
              name="isPublished"
              defaultChecked={faq?.isPublished ?? true}
              className="h-4 w-4 accent-brand-rose"
            />
            Published
          </label>
        </div>

        {placement === "SERVICE_DETAIL" ? (
          <Field label="Related Service" name="serviceId" error={state.errors.serviceId}>
            <select
              id="serviceId"
              name="serviceId"
              defaultValue={faq?.serviceId ?? ""}
              aria-invalid={Boolean(state.errors.serviceId)}
              aria-describedby={state.errors.serviceId ? "serviceId-error" : undefined}
              className={inputClass}
              required
            >
              <option value="">Choose a service</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.title}
                </option>
              ))}
            </select>
          </Field>
        ) : (
          <input type="hidden" name="serviceId" value="" />
        )}
      </section>
    </form>
  );
}

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>
      {children}
      {error && (
        <p id={`${name}-error`} className="text-xs text-brand-rose-text">
          {error}
        </p>
      )}
    </div>
  );
}
