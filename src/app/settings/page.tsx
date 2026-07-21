import Link from "next/link";
import { SettingsControls } from "@/components/settings/SettingsControls";

export default function SettingsPage() {
  return (
    <div>
      <div className="flex items-center gap-3 px-4 py-2">
        <Link href="/dashboard" aria-label="Back" className="text-slate-500">
          ←
        </Link>
        <h1 className="text-lg font-semibold text-slate-900">Settings</h1>
      </div>
      <SettingsControls />
    </div>
  );
}
