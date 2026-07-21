"use client";

import { useEffect, useState } from "react";
import { clearSeen, isEnabled, setEnabled } from "@/lib/summary/weeklyGate";

export function SettingsControls() {
  const [enabled, setEnabledState] = useState(true);
  const [resetMsg, setResetMsg] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabledState(isEnabled(window.localStorage));
  }, []);

  function toggle() {
    const next = !enabled;
    setEnabled(window.localStorage, next);
    setEnabledState(next);
  }

  function reset() {
    clearSeen(window.localStorage);
    setResetMsg("Cleared — reopen the app (or go to Dashboard) to see this week's summary again.");
  }

  return (
    <div className="space-y-3 px-4 py-4">
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <span className="text-sm font-medium text-slate-800">Weekly Summary</span>
        <button
          onClick={toggle}
          role="switch"
          aria-checked={enabled}
          className={`h-6 w-11 rounded-full p-0.5 transition-colors ${enabled ? "bg-emerald-600" : "bg-slate-300"}`}
        >
          <span
            className={`block h-5 w-5 rounded-full bg-white transition-transform ${enabled ? "translate-x-5" : ""}`}
          />
        </button>
      </div>

      <button
        onClick={reset}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-emerald-700"
      >
        Show this week&apos;s summary again
      </button>
      {resetMsg && <p className="px-1 text-xs text-slate-500">{resetMsg}</p>}
    </div>
  );
}
