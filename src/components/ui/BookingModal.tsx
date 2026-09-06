"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle,
  Loader2,
  Mail,
  MessageSquare,
  User,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  useBooking,
  type BookingLaunchContext,
  type BookingSource,
} from "@/context/BookingContext";
import { submitInquiryAction } from "@/lib/inquiries/actions";

type InquiryFormData = {
  service: string;
  budget: string;
  timeline: string;
  company: string;
  name: string;
  email: string;
  message: string;
  date: string;
  projectContext: string;
  entryPath: string;
  referrer: string;
  ctaLabel: string;
  ctaLocation: string;
  source: BookingSource;
  submissionToken: string;
};

const SERVICE_FALLBACK = "Not sure yet - help me scope it";
const FLEXIBLE_CHOICE = "Not sure yet";

const services = [
  SERVICE_FALLBACK,
  "Web Development",
  "SEO & Digital Marketing",
  "Web Design / UI-UX",
  "E-commerce Development",
  "AI Integration & Development",
  "Company Dashboards",
  "Mobile App Development",
  "Custom Software & SaaS Tools",
];

const budgetOptions = [
  FLEXIBLE_CHOICE,
  "GBP under 5k",
  "GBP 5k - 15k",
  "GBP 15k - 50k",
  "GBP 50k+",
  "Prefer AED/EUR estimate",
];

const timelineOptions = [
  FLEXIBLE_CHOICE,
  "This month",
  "1 - 3 months",
  "3 - 6 months",
  "Ongoing",
];

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function createSubmissionToken() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function getLocalIsoToday() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

function inferSource(context: BookingLaunchContext): BookingSource {
  if (context.source) return context.source;
  return context.entryPath?.startsWith("/contact") ? "CONTACT_PAGE" : "BOOKING_MODAL";
}

function createInitialFormData(context: BookingLaunchContext): InquiryFormData {
  const service = context.service?.trim() || SERVICE_FALLBACK;

  return {
    service,
    budget: FLEXIBLE_CHOICE,
    timeline: FLEXIBLE_CHOICE,
    company: "",
    name: "",
    email: "",
    message: "",
    date: "",
    projectContext: context.projectContext || "",
    entryPath: context.entryPath || "",
    referrer: context.referrer || "",
    ctaLabel: context.ctaLabel || "",
    ctaLocation: context.ctaLocation || "",
    source: inferSource(context),
    submissionToken: createSubmissionToken(),
  };
}

function getStepForErrors(errors: Record<string, string>) {
  if (errors.service) return 1;
  if (errors.budget || errors.timeline) return 2;
  return 3;
}

function mapActionErrors(errors: Record<string, string>) {
  const nextErrors = { ...errors };

  if (nextErrors.preferredDate && !nextErrors.date) {
    nextErrors.date = nextErrors.preferredDate;
    delete nextErrors.preferredDate;
  }

  return nextErrors;
}

export default function BookingModal() {
  const {
    isOpen,
    closeBooking,
    selectedService,
    launchContext,
    launchId,
  } = useBooking();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<InquiryFormData>(() =>
    createInitialFormData({})
  );
  const [honeypot, setHoneypot] = useState("");
  const [renderTime, setRenderTime] = useState(() => Date.now());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const today = getLocalIsoToday();
  const currentContext = useMemo<BookingLaunchContext>(
    () => ({
      ...launchContext,
      service: launchContext.service || selectedService || undefined,
    }),
    [launchContext, selectedService]
  );

  const resetDraft = useCallback(() => {
    setFormData(createInitialFormData(currentContext));
    setHoneypot("");
    setStep(1);
    setIsSuccess(false);
    setIsPending(false);
    setErrors({});
    setGeneralError("");
  }, [currentContext]);

  const dismissModal = useCallback(() => {
    if (isPending) return;
    closeBooking();
  }, [closeBooking, isPending]);

  const finishSuccess = useCallback(() => {
    resetDraft();
    closeBooking();
  }, [closeBooking, resetDraft]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const resetTimer = window.setTimeout(() => {
      setFormData(createInitialFormData(currentContext));
      setHoneypot("");
      setRenderTime(Date.now());
      setStep(1);
      setIsSuccess(false);
      setIsPending(false);
      setErrors({});
      setGeneralError("");
    }, 0);

    return () => window.clearTimeout(resetTimer);
  }, [currentContext, isOpen, launchId]);

  useEffect(() => {
    if (!isOpen) return undefined;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      const firstFocusable =
        modalRef.current?.querySelector<HTMLElement>(focusableSelector);
      (firstFocusable || modalRef.current)?.focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        dismissModal();
        return;
      }

      if (event.key !== "Tab" || !modalRef.current) return;

      const focusableElements = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(focusableSelector)
      ).filter((element) => element.offsetParent !== null);

      if (focusableElements.length === 0) {
        event.preventDefault();
        modalRef.current.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [dismissModal, isOpen]);

  const updateField = (field: keyof InquiryFormData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const nextErrors = { ...current };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const handleNext = () => {
    const stepErrors: Record<string, string> = {};

    if (step === 1 && !formData.service.trim()) {
      stepErrors.service = "Choose a service area or select the scoping option.";
    }

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setErrors({});
    setStep((currentStep) => currentStep + 1);
  };

  const handleBack = () => {
    setErrors({});
    setStep((currentStep) => Math.max(1, currentStep - 1));
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

    if (formData.date && formData.date < today) {
      finalErrors.date = "Preferred discussion date cannot be in the past.";
    }

    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      setStep(3);
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
      payload.append("budget", formData.budget);
      payload.append("timeline", formData.timeline);
      payload.append("source", formData.source);
      payload.append("submissionToken", formData.submissionToken);
      payload.append("_t", String(renderTime));

      if (formData.company) payload.append("company", formData.company);
      if (formData.date) payload.append("date", formData.date);
      if (formData.message) payload.append("message", formData.message);
      if (formData.projectContext) {
        payload.append("projectContext", formData.projectContext);
      }
      if (formData.entryPath) payload.append("entryPath", formData.entryPath);
      if (formData.referrer) payload.append("referrer", formData.referrer);
      if (formData.ctaLabel) payload.append("ctaLabel", formData.ctaLabel);
      if (formData.ctaLocation) payload.append("ctaLocation", formData.ctaLocation);
      if (honeypot) payload.append("website", honeypot);

      const response = await submitInquiryAction(null, payload);

      if (response.success) {
        setIsSuccess(true);
        return;
      }

      if (response.errors) {
        const nextErrors = mapActionErrors(response.errors);
        setErrors(nextErrors);
        setStep(getStepForErrors(nextErrors));
      }

      setGeneralError(response.message || "Failed to submit the inquiry. Please try again.");
    } catch {
      setGeneralError("An unexpected error occurred. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-3.5 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 cursor-default bg-brand-bg/90 backdrop-blur-md"
          aria-hidden="true"
        />

        <motion.div
          ref={modalRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-modal-title"
          aria-describedby="booking-modal-description"
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          className="surface-card relative z-10 my-auto flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-brand-rose/30 text-brand-fg shadow-2xl"
        >
          <button
            type="button"
            onClick={dismissModal}
            disabled={isPending}
            className="absolute right-4 top-4 z-20 rounded-full p-2 text-gray-400 transition-colors hover:bg-brand-rose/15 hover:text-brand-fg focus-visible:ring-2 focus-visible:ring-brand-rose-text"
            aria-label="Close inquiry dialog"
          >
            <X size={18} />
          </button>

          <div className="flex-shrink-0 border-b border-brand-rose/20 bg-brand-card/90 p-5 pr-12 sm:p-7">
            <h3
              id="booking-modal-title"
              className="font-heading text-xl font-black text-brand-fg sm:text-2xl"
            >
              Request a Strategy Call
            </h3>
            <p
              id="booking-modal-description"
              className="mt-1 text-xs leading-relaxed text-gray-400 sm:text-sm"
            >
              Share a few details. A call is confirmed after we reply by email.
            </p>
          </div>

          <div className="flex-grow overflow-y-auto p-5 sm:p-7">
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center"
                aria-live="polite"
              >
                <CheckCircle className="h-16 w-16 text-brand-rose-text" />
                <h4 className="font-heading mt-4 text-xl font-bold text-brand-fg">
                  Inquiry Received
                </h4>
                <p className="mt-2 max-w-sm text-xs leading-relaxed text-gray-300 sm:text-sm">
                  Thanks,{" "}
                  <span className="font-semibold text-brand-rose-text">
                    {formData.name}
                  </span>
                  . We&apos;ve recorded your request for{" "}
                  <span className="font-semibold text-brand-fg">
                    {formData.service}
                  </span>{" "}
                  and will follow up at{" "}
                  <span className="text-brand-rose-text">{formData.email}</span>.
                </p>
                <button
                  type="button"
                  onClick={finishSuccess}
                  className="btn-primary mt-6 px-8 py-3 text-xs uppercase tracking-wider shadow-lg shadow-brand-rose/25"
                >
                  Done
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div
                  className="pointer-events-none absolute -left-[9999px] hidden opacity-0"
                  aria-hidden="true"
                >
                  <label htmlFor="hp-website">Leave this field blank</label>
                  <input
                    id="hp-website"
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(event) => setHoneypot(event.target.value)}
                  />
                </div>

                {generalError && (
                  <div
                    className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300"
                    role="alert"
                    aria-live="polite"
                  >
                    <AlertCircle size={14} className="flex-shrink-0 text-red-400" />
                    <span>
                      {generalError} You can also email{" "}
                      <a
                        href="mailto:hello@devsoke.com"
                        className="font-semibold underline underline-offset-2"
                      >
                        hello@devsoke.com
                      </a>
                      .
                    </span>
                  </div>
                )}

                <div className="flex items-center space-x-2 pb-2" aria-hidden="true">
                  {[1, 2, 3].map((stepNumber) => (
                    <div
                      key={stepNumber}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        stepNumber <= step
                          ? "bg-gradient-to-r from-brand-rose to-brand-plum"
                          : "bg-brand-rose/15"
                      }`}
                    />
                  ))}
                </div>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Step {step} of 3
                </p>

                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-3"
                  >
                    <div
                      id="booking-service-label"
                      className="font-mono flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-300"
                    >
                      <Briefcase size={14} className="text-brand-rose-text" />
                      What do you need help with?
                    </div>
                    <div
                      className="grid max-h-56 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:max-h-64"
                      role="radiogroup"
                      aria-labelledby="booking-service-label"
                      aria-describedby={errors.service ? "booking-service-error" : undefined}
                    >
                      {services.map((service) => (
                        <button
                          key={service}
                          type="button"
                          role="radio"
                          aria-checked={formData.service === service}
                          onClick={() => updateField("service", service)}
                          className={`flex w-full items-center justify-between rounded-xl border p-3 text-left text-xs font-semibold transition-all sm:text-sm ${
                            formData.service === service
                              ? "border-brand-rose bg-brand-rose/20 text-brand-fg shadow-md shadow-brand-rose/15"
                              : "border-brand-rose/15 bg-brand-bg text-gray-300 hover:border-brand-rose/40 hover:bg-brand-rose/5"
                          }`}
                        >
                          <span>{service}</span>
                          {formData.service === service && (
                            <CheckCircle
                              size={16}
                              className="ml-2 flex-shrink-0 text-brand-rose-text"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                    {errors.service && (
                      <p
                        id="booking-service-error"
                        className="text-xs font-medium text-brand-rose-text"
                      >
                        {errors.service}
                      </p>
                    )}

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={handleNext}
                        className="btn-primary px-6 py-3 text-xs uppercase tracking-wider shadow-md shadow-brand-rose/25"
                      >
                        Next <ArrowRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <div
                        id="booking-budget-label"
                        className="font-mono text-xs font-bold uppercase tracking-wider text-gray-300"
                      >
                        Estimated Budget Range
                      </div>
                      <div
                        className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                        role="radiogroup"
                        aria-labelledby="booking-budget-label"
                      >
                        {budgetOptions.map((budget) => (
                          <button
                            key={budget}
                            type="button"
                            role="radio"
                            aria-checked={formData.budget === budget}
                            onClick={() => updateField("budget", budget)}
                            className={`font-mono rounded-xl border p-3 text-center text-xs font-semibold transition-all ${
                              formData.budget === budget
                                ? "border-brand-rose bg-brand-rose/20 text-brand-fg shadow-sm"
                                : "border-brand-rose/15 bg-brand-bg text-gray-300 hover:border-brand-rose/30 hover:bg-brand-rose/5"
                            }`}
                          >
                            {budget}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div
                        id="booking-timeline-label"
                        className="font-mono text-xs font-bold uppercase tracking-wider text-gray-300"
                      >
                        Project Timeline
                      </div>
                      <div
                        className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                        role="radiogroup"
                        aria-labelledby="booking-timeline-label"
                      >
                        {timelineOptions.map((timeline) => (
                          <button
                            key={timeline}
                            type="button"
                            role="radio"
                            aria-checked={formData.timeline === timeline}
                            onClick={() => updateField("timeline", timeline)}
                            className={`font-mono rounded-xl border p-3 text-center text-xs font-semibold transition-all ${
                              formData.timeline === timeline
                                ? "border-brand-rose bg-brand-rose/20 text-brand-fg shadow-sm"
                                : "border-brand-rose/15 bg-brand-bg text-gray-300 hover:border-brand-rose/30 hover:bg-brand-rose/5"
                            }`}
                          >
                            {timeline}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="btn-secondary px-5 py-3 text-xs uppercase tracking-wider"
                      >
                        <ArrowLeft size={14} /> Back
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        className="btn-primary px-6 py-3 text-xs uppercase tracking-wider shadow-md shadow-brand-rose/25"
                      >
                        Next <ArrowRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-3"
                  >
                    <div className="space-y-1">
                      <label
                        htmlFor="booking-name"
                        className="font-mono flex items-center gap-1.5 text-xs font-semibold text-gray-300"
                      >
                        <User size={13} className="text-brand-rose-text" />
                        Full Name *
                      </label>
                      <input
                        id="booking-name"
                        type="text"
                        placeholder="Jane Smith"
                        value={formData.name}
                        disabled={isPending}
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? "booking-name-error" : undefined}
                        onChange={(event) => updateField("name", event.target.value)}
                        className="w-full rounded-xl border border-brand-rose/20 bg-brand-bg p-3 text-xs text-brand-fg transition-all placeholder:text-gray-500 focus:border-brand-rose focus:outline-none focus:ring-1 focus:ring-brand-rose/50 disabled:opacity-50 sm:text-sm"
                      />
                      {errors.name && (
                        <p
                          id="booking-name-error"
                          className="text-xs font-medium text-brand-rose-text"
                        >
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor="booking-email"
                        className="font-mono flex items-center gap-1.5 text-xs font-semibold text-gray-300"
                      >
                        <Mail size={13} className="text-brand-rose-text" />
                        Email Address *
                      </label>
                      <input
                        id="booking-email"
                        type="email"
                        placeholder="jane@example.com"
                        value={formData.email}
                        disabled={isPending}
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? "booking-email-error" : undefined}
                        onChange={(event) => updateField("email", event.target.value)}
                        className="w-full rounded-xl border border-brand-rose/20 bg-brand-bg p-3 text-xs text-brand-fg transition-all placeholder:text-gray-500 focus:border-brand-rose focus:outline-none focus:ring-1 focus:ring-brand-rose/50 disabled:opacity-50 sm:text-sm"
                      />
                      {errors.email && (
                        <p
                          id="booking-email-error"
                          className="text-xs font-medium text-brand-rose-text"
                        >
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor="booking-company"
                        className="font-mono flex items-center gap-1.5 text-xs font-semibold text-gray-300"
                      >
                        <Building2 size={13} className="text-brand-rose-text" />
                        Company
                      </label>
                      <input
                        id="booking-company"
                        type="text"
                        placeholder="Company name"
                        value={formData.company}
                        disabled={isPending}
                        aria-invalid={Boolean(errors.company)}
                        aria-describedby={errors.company ? "booking-company-error" : undefined}
                        onChange={(event) => updateField("company", event.target.value)}
                        className="w-full rounded-xl border border-brand-rose/20 bg-brand-bg p-3 text-xs text-brand-fg transition-all placeholder:text-gray-500 focus:border-brand-rose focus:outline-none focus:ring-1 focus:ring-brand-rose/50 disabled:opacity-50 sm:text-sm"
                      />
                      {errors.company && (
                        <p
                          id="booking-company-error"
                          className="text-xs font-medium text-brand-rose-text"
                        >
                          {errors.company}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor="booking-date"
                        className="font-mono flex items-center gap-1.5 text-xs font-semibold text-gray-300"
                      >
                        <Calendar size={13} className="text-brand-rose-text" />
                        Preferred Discussion Date
                      </label>
                      <input
                        id="booking-date"
                        type="date"
                        min={today}
                        value={formData.date}
                        disabled={isPending}
                        aria-invalid={Boolean(errors.date)}
                        aria-describedby={errors.date ? "booking-date-error" : undefined}
                        onChange={(event) => updateField("date", event.target.value)}
                        className="w-full rounded-xl border border-brand-rose/20 bg-brand-bg p-3 text-xs text-brand-fg transition-all [color-scheme:dark] focus:border-brand-rose focus:outline-none focus:ring-1 focus:ring-brand-rose/50 disabled:opacity-50 sm:text-sm"
                      />
                      {errors.date && (
                        <p
                          id="booking-date-error"
                          className="text-xs font-medium text-brand-rose-text"
                        >
                          {errors.date}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor="booking-message"
                        className="font-mono flex items-center gap-1.5 text-xs font-semibold text-gray-300"
                      >
                        <MessageSquare size={13} className="text-brand-rose-text" />
                        Brief Project Description
                      </label>
                      <textarea
                        id="booking-message"
                        rows={3}
                        placeholder="Goals, current site/app, target market, or anything useful"
                        value={formData.message}
                        disabled={isPending}
                        aria-invalid={Boolean(errors.message)}
                        aria-describedby={errors.message ? "booking-message-error" : undefined}
                        onChange={(event) => updateField("message", event.target.value)}
                        className="w-full resize-none rounded-xl border border-brand-rose/20 bg-brand-bg p-3 text-xs text-brand-fg transition-all placeholder:text-gray-500 focus:border-brand-rose focus:outline-none focus:ring-1 focus:ring-brand-rose/50 disabled:opacity-50 sm:text-sm"
                      />
                      {errors.message && (
                        <p
                          id="booking-message-error"
                          className="text-xs font-medium text-brand-rose-text"
                        >
                          {errors.message}
                        </p>
                      )}
                    </div>

                    <p className="text-[11px] leading-relaxed text-gray-500">
                      No calendar invite is created until a time is confirmed by
                      email. By sending this inquiry, you can be contacted about the
                      project. See the{" "}
                      <Link href="/privacy" className="text-brand-rose-text hover:text-brand-fg">
                        privacy policy
                      </Link>
                      .
                    </p>

                    <div className="flex justify-between gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleBack}
                        disabled={isPending}
                        className="btn-secondary px-5 py-3 text-xs uppercase tracking-wider disabled:opacity-50"
                      >
                        <ArrowLeft size={14} /> Back
                      </button>
                      <button
                        type="submit"
                        disabled={isPending}
                        className="btn-primary flex cursor-pointer items-center justify-center gap-2 px-6 py-3 text-xs uppercase tracking-wider shadow-lg shadow-brand-rose/25 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isPending ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Sending...
                          </>
                        ) : (
                          "Send Inquiry"
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
