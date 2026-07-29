"use client";

import Image from "next/image";
import Link from "next/link";
import { getUser } from "@/lib/data/repository";

const WIRED = [
  { label: "Dashboard", href: "/dashboard", icon: "▦" },
  { label: "Mutual Funds", href: "/funds", icon: "MF" },
  { label: "Goals", href: "/goals", icon: "◎" },
  { label: "Advisor Calls", href: "/advisor-calls", icon: "A" },
  { label: "Summary", href: "/summary", icon: "S" },
  { label: "Settings", href: "/settings", icon: "⚙" },
];
const PLACEHOLDERS = [
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
        <div className="mb-6 rounded-3xl bg-[linear-gradient(135deg,#f0fff8_0%,#eef7ff_58%,#ffffff_100%)] p-4">
          <Image
            src="/fundsindia-logo.png"
            alt="FundsIndia"
            width={160}
            height={84}
            className="h-10 w-auto object-contain mix-blend-multiply"
          />
          <h2 className="mt-4 text-2xl font-bold text-slate-900">{user.name}</h2>
          {/* Demo stub: the seed User type has no email field, so this is a fixed display value, not a data-layer gap. */}
          <p className="text-sm text-slate-500">ritikbansal27.rb@gmail.com</p>
          <div className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-[#0071f2]">
            Advisory access enabled
          </div>
        </div>

        <nav className="space-y-1">
          {WIRED.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold text-slate-800 hover:bg-[#f3faf7]"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eef8ff] text-xs font-bold text-[#006bff]">
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-4 border-t border-slate-100 pt-4">
          {PLACEHOLDERS.map((item) => (
            <div key={item.label} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-400">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 text-[10px] font-bold">
                {item.icon}
              </span>
              {item.label}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
