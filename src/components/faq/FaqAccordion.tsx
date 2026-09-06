"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { ChevronDown } from "lucide-react";
import type { PublicFaq } from "@/lib/faqs/types";

type FaqAccordionProps = {
  faqs: PublicFaq[];
};

export default function FaqAccordion({ faqs }: FaqAccordionProps) {
  const [openIds, setOpenIds] = useState(() => new Set(faqs.map((faq) => faq.id)));
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const toggleFaq = (id: string) => {
    setOpenIds((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const focusButton = (index: number) => {
    buttonRefs.current[index]?.focus();
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
    faqId: string,
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusButton((index + 1) % faqs.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusButton((index - 1 + faqs.length) % faqs.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusButton(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusButton(faqs.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleFaq(faqId);
    }
  };

  return (
    <div className="space-y-3">
      {faqs.map((faq, index) => {
        const isOpen = openIds.has(faq.id);
        const triggerId = `faq-trigger-${faq.id}`;
        const panelId = `faq-panel-${faq.id}`;

        return (
          <div
            key={faq.id}
            className="overflow-hidden rounded-2xl border border-brand-border bg-brand-bg/70"
          >
            <h3>
              <button
                ref={(element) => {
                  buttonRefs.current[index] = element;
                }}
                type="button"
                id={triggerId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggleFaq(faq.id)}
                onKeyDown={(event) => handleKeyDown(event, index, faq.id)}
                className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left font-sans text-sm font-semibold text-brand-fg transition-colors hover:bg-brand-rose/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-rose-text sm:px-5 sm:text-base"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  size={17}
                  className={`flex-shrink-0 text-brand-rose-text transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              hidden={!isOpen}
              className="px-4 pb-4 text-xs leading-relaxed text-gray-400 sm:px-5 sm:text-sm"
            >
              {faq.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
