"use client";

import { useActionState, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import type {
  AdminService,
  ServiceFaq,
  ServiceProcessStep,
} from "@/lib/portfolio/types";
import {
  serviceHomeIconNames,
  serviceIconNames,
  serviceVisualVariants,
} from "@/lib/portfolio/types";
import type { ServiceFormState } from "./actions";

type ServiceFormAction = (
  previousState: ServiceFormState,
  formData: FormData,
) => Promise<ServiceFormState>;

type ServiceFormProps = {
  action: ServiceFormAction;
  service?: AdminService | null;
  submitLabel: string;
};

const initialState: ServiceFormState = {
  message: "",
  errors: {},
};

const inputClass =
  "w-full bg-brand-bg border border-brand-rose/15 focus:border-brand-rose focus:outline-none rounded-xl py-3 px-4 text-xs text-brand-fg placeholder:text-gray-500 transition-colors";
const textareaClass = `${inputClass} min-h-28 resize-y leading-relaxed`;
const labelClass = "text-xs font-semibold text-gray-300";

export default function ServiceForm({
  action,
  service,
  submitLabel,
}: ServiceFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {state.message && (
        <div className="rounded-2xl border border-brand-rose/30 bg-brand-rose/10 p-4 text-xs font-semibold text-brand-rose-text">
          {state.message}
        </div>
      )}

      <section className="surface-card rounded-3xl p-5 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold font-heading text-brand-fg">Service Content</h2>
            <p className="text-xs text-gray-400 mt-1">Fields currently rendered by the public services pages.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link href="/admin/services" className="btn-secondary px-4 py-3 text-xs flex items-center justify-center gap-1.5">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Field label="Title" name="title" error={state.errors.title}>
            <input id="title" name="title" defaultValue={service?.title ?? ""} className={inputClass} required />
          </Field>
          <Field label="Home Title" name="homeTitle" error={state.errors.homeTitle}>
            <input id="homeTitle" name="homeTitle" defaultValue={service?.homeTitle ?? ""} className={inputClass} required />
          </Field>
          <Field label="Slug" name="slug" error={state.errors.slug}>
            <input id="slug" name="slug" defaultValue={service?.slug ?? ""} className={inputClass} required />
          </Field>
          <Field label="Booking Service Label" name="bookingService" error={state.errors.bookingService}>
            <input id="bookingService" name="bookingService" defaultValue={service?.bookingService ?? ""} className={inputClass} required />
          </Field>
          <Field label="Tagline" name="tagline" error={state.errors.tagline}>
            <input id="tagline" name="tagline" defaultValue={service?.tagline ?? ""} className={inputClass} required />
          </Field>
          <Field label="Overview Heading" name="overviewHeading" error={state.errors.overviewHeading}>
            <input id="overviewHeading" name="overviewHeading" defaultValue={service?.overviewHeading ?? ""} className={inputClass} required />
          </Field>
        </div>

        <Field label="Short Description" name="shortDescription" error={state.errors.shortDescription}>
          <textarea
            id="shortDescription"
            name="shortDescription"
            defaultValue={service?.shortDescription ?? ""}
            className={textareaClass}
            required
          />
        </Field>

        <Field label="Description" name="description" error={state.errors.description}>
          <textarea
            id="description"
            name="description"
            defaultValue={service?.description ?? ""}
            className={textareaClass}
            required
          />
        </Field>
      </section>

      <section className="surface-card rounded-3xl p-5 sm:p-7 space-y-6">
        <RepeatableTextList
          label="Overview Paragraphs"
          name="overview"
          initialItems={service?.overview}
          error={state.errors.overview}
        />
        <RepeatableTextList
          label="Capabilities"
          name="capabilities"
          initialItems={service?.capabilities}
          error={state.errors.capabilities}
        />
        <RepeatableTextList
          label="Technologies"
          name="technologies"
          initialItems={service?.technologies}
          error={state.errors.technologies}
        />
        <ProcessList initialItems={service?.process} error={state.errors.process} />
        <FaqList initialItems={service?.faq} error={state.errors.faq} />
      </section>

      <section className="surface-card rounded-3xl p-5 sm:p-7 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Icon" name="icon" error={state.errors.icon}>
            <select id="icon" name="icon" defaultValue={service?.icon ?? "Code2"} className={inputClass}>
              {serviceIconNames.map((icon) => (
                <option key={icon} value={icon}>
                  {icon}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Homepage Icon" name="homeIcon" error={state.errors.homeIcon}>
            <select id="homeIcon" name="homeIcon" defaultValue={service?.homeIcon ?? "Globe"} className={inputClass}>
              {serviceHomeIconNames.map((icon) => (
                <option key={icon} value={icon}>
                  {icon}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Visual Variant" name="visualVariant" error={state.errors.visualVariant}>
            <select
              id="visualVariant"
              name="visualVariant"
              defaultValue={service?.visualVariant ?? "blueprint"}
              className={inputClass}
            >
              {serviceVisualVariants.map((variant) => (
                <option key={variant} value={variant}>
                  {variant}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Homepage Grid Span" name="homeGridClass" error={state.errors.homeGridClass}>
            <select
              id="homeGridClass"
              name="homeGridClass"
              defaultValue={service?.homeGridClass ?? "md:col-span-1"}
              className={inputClass}
            >
              <option value="md:col-span-1">Standard</option>
              <option value="md:col-span-2">Wide</option>
            </select>
          </Field>
          <Field label="Display Order" name="order" error={state.errors.order}>
            <input
              id="order"
              name="order"
              type="number"
              min="0"
              defaultValue={service?.order ?? 0}
              className={inputClass}
            />
          </Field>
          <label className="flex items-center gap-3 rounded-xl border border-brand-rose/15 bg-brand-bg px-4 py-3 text-xs font-semibold text-gray-300">
            <input
              type="checkbox"
              name="isPublished"
              defaultChecked={service?.isPublished ?? false}
              className="h-4 w-4 accent-brand-rose"
            />
            Published
          </label>
        </div>
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
      {error && <p className="text-xs text-brand-rose-text">{error}</p>}
    </div>
  );
}

function RepeatableTextList({
  label,
  name,
  initialItems,
  error,
}: {
  label: string;
  name: string;
  initialItems?: string[];
  error?: string;
}) {
  const [items, setItems] = useState(
    initialItems && initialItems.length > 0 ? initialItems : [""],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold font-heading text-brand-fg">{label}</h3>
          {error && <p className="text-xs text-brand-rose-text mt-1">{error}</p>}
        </div>
        <button
          type="button"
          onClick={() => setItems((current) => [...current, ""])}
          className="btn-secondary px-3 py-2 text-xs flex items-center gap-1.5"
        >
          <Plus size={13} /> Add
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={`${name}-${index}`} className="flex gap-2">
            <input
              name={name}
              value={item}
              onChange={(event) =>
                setItems((current) =>
                  current.map((value, itemIndex) =>
                    itemIndex === index ? event.target.value : value,
                  ),
                )
              }
              className={inputClass}
            />
            <RemoveRowButton
              label={`Remove ${label.toLowerCase()} item`}
              onClick={() =>
                setItems((current) =>
                  current.length === 1
                    ? [""]
                    : current.filter((_, itemIndex) => itemIndex !== index),
                )
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProcessList({
  initialItems,
  error,
}: {
  initialItems?: ServiceProcessStep[];
  error?: string;
}) {
  const [items, setItems] = useState(
    initialItems && initialItems.length > 0
      ? initialItems
      : [{ title: "", description: "" }],
  );

  return (
    <div className="space-y-3">
      <ListHeader
        title="Process Steps"
        error={error}
        onAdd={() => setItems((current) => [...current, { title: "", description: "" }])}
      />
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={`process-${index}`} className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.35fr)_minmax(0,0.65fr)_auto] gap-2">
            <input
              name="processTitle"
              value={item.title}
              onChange={(event) =>
                setItems((current) =>
                  current.map((value, itemIndex) =>
                    itemIndex === index ? { ...value, title: event.target.value } : value,
                  ),
                )
              }
              className={inputClass}
              placeholder="Step title"
            />
            <input
              name="processDescription"
              value={item.description}
              onChange={(event) =>
                setItems((current) =>
                  current.map((value, itemIndex) =>
                    itemIndex === index ? { ...value, description: event.target.value } : value,
                  ),
                )
              }
              className={inputClass}
              placeholder="Step description"
            />
            <RemoveRowButton
              label="Remove process step"
              onClick={() =>
                setItems((current) =>
                  current.length === 1
                    ? [{ title: "", description: "" }]
                    : current.filter((_, itemIndex) => itemIndex !== index),
                )
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function FaqList({
  initialItems,
  error,
}: {
  initialItems?: ServiceFaq[];
  error?: string;
}) {
  const [items, setItems] = useState(
    initialItems && initialItems.length > 0
      ? initialItems
      : [{ question: "", answer: "" }],
  );

  return (
    <div className="space-y-3">
      <ListHeader
        title="FAQ Items"
        error={error}
        onAdd={() => setItems((current) => [...current, { question: "", answer: "" }])}
      />
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={`faq-${index}`} className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.35fr)_minmax(0,0.65fr)_auto] gap-2">
            <input
              name="faqQuestion"
              value={item.question}
              onChange={(event) =>
                setItems((current) =>
                  current.map((value, itemIndex) =>
                    itemIndex === index ? { ...value, question: event.target.value } : value,
                  ),
                )
              }
              className={inputClass}
              placeholder="Question"
            />
            <input
              name="faqAnswer"
              value={item.answer}
              onChange={(event) =>
                setItems((current) =>
                  current.map((value, itemIndex) =>
                    itemIndex === index ? { ...value, answer: event.target.value } : value,
                  ),
                )
              }
              className={inputClass}
              placeholder="Answer"
            />
            <RemoveRowButton
              label="Remove FAQ item"
              onClick={() =>
                setItems((current) =>
                  current.length === 1
                    ? [{ question: "", answer: "" }]
                    : current.filter((_, itemIndex) => itemIndex !== index),
                )
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ListHeader({
  title,
  error,
  onAdd,
}: {
  title: string;
  error?: string;
  onAdd: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <h3 className="text-sm font-bold font-heading text-brand-fg">{title}</h3>
        {error && <p className="text-xs text-brand-rose-text mt-1">{error}</p>}
      </div>
      <button type="button" onClick={onAdd} className="btn-secondary px-3 py-2 text-xs flex items-center gap-1.5">
        <Plus size={13} /> Add
      </button>
    </div>
  );
}

function RemoveRowButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-brand-rose/20 bg-brand-bg p-3 text-brand-rose-text hover:bg-brand-rose/10 transition-colors"
      aria-label={label}
    >
      <Trash2 size={14} />
    </button>
  );
}
