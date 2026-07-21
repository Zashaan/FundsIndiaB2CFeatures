"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SummaryContext } from "@/lib/summary/summaryContext";
import { useWeeklySummary } from "@/lib/summary/useWeeklySummary";
import { SidebarDrawer } from "./SidebarDrawer";

const NAV_ITEMS = [
  { label: "Home", href: "/dashboard", icon: "H" },
  { label: "Funds", href: "/dashboard", icon: "F" },
  { label: "Goals", href: "/dashboard", icon: "G" },
  { label: "Advisor", href: "/advisor-calls", icon: "A" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const summary = useWeeklySummary();

  return (
    <SummaryContext.Provider value={{ openDescriptor: summary.openDescriptor, openToday: summary.openToday }}>
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col bg-slate-50 shadow-sm">
        <header className="sticky top-0 z-20 flex items-center justify-between bg-slate-50/95 px-4 py-3 backdrop-blur">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700"
          >
            RB
            <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-700 text-[8px] leading-none text-white">
              =
            </span>
          </button>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-normal text-emerald-700">FundsIndia</p>
            <p className="text-[11px] text-slate-500">Guided investing</p>
          </div>
          <button
            type="button"
            aria-label="Notifications"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-500"
          >
            N
          </button>
        </header>

        <main className="flex-1">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto grid max-w-md grid-cols-4 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur">
          {NAV_ITEMS.map((item) => {
            const active = item.href === "/advisor-calls" ? pathname.startsWith(item.href) : pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold ${
                  active ? "bg-emerald-50 text-emerald-700" : "text-slate-500"
                }`}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-current text-[10px]">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <SidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </div>
    </SummaryContext.Provider>
  );
}
