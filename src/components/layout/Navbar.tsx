"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Calendar, Menu, X } from "lucide-react";
import BrandMark from "@/components/brand/BrandMark";
import { useBooking } from "@/context/BookingContext";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Work", href: "/work" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
  { label: "Blog", href: "/blog" },
];

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export default function Navbar() {
  const pathname = usePathname();
  const { openBooking } = useBooking();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => {
      const firstFocusable =
        mobileMenuRef.current?.querySelector<HTMLElement>(focusableSelector);
      (firstFocusable || mobileMenuRef.current)?.focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        return;
      }

      if (event.key !== "Tab" || !mobileMenuRef.current) return;

      const focusableElements = Array.from(
        mobileMenuRef.current.querySelectorAll<HTMLElement>(focusableSelector)
      ).filter((element) => element.offsetParent !== null);

      if (focusableElements.length === 0) {
        event.preventDefault();
        mobileMenuRef.current.focus();
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
  }, [isOpen]);

  const isAdminPage = pathname?.startsWith("/admin");
  if (isAdminPage) return null;

  const isActiveLink = (href: string) =>
    href === "/" ? pathname === href : pathname?.startsWith(href);

  const openHeaderBooking = (ctaLocation: string, ctaLabel: string) => {
    setIsOpen(false);
    openBooking({
      ctaLabel,
      ctaLocation,
    });
  };

  return (
    <header
      className={`fixed left-0 top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-brand-border bg-brand-bg/90 py-2.5 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:py-3"
          : "bg-transparent py-4 sm:py-5"
      }`}
    >
      <div className="site-container">
        <nav className="flex items-center justify-between" aria-label="Main Navigation">
          <Link
            href="/"
            className="inline-flex items-center py-1"
            aria-label="Devsoke home"
          >
            <BrandMark className="h-8 w-auto sm:h-9" decorative />
          </Link>

          <div className="hidden items-center gap-1 rounded-full border border-brand-border border-t-white/10 bg-brand-card/80 px-3 py-1.5 shadow-lg shadow-black/25 backdrop-blur-xl lg:flex">
            {navLinks.map((link) => {
              const isActive = Boolean(isActiveLink(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                    isActive
                      ? "text-brand-fg"
                      : "text-gray-400 hover:bg-brand-berry/10 hover:text-brand-fg"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full border border-brand-berry/60 bg-gradient-to-r from-brand-berry/30 to-brand-plum/40 shadow-sm"
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <button
              type="button"
              onClick={() => openHeaderBooking("Public header", "Header request call")}
              className="btn-primary rounded-full px-5 py-2.5 text-xs font-black shadow-lg shadow-brand-rose/25 hover:shadow-brand-rose/45"
            >
              <Calendar size={13} />
              Request Call
            </button>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() =>
                openHeaderBooking("Public mobile header", "Mobile header request")
              }
              className="btn-secondary px-3 py-2 text-[11px] font-black uppercase tracking-wider"
              aria-label="Request a call"
            >
              <Calendar size={13} />
              Request
            </button>
            <button
              type="button"
              onClick={() => setIsOpen((current) => !current)}
              className="rounded-xl border border-brand-border bg-brand-card p-2.5 text-gray-200 transition-colors hover:border-brand-berry/45 hover:text-brand-fg focus-visible:ring-2 focus-visible:ring-brand-rose-text"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={mobileMenuRef}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            tabIndex={-1}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-b border-brand-border bg-brand-bg/98 shadow-2xl shadow-black/70 backdrop-blur-2xl lg:hidden"
          >
            <div className="mx-auto max-w-lg space-y-6 px-5 py-6 sm:px-8 sm:py-8">
              <div className="flex items-center justify-between gap-4 px-2">
                <BrandMark className="h-7 w-auto" decorative />
                <span className="text-[11px] text-gray-500">Project inquiries</span>
              </div>

              <div className="flex flex-col space-y-2">
                {navLinks.map((link) => {
                  const isActive = Boolean(isActiveLink(link.href));

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-bold transition-all sm:text-base ${
                        isActive
                          ? "border border-brand-rose/40 bg-brand-rose/25 text-brand-fg"
                          : "text-gray-300 hover:bg-brand-rose/10 hover:text-brand-fg"
                      }`}
                    >
                      <span>{link.label}</span>
                      <ArrowRight
                        size={16}
                        className={isActive ? "text-brand-rose-text" : "text-gray-600"}
                      />
                    </Link>
                  );
                })}
              </div>

              <div className="space-y-3 border-t border-brand-rose/15 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    openHeaderBooking(
                      "Public mobile drawer",
                      "Mobile drawer strategy call"
                    );
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-rose py-3.5 text-xs font-extrabold uppercase tracking-wider text-brand-fg shadow-xl shadow-brand-rose/30 transition-all hover:bg-brand-plum"
                >
                  <Calendar size={15} />
                  Request Strategy Call
                </button>
                <div className="flex items-center justify-between gap-3 px-2 pt-2 text-[11px] text-gray-500">
                  <span>Devsoke</span>
                  <span>UK, UAE and Europe inquiries</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
