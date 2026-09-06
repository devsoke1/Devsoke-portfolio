"use client";

import { useActionState, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import type { AdminProject, ServiceOption } from "@/lib/portfolio/types";
import type { ProjectFormState } from "./actions";
import MediaPicker from "../_components/MediaPicker";

type ProjectFormAction = (
  previousState: ProjectFormState,
  formData: FormData,
) => Promise<ProjectFormState>;

type ProjectFormProps = {
  action: ProjectFormAction;
  project?: AdminProject | null;
  services: ServiceOption[];
  submitLabel: string;
};

const initialState: ProjectFormState = {
  message: "",
  errors: {},
};

const inputClass =
  "w-full bg-brand-bg border border-brand-rose/15 focus:border-brand-rose focus:outline-none rounded-xl py-3 px-4 text-xs text-brand-fg placeholder:text-gray-500 transition-colors";
const textareaClass = `${inputClass} min-h-28 resize-y leading-relaxed`;
const labelClass = "text-xs font-semibold text-gray-300";

export default function ProjectForm({
  action,
  project,
  services,
  submitLabel,
}: ProjectFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(
    project?.featuredMediaId ?? null
  );
  const [imageUrl, setImageUrl] = useState(
    project?.image ?? "/window.svg"
  );
  const selectedServiceIds = new Set(
    project?.relatedServices.map((service) => service.id) ?? [],
  );

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
            <h2 className="text-lg font-bold font-heading text-brand-fg">Project Content</h2>
            <p className="text-xs text-gray-400 mt-1">Core project profile fields currently used by the public portfolio.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link href="/admin/projects" className="btn-secondary px-4 py-3 text-xs flex items-center justify-center gap-1.5">
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
            <input id="title" name="title" defaultValue={project?.title ?? ""} className={inputClass} required />
          </Field>
          <Field label="Slug" name="slug" error={state.errors.slug}>
            <input id="slug" name="slug" defaultValue={project?.slug ?? ""} className={inputClass} required />
          </Field>
          <Field label="Category" name="category" error={state.errors.category}>
            <input id="category" name="category" defaultValue={project?.category ?? ""} className={inputClass} required />
          </Field>
          <Field label="Tag" name="tag" error={state.errors.tag}>
            <input id="tag" name="tag" defaultValue={project?.tag ?? ""} className={inputClass} required />
          </Field>
          <Field label="Client" name="client" error={state.errors.client}>
            <input id="client" name="client" defaultValue={project?.client ?? ""} className={inputClass} required />
          </Field>
          <Field label="Timeline (optional)" name="timeline" error={state.errors.timeline}>
            <input id="timeline" name="timeline" defaultValue={project?.timeline ?? ""} className={inputClass} />
          </Field>
          <div className="lg:col-span-2">
            <MediaPicker
              selectedMediaId={selectedMediaId}
              currentLegacyUrl={imageUrl}
              onSelect={(mediaId, url) => {
                setSelectedMediaId(mediaId);
                if (url) {
                  setImageUrl(url);
                }
              }}
              label="Project Cover / Featured Image"
            />
            <input type="hidden" name="image" value={imageUrl || "/window.svg"} />
            {state.errors.image && (
              <p className="text-xs text-brand-rose-text mt-1 font-mono">{state.errors.image}</p>
            )}
          </div>
          <Field label="Demo URL" name="demoUrl" error={state.errors.demoUrl}>
            <input id="demoUrl" name="demoUrl" defaultValue={project?.demoUrl ?? ""} className={inputClass} placeholder="https://..." />
          </Field>
        </div>

        <Field label="Short Description" name="desc" error={state.errors.desc}>
          <textarea id="desc" name="desc" defaultValue={project?.desc ?? ""} className={textareaClass} required />
        </Field>

        <Field label="Long Description" name="longDesc" error={state.errors.longDesc}>
          <textarea id="longDesc" name="longDesc" defaultValue={project?.longDesc ?? ""} className={textareaClass} required />
        </Field>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Field label="Challenge" name="challenge" error={state.errors.challenge}>
            <textarea id="challenge" name="challenge" defaultValue={project?.challenge ?? ""} className={textareaClass} required />
          </Field>
          <Field label="Solution" name="solution" error={state.errors.solution}>
            <textarea id="solution" name="solution" defaultValue={project?.solution ?? ""} className={textareaClass} required />
          </Field>
        </div>
      </section>

      <section className="surface-card rounded-3xl p-5 sm:p-7 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Field label="Display Order" name="order" error={state.errors.order}>
            <input
              id="order"
              name="order"
              type="number"
              min="0"
              defaultValue={project?.order ?? 0}
              className={inputClass}
            />
          </Field>
          <label className="flex items-center gap-3 rounded-xl border border-brand-rose/15 bg-brand-bg px-4 py-3 text-xs font-semibold text-gray-300">
            <input
              type="checkbox"
              name="isPublished"
              defaultChecked={project?.isPublished ?? false}
              className="h-4 w-4 accent-brand-rose"
            />
            Published
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-brand-rose/15 bg-brand-bg px-4 py-3 text-xs font-semibold text-gray-300">
            <input
              type="checkbox"
              name="isFeatured"
              defaultChecked={project?.isFeatured ?? false}
              className="h-4 w-4 accent-brand-rose"
            />
            Featured on homepage
          </label>
        </div>

        <RepeatableTextList
          label="Technologies (optional)"
          name="tech"
          initialItems={project?.tech}
          error={state.errors.tech}
        />

        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-bold font-heading text-brand-fg">Related Services</h3>
            <p className="text-xs text-gray-400 mt-1">Associations are stored in the ProjectService junction table.</p>
          </div>
          {state.errors.serviceIds && (
            <p className="text-xs text-brand-rose-text">{state.errors.serviceIds}</p>
          )}
          {services.length === 0 ? (
            <div className="rounded-xl border border-brand-rose/15 bg-brand-bg p-4 text-xs text-gray-400">
              No services available yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {services.map((service) => (
                <label
                  key={service.id}
                  className="flex items-start gap-3 rounded-xl border border-brand-rose/15 bg-brand-bg px-4 py-3 text-xs text-gray-300"
                >
                  <input
                    type="checkbox"
                    name="serviceIds"
                    value={service.id}
                    defaultChecked={selectedServiceIds.has(service.id)}
                    className="mt-0.5 h-4 w-4 accent-brand-rose"
                  />
                  <span>
                    <span className="block font-semibold text-brand-fg">{service.title}</span>
                    <span className="mt-1 block font-mono text-[10px] text-gray-500">{service.slug}</span>
                  </span>
                </label>
              ))}
            </div>
          )}
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
            <button
              type="button"
              onClick={() =>
                setItems((current) =>
                  current.length === 1
                    ? [""]
                    : current.filter((_, itemIndex) => itemIndex !== index),
                )
              }
              className="rounded-xl border border-brand-rose/20 bg-brand-bg p-3 text-brand-rose-text hover:bg-brand-rose/10 transition-colors"
              aria-label={`Remove ${label.toLowerCase()} item`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
