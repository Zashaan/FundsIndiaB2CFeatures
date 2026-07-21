"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CURSOR_STORAGE_KEY, DEFAULT_CURSOR_INDEX } from "@/lib/session/cursor";

export function CursorControls({ cursorIndex, snapshotCount }: { cursorIndex: number; snapshotCount: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isManualOverride = searchParams.has("from") && searchParams.has("to");

  useEffect(() => {
    if (isManualOverride) return;
    const hasCursorParam = searchParams.has("cursor");
    const stored = window.localStorage.getItem(CURSOR_STORAGE_KEY);
    if (!hasCursorParam && stored && parseInt(stored, 10) !== cursorIndex) {
      router.replace(`/dashboard?cursor=${stored}`);
      return;
    }
    window.localStorage.setItem(CURSOR_STORAGE_KEY, String(cursorIndex));
    // Only run this sync when the resolved cursor actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursorIndex]);

  function simulateNextLogin() {
    const next = Math.min(cursorIndex + 1, snapshotCount - 1);
    window.localStorage.setItem(CURSOR_STORAGE_KEY, String(next));
    router.push(`/dashboard?cursor=${next}`);
  }

  function resetToFirstVisit() {
    window.localStorage.setItem(CURSOR_STORAGE_KEY, String(DEFAULT_CURSOR_INDEX));
    router.push(`/dashboard?cursor=${DEFAULT_CURSOR_INDEX}`);
  }

  const atLatest = cursorIndex >= snapshotCount - 1;

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-2.5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
      <span>
        Demo session {cursorIndex + 1} of {snapshotCount}
        {isManualOverride && " · manual override"}
      </span>
      <div className="flex gap-2">
        <button onClick={resetToFirstVisit} className="rounded-full border border-slate-300 px-3 py-1 font-medium text-slate-600 hover:bg-white">
          Reset
        </button>
        <button
          onClick={simulateNextLogin}
          disabled={atLatest}
          className="rounded-full bg-slate-900 px-3 py-1 font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Simulate next login →
        </button>
      </div>
    </div>
  );
}
