"use client";

import Link from "next/link";

// Simple "Coming Soon" placeholder. Analytics is not implemented in the backend.
export default function AnalyticsPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <h1 className="text-2xl font-semibold text-slate-800">Analytics</h1>
      <p className="text-slate-500">Coming soon.</p>
      <Link href="/meetings" className="text-sm font-medium text-brand-600 hover:underline">
        ← Back to meetings
      </Link>
    </div>
  );
}
