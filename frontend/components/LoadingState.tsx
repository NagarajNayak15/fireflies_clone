"use client";

// Shown while the app waits on the backend. Because the deployed backend runs on
// Render's free tier it "spins down" when idle, so the first request after a
// pause can take 20-50 seconds. We show a friendly message instead of an error.
export default function LoadingState({
  label = "Waking up the server, this may take up to a minute...",
}: {
  label?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
