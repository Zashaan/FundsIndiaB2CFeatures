"use client";

import { createContext, useContext } from "react";

export interface SummaryContextValue {
  openDescriptor: (id: string) => void;
  openToday: () => void;
}

export const SummaryContext = createContext<SummaryContextValue | null>(null);

export function useSummaryContext(): SummaryContextValue {
  const ctx = useContext(SummaryContext);
  if (!ctx) throw new Error("useSummaryContext must be used within AppShell");
  return ctx;
}
