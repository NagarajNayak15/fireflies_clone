"use client";

import { Suspense } from "react";
import MeetingsDashboard from "@/components/MeetingsDashboard";
import LoadingState from "@/components/LoadingState";

// The dashboard reads a search query from the URL (?q=), so the component that
// uses useSearchParams must be wrapped in a Suspense boundary (Next.js rule).
export default function MeetingsPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading..." />}>
      <MeetingsDashboard />
    </Suspense>
  );
}
