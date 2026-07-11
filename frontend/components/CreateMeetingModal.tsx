"use client";

import { useState } from "react";
import Modal from "./Modal";
import { createMeeting } from "@/lib/api";
import toast from "react-hot-toast";

// Modal for creating a new meeting. The backend requires:
//   - `title` (text)
//   - `transcript` (a .txt file uploaded as multipart form data)
// The user can either upload a .txt file OR paste transcript text. Pasted text
// is wrapped into a File object so it works with the same upload endpoint.
export default function CreateMeetingModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (id: number) => void;
}) {
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState<"upload" | "paste">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [pasted, setPasted] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a meeting title.");
      return;
    }

    // Build the transcript file depending on the chosen mode.
    let transcriptFile: File;
    if (mode === "upload") {
      if (!file) {
        toast.error("Please choose a .txt transcript file.");
        return;
      }
      transcriptFile = file;
    } else {
      if (!pasted.trim()) {
        toast.error("Please paste some transcript text.");
        return;
      }
      // Wrap pasted text into a .txt File so the backend accepts it.
      transcriptFile = new File([pasted], "transcript.txt", {
        type: "text/plain",
      });
    }

    setSubmitting(true);
    try {
      const created = await createMeeting(title.trim(), transcriptFile);
      toast.success("Meeting created!");
      onCreated(created.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create meeting.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="New Meeting" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="text-sm font-medium text-slate-700">
          Meeting title
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Sprint Planning"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
          />
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
              mode === "upload"
                ? "bg-brand-600 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            Upload .txt
          </button>
          <button
            type="button"
            onClick={() => setMode("paste")}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
              mode === "paste"
                ? "bg-brand-600 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            Paste text
          </button>
        </div>

        {mode === "upload" ? (
          <input
            type="file"
            accept=".txt"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm text-slate-600"
          />
        ) : (
          <textarea
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            rows={8}
            placeholder={"00:00 John: Hello everyone.\n00:10 Sarah: Sprint planning starts."}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
          />
        )}

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
            {submitting ? "Creating..." : "Create meeting"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
