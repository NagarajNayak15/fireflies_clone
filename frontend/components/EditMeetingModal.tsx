"use client";

import { useState } from "react";
import Modal from "./Modal";
import { updateParticipants } from "@/lib/api";
import { MeetingDetail } from "@/lib/types";
import { formatDate } from "@/lib/format";
import toast from "react-hot-toast";

// Edit meeting metadata. IMPORTANT GAP: the backend only exposes
// `PUT /meetings/{id}/participants`. There is NO endpoint to change the title
// or meeting date, so those fields are shown read-only here. Only the
// participant list is actually sent to the backend.
export default function EditMeetingModal({
  meeting,
  onClose,
  onUpdated,
}: {
  meeting: MeetingDetail;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [participantsText, setParticipantsText] = useState(
    meeting.participants.map((p) => p.name).join("\n")
  );
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const names = participantsText
      .split("\n")
      .map((n) => n.trim())
      .filter(Boolean);

    setSubmitting(true);
    try {
      await updateParticipants(meeting.id, names);
      toast.success("Participants updated!");
      onUpdated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Edit Meeting" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Title is read-only: backend has no edit-title endpoint (gap). */}
        <label className="text-sm font-medium text-slate-700">
          Title
          <input
            type="text"
            value={meeting.title}
            disabled
            className="mt-1 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
          />
        </label>

        {/* Date is read-only: backend has no edit-date endpoint (gap). */}
        <label className="text-sm font-medium text-slate-700">
          Meeting date
          <input
            type="text"
            value={formatDate(meeting.meeting_date)}
            disabled
            className="mt-1 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
          />
        </label>

        <p className="text-xs text-amber-600">
          Note: editing the title or date is not supported by the current
          backend (no API endpoint). Only participants can be updated.
        </p>

        <label className="text-sm font-medium text-slate-700">
          Participants (one per line)
          <textarea
            value={participantsText}
            onChange={(e) => setParticipantsText(e.target.value)}
            rows={5}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
          />
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
