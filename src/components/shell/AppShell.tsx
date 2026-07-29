"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SummaryContext } from "@/lib/summary/summaryContext";
import { useWeeklySummary } from "@/lib/summary/useWeeklySummary";
import { ThemeProvider } from "@/lib/theme/themeContext";
import { SidebarDrawer } from "./SidebarDrawer";

const NAV_ITEMS = [
  { label: "Home", href: "/dashboard", icon: "⌂" },
  { label: "Funds", href: "/funds", icon: "₹" },
  { label: "Goals", href: "/goals", icon: "◎" },
  { label: "Advisor", href: "/advisor-calls", icon: "☎" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const summary = useWeeklySummary();

  return (
    <ThemeProvider>
      <SummaryContext.Provider value={{ openDescriptor: summary.openDescriptor, openToday: summary.openToday }}>
        <div className="fi-app-shell mx-auto flex min-h-full w-full max-w-md flex-col bg-[#f4f8fb] shadow-sm">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200/70 bg-white/95 px-4 py-3 backdrop-blur">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="fi-pressable relative flex h-11 w-11 items-center justify-center rounded-full border border-emerald-100 bg-[#ecfbf4] text-sm font-bold text-[#00a76f]"
            >
              RB
              <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white bg-[#006bff]" />
            </button>
            <div className="flex flex-col items-center">
              <Image
                src="/fundsindia-logo.png"
                alt="FundsIndia"
                width={146}
                height={76}
                priority
                className="h-9 w-auto object-contain mix-blend-multiply"
              />
              <p className="-mt-1 text-[10px] font-semibold text-slate-500">Guided mutual fund investing</p>
            </div>
            <button
              type="button"
              aria-label="Notifications"
              className="fi-pressable relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-bold text-slate-600 shadow-sm"
            >
              N
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#00c781]" />
            </button>
          </header>

          <main key={pathname} className="fi-route flex-1">
            {children}
          </main>

          <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto grid max-w-md grid-cols-4 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur">
            {NAV_ITEMS.map((item) => {
              const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`fi-pressable flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold ${
                    active ? "bg-[#eaf8ff] text-[#006bff]" : "text-slate-500"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full border text-[12px] ${
                      active ? "border-[#00a76f] bg-white text-[#00a76f]" : "border-current"
                    }`}
                  >
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
    </ThemeProvider>
  );
}
