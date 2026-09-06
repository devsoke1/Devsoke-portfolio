"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, type FormEvent, type ReactNode } from "react";
import { useBooking } from "@/context/BookingContext";
import { submitInquiryAction } from "@/lib/inquiries/actions";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Home,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  User,
} from "lucide-react";

const services = [
  "Not sure yet - help me scope it",
  "Web Development",
  "SEO & Digital Marketing",
  "Web Design / UI-UX",
  "E-commerce Development",
  "AI Integration & Development",
  "Company Dashboards",
  "Mobile App Development",
  "Custom Software & SaaS Tools",
];

function createSubmissionToken() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function getEntryPath() {
  if (typeof window === "undefined") return "/contact";
  return `${window.location.pathname}${window.location.search}`;
}

function getReferrer() {
  if (typeof document === "undefined") return "";
  return document.referrer;
}

export default function ContactClient({
  faqSection,
}: {
  faqSection?: ReactNode;
}) {
  const { openBooking } = useBooking();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    service: services[0],
    message: "",
  });
  const [honeypot, setHoneypot] = useState("");
  const [renderTime, setRenderTime] = useState(() => Date.now());
  const [submissionToken, setSubmissionToken] = useState(createSubmissionToken);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const nextErrors = { ...current };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const resetContactForm = () => {
    setFormData({
      name: "",
      email: "",
      company: "",
      service: services[0],
      message: "",
    });
    setHoneypot("");
    setRenderTime(Date.now());
    setSubmissionToken(createSubmissionToken());
    setErrors({});
    setGeneralError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const finalErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      finalErrors.name = "Name is required.";
    }

    if (!formData.email.trim()) {
      finalErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      finalErrors.email = "Enter a valid email address.";
    }

    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      return;
    }

    setIsPending(true);
    setGeneralError("");
    setErrors({});

    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("email", formData.email);
      payload.append("service", formData.service);
      payload.append("budget", "Not sure yet");
      payload.append("timeline", "Not sure yet");
      payload.append("source", "CONTACT_PAGE");
      payload.append("entryPath", getEntryPath());
      payload.append("ctaLabel", "Contact page form");
      payload.append("ctaLocation", "Contact page inline form");
      payload.append("submissionToken", submissionToken);
      payload.append("_t", String(renderTime));

      if (formData.company) payload.append("company", formData.company);
      if (formData.message) payload.append("message", formData.message);
      if (getReferrer()) payload.append("referrer", getReferrer());
      if (honeypot) payload.append("website", honeypot);

      const response = await submitInquiryAction(null, payload);

      if (response.success) {
        setIsSuccess(true);
        resetContactForm();
        return;
      }

      if (response.errors) {
        setErrors(response.errors);
      }

      setGeneralError(response.message || "Failed to send the inquiry. Please try again.");
    } catch {
      setGeneralError("An unexpected error occurred. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="pt-28 sm:pt-36 md:pt-40 pb-16 sm:pb-24 bg-brand-bg min-h-screen relative overflow-x-hidden">
      <div className="absolute inset-0 bg-grid-blueprint bg-radial-fade pointer-events-none z-0" />
      <div className="absolute top-24 -left-20 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-brand-plum/15 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-24 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-brand-rose/10 blur-3xl pointer-events-none" />

      <section className="relative z-10 pb-14 sm:pb-20">
        <div className="site-container">
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex min-w-0 items-center gap-2 overflow-hidden text-[11px] font-mono font-bold uppercase tracking-wider text-gray-500"
          >
            <Link href="/" className="inline-flex items-center gap-1 hover:text-brand-rose-text transition-colors flex-shrink-0">
              <Home size={12} />
              Home
            </Link>
            <ChevronRight size={13} className="flex-shrink-0 text-gray-700" />
            <span className="truncate text-brand-rose-text min-w-0">Contact</span>
          </nav>

          <div className="text-center max-w-3xl mx-auto space-y-5">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading text-brand-fg leading-tight"
            >
              Tell Us What You Need
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed"
            >
              Send a short brief or request a discussion about a website, app,
              dashboard, ecommerce build, AI workflow, or UX improvement.
            </motion.p>
          </div>
        </div>
      </section>

      <section className="relative z-10 pb-14 sm:pb-20">
        <div className="site-container grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <form
            onSubmit={handleSubmit}
            className="surface-card rounded-3xl border border-brand-rose/30 p-6 shadow-xl sm:p-8"
            noValidate
          >
            <div className="mb-6 space-y-2">
              <h2 className="font-heading text-xl font-bold text-brand-fg sm:text-2xl">
                Send a Project Brief
              </h2>
              <p className="text-xs leading-relaxed text-gray-400 sm:text-sm">
                Name and email are enough to start. More detail helps route the
                inquiry.
              </p>
            </div>

            <div className="pointer-events-none absolute -left-[9999px] hidden opacity-0" aria-hidden="true">
              <label htmlFor="contact-website">Leave this field blank</label>
              <input
                id="contact-website"
                name="website"
                value={honeypot}
                tabIndex={-1}
                autoComplete="off"
                onChange={(event) => setHoneypot(event.target.value)}
              />
            </div>

            {generalError && (
              <div
                className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300"
                role="alert"
              >
                <AlertCircle size={14} className="flex-shrink-0 text-red-400" />
                <span>{generalError}</span>
              </div>
            )}

            {isSuccess && (
              <div
                className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs text-emerald-200"
                role="status"
              >
                <CheckCircle2 size={14} className="flex-shrink-0 text-emerald-300" />
                <span>Inquiry received. We will reply by email.</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="contact-name" className="font-mono flex items-center gap-1.5 text-xs font-semibold text-gray-300">
                  <User size={13} className="text-brand-rose-text" />
                  Full Name *
                </label>
                <input
                  id="contact-name"
                  value={formData.name}
                  disabled={isPending}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "contact-name-error" : undefined}
                  onChange={(event) => updateField("name", event.target.value)}
                  className="w-full rounded-xl border border-brand-rose/20 bg-brand-bg p-3 text-xs text-brand-fg transition-all placeholder:text-gray-500 focus:border-brand-rose focus:outline-none focus:ring-1 focus:ring-brand-rose/50 disabled:opacity-50 sm:text-sm"
                  placeholder="Jane Smith"
                />
                {errors.name && (
                  <p id="contact-name-error" className="text-xs font-medium text-brand-rose-text">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="contact-email" className="font-mono flex items-center gap-1.5 text-xs font-semibold text-gray-300">
                  <Mail size={13} className="text-brand-rose-text" />
                  Email Address *
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={formData.email}
                  disabled={isPending}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "contact-email-error" : undefined}
                  onChange={(event) => updateField("email", event.target.value)}
                  className="w-full rounded-xl border border-brand-rose/20 bg-brand-bg p-3 text-xs text-brand-fg transition-all placeholder:text-gray-500 focus:border-brand-rose focus:outline-none focus:ring-1 focus:ring-brand-rose/50 disabled:opacity-50 sm:text-sm"
                  placeholder="jane@example.com"
                />
                {errors.email && (
                  <p id="contact-email-error" className="text-xs font-medium text-brand-rose-text">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="contact-company" className="font-mono flex items-center gap-1.5 text-xs font-semibold text-gray-300">
                  <Building2 size={13} className="text-brand-rose-text" />
                  Company
                </label>
                <input
                  id="contact-company"
                  value={formData.company}
                  disabled={isPending}
                  onChange={(event) => updateField("company", event.target.value)}
                  className="w-full rounded-xl border border-brand-rose/20 bg-brand-bg p-3 text-xs text-brand-fg transition-all placeholder:text-gray-500 focus:border-brand-rose focus:outline-none focus:ring-1 focus:ring-brand-rose/50 disabled:opacity-50 sm:text-sm"
                  placeholder="Company name"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="contact-service" className="font-mono text-xs font-semibold text-gray-300">
                  Service Area
                </label>
                <select
                  id="contact-service"
                  value={formData.service}
                  disabled={isPending}
                  onChange={(event) => updateField("service", event.target.value)}
                  className="w-full rounded-xl border border-brand-rose/20 bg-brand-bg p-3 text-xs text-brand-fg transition-all focus:border-brand-rose focus:outline-none focus:ring-1 focus:ring-brand-rose/50 disabled:opacity-50 sm:text-sm"
                >
                  {services.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 space-y-1">
              <label htmlFor="contact-message" className="font-mono flex items-center gap-1.5 text-xs font-semibold text-gray-300">
                <MessageSquare size={13} className="text-brand-rose-text" />
                Project Notes
              </label>
              <textarea
                id="contact-message"
                rows={5}
                value={formData.message}
                disabled={isPending}
                onChange={(event) => updateField("message", event.target.value)}
                className="w-full resize-none rounded-xl border border-brand-rose/20 bg-brand-bg p-3 text-xs text-brand-fg transition-all placeholder:text-gray-500 focus:border-brand-rose focus:outline-none focus:ring-1 focus:ring-brand-rose/50 disabled:opacity-50 sm:text-sm"
                placeholder="Goals, current site/app, target market, integrations, timeline, or anything useful"
              />
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-[11px] leading-relaxed text-gray-500">
                A calendar time is not reserved by this form. Devsoke will reply
                by email to confirm the best next step. See the{" "}
                <Link href="/privacy" className="text-brand-rose-text hover:text-brand-fg">
                  privacy policy
                </Link>
                .
              </p>
              <button
                type="submit"
                disabled={isPending}
                className="btn-primary flex w-full items-center justify-center gap-2 px-7 py-3.5 text-xs uppercase tracking-wider shadow-md shadow-brand-rose/25 disabled:opacity-60 sm:w-auto"
              >
                {isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Brief <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 gap-6">
            <div className="surface-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 border border-brand-rose/30 shadow-xl relative overflow-hidden">
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-brand-rose/15 border border-brand-rose/30 w-fit text-brand-rose-text">
                  <Calendar size={24} />
                </div>
                <h2 className="text-lg sm:text-xl font-bold font-heading text-brand-fg">
                  Request a Call
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                  Share scope, deliverables, and requirements in the inquiry
                  dialog. The call time is confirmed after a reply.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  openBooking({
                    source: "CONTACT_PAGE",
                    ctaLabel: "Request a call",
                    ctaLocation: "Contact page call card",
                  })
                }
                className="btn-primary w-full py-3.5 text-xs shadow-md shadow-brand-rose/25 flex items-center justify-center gap-2"
              >
                Request a Call <ArrowRight size={14} />
              </button>
            </div>

            <div className="surface-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 border border-brand-rose/20 shadow-xl">
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-brand-rose/15 border border-brand-rose/30 w-fit text-brand-rose-text">
                  <Mail size={24} />
                </div>
                <h2 className="text-lg sm:text-xl font-bold font-heading text-brand-fg">
                  Direct Email
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                  Prefer direct correspondence? Send an overview of your
                  requirements and project context.
                </p>
              </div>
              <a
                href="mailto:hello@devsoke.com"
                className="btn-secondary w-full py-3.5 text-xs flex items-center justify-center gap-2"
              >
                hello@devsoke.com <ExternalLink size={13} />
              </a>
            </div>

            <div className="surface-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 border border-brand-rose/20 shadow-xl">
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-brand-rose/15 border border-brand-rose/30 w-fit text-brand-rose-text">
                  <MapPin size={24} />
                </div>
                <h2 className="text-lg sm:text-xl font-bold font-heading text-brand-fg">
                  Collaboration Regions
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                  Remote collaboration for UK, UAE, and European project
                  inquiries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-14 sm:py-20 bg-brand-card/90 border-y border-brand-rose/10">
        <div className="site-container grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-4 space-y-4">
            <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-brand-fg">
              What to Expect
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              Initial conversations focus on the commercial goal, user journey,
              technical constraints, and the smallest useful next step.
            </p>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                title: "01. Scope & Objective",
                body: "Clarify core users, main features, target markets, and the role the site or software needs to play.",
              },
              {
                title: "02. Architecture & Tech",
                body: "Review frameworks, APIs, content management, data storage, hosting, and integration needs.",
              },
              {
                title: "03. Design & Interaction",
                body: "Identify UX risks, responsive design needs, motion constraints, and any custom interaction requirements.",
              },
              {
                title: "04. Milestones & Timeline",
                body: "Shape delivery phases, test checkpoints, responsibilities, and a sensible follow-up plan.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-5 rounded-2xl bg-brand-bg border border-brand-rose/15 space-y-2"
              >
                <div className="flex items-center gap-2 text-brand-rose-text font-mono text-xs font-bold">
                  <CheckCircle2 size={16} /> {item.title}
                </div>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {faqSection}

      <section className="relative z-10 py-14 sm:py-20 border-t border-brand-rose/10 bg-brand-card/90">
        <div className="site-container">
          <div className="surface-card rounded-3xl p-6 sm:p-10 md:p-12 border border-brand-rose/30 text-center max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-brand-rose/20 blur-2xl pointer-events-none" />
            <h2 className="text-xl sm:text-3xl font-black font-heading text-brand-fg">
              Request a Strategy Call
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm mt-3 mb-6 max-w-xl mx-auto leading-relaxed">
              Share the project context and we will reply by email with the best
              next step.
            </p>
            <button
              type="button"
              onClick={() =>
                openBooking({
                  source: "CONTACT_PAGE",
                  ctaLabel: "Bottom strategy call",
                  ctaLocation: "Contact page bottom CTA",
                })
              }
              className="btn-primary w-full sm:w-auto px-8 py-3.5 sm:py-4 text-xs uppercase tracking-wider shadow-lg shadow-brand-rose/25"
            >
              Open Inquiry Dialog
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
