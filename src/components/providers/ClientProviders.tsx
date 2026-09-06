"use client";

import React from "react";
import { BookingProvider } from "@/context/BookingContext";
import BookingModal from "@/components/ui/BookingModal";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <BookingProvider>
      <BookingModal />
      {children}
    </BookingProvider>
  );
}
