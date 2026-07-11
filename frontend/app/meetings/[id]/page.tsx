"use client";

import { MeetingDetailView } from "@/components/MeetingDetail";

// Route: /meetings/[id]. `params.id` comes from the URL segment.
export default function Page({ params }: { params: { id: string } }) {
  return <MeetingDetailView id={Number(params.id)} />;
}
