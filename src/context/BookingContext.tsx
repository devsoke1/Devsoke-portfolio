"use client";

import React, { createContext, useContext, useState } from "react";

export type BookingSource = "BOOKING_MODAL" | "CONTACT_PAGE";

export type BookingLaunchContext = {
  service?: string;
  projectContext?: string;
  entryPath?: string;
  referrer?: string;
  ctaLabel?: string;
  ctaLocation?: string;
  source?: BookingSource;
};

interface BookingContextType {
  isOpen: boolean;
  openBooking: (context?: string | BookingLaunchContext) => void;
  closeBooking: () => void;
  selectedService: string;
  launchContext: BookingLaunchContext;
  launchId: number;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [launchContext, setLaunchContext] = useState<BookingLaunchContext>({});
  const [launchId, setLaunchId] = useState(0);

  const openBooking = (context: string | BookingLaunchContext = {}) => {
    const normalizedContext =
      typeof context === "string" ? { service: context } : context;
    const entryPath =
      normalizedContext.entryPath ||
      (typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : undefined);
    const referrer =
      normalizedContext.referrer ||
      (typeof document !== "undefined" && document.referrer
        ? document.referrer
        : undefined);
    const nextContext = {
      ...normalizedContext,
      entryPath,
      referrer,
    };

    setSelectedService(nextContext.service ?? "");
    setLaunchContext(nextContext);
    setLaunchId((current) => current + 1);
    setIsOpen(true);
  };

  const closeBooking = () => {
    setIsOpen(false);
  };

  return (
    <BookingContext.Provider
      value={{
        isOpen,
        openBooking,
        closeBooking,
        selectedService,
        launchContext,
        launchId,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}
