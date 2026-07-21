"use client";

import { useId, useState, type ReactNode } from "react";

export function SummarySection({
  title,
  hook,
  defaultOpen = false,
  children,
}: {
  title: string;
  hook?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();
  return (
    <section className="rounded-2xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={bodyId}
        className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
      >
        <span>
          <span className="block text-sm font-semibold text-slate-900">{title}</span>
          {hook && <span className="mt-0.5 block text-sm text-slate-500">{hook}</span>}
        </span>
        <span className={`mt-1 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}>
          ⌄
        </span>
      </button>
      {open && (
        <div id={bodyId} className="border-t border-slate-100 px-4 py-3 text-sm text-slate-600">
          {children}
        </div>
      )}
    </section>
  );
}
