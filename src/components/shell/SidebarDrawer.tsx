"use client";

import Link from "next/link";
import { getUser } from "@/lib/data/repository";

const WIRED = [
  { label: "Dashboard", href: "/dashboard", icon: "▦" },
  { label: "Advisor Calls", href: "/advisor-calls", icon: "A" },
  { label: "Summary", href: "/summary", icon: "S" },
  { label: "Settings", href: "/settings", icon: "⚙" },
];
const PLACEHOLDERS = [
  { label: "Mutual Funds", icon: "MF" },
  { label: "My Systematic Plans", icon: "SP" },
  { label: "Nominees", icon: "NM" },
  { label: "Bank Details", icon: "BD" },
  { label: "Stocks", icon: "ST" },
  { label: "SIF", icon: "SI" },
  { label: "Insights", icon: "IN" },
];

export function SidebarDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const user = getUser();
  return (
    <div className={`fixed inset-0 z-40 ${open ? "" : "pointer-events-none"}`}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        className={`absolute left-0 top-0 h-full w-4/5 max-w-xs overflow-y-auto bg-white p-5 shadow-xl transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
        {/* Demo stub: the seed User type has no email field, so this is a fixed display value, not a data-layer gap. */}
        <p className="text-sm text-slate-500">ritikbansal27.rb@gmail.com</p>

        <nav className="mt-6 space-y-1">
          {WIRED.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-800 hover:bg-slate-50"
            >
              <span className="flex w-5 shrink-0 items-center justify-center text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-4 border-t border-slate-100 pt-4">
          {PLACEHOLDERS.map((item) => (
            <div key={item.label} className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-400">
              <span className="flex w-5 shrink-0 items-center justify-center text-base">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
