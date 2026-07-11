"use client";

import { useState } from "react";
import Modal from "./Modal";
import { deleteMeeting } from "@/lib/api";
import toast from "react-hot-toast";

// Simple confirmation dialog before deleting a meeting.
export default function DeleteModal({
  meetingId,
  meetingTitle,
  onClose,
  onDeleted,
}: {
  meetingId: number;
  meetingTitle: string;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);

  async function handleDelete() {
    setSubmitting(true);
    try {
      await deleteMeeting(meetingId);
      toast.success("Meeting deleted.");
      onDeleted();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete.");
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Delete Meeting" onClose={onClose}>
      <p className="text-sm text-slate-600">
        Are you sure you want to delete{" "}
        <span className="font-semibold">{meetingTitle}</span>? This cannot be
        undone.
      </p>
      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={submitting}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {submitting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </Modal>
  );
}
