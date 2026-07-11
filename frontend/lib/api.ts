import {
  ActionItem,
  DashboardStats,
  MeetingDetail,
  MeetingList,
  Participant,
  TranscriptLine,
} from "./types";

// Base URL comes from an environment variable so it can be swapped per deploy.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

// A small helper that throws a readable error when the backend returns a
// non-2xx response (or when the request itself fails, e.g. cold start timeout).
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    // Try to read a JSON error detail from FastAPI, fall back to status text.
    let message = res.statusText;
    try {
      const body = await res.json();
      if (body && body.detail) message = body.detail;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

// GET /meetings -> array of lightweight meeting rows for the dashboard.
export async function getMeetings(): Promise<MeetingList[]> {
  const res = await fetch(`${API_URL}/meetings`, { cache: "no-store" });
  return handleResponse<MeetingList[]>(res);
}

// GET /meetings/{id} -> full meeting detail with transcript, summary, etc.
export async function getMeeting(id: number): Promise<MeetingDetail> {
  const res = await fetch(`${API_URL}/meetings/${id}`, { cache: "no-store" });
  return handleResponse<MeetingDetail>(res);
}

// GET /meetings/{id}/search?q= -> transcript lines that contain the query.
export async function searchTranscript(
  meetingId: number,
  q: string
): Promise<TranscriptLine[]> {
  const res = await fetch(
    `${API_URL}/meetings/${meetingId}/search?q=${encodeURIComponent(q)}`,
    { cache: "no-store" }
  );
  return handleResponse<TranscriptLine[]>(res);
}

// POST /meetings -> create a meeting. The backend expects multipart form data:
// a `title` text field and a `transcript` .txt file.
export async function createMeeting(
  title: string,
  transcriptFile: File
): Promise<{ id: number; title: string }> {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("transcript", transcriptFile);
  const res = await fetch(`${API_URL}/meetings`, {
    method: "POST",
    body: formData,
  });
  return handleResponse<{ id: number; title: string }>(res);
}

// DELETE /meetings/{id} -> 204 No Content, so there is no JSON body.
export async function deleteMeeting(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/meetings/${id}`, { method: "DELETE" });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      if (body && body.detail) message = body.detail;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
}

// PUT /meetings/{id}/participants -> replace the participant list.
export async function updateParticipants(
  meetingId: number,
  participants: string[]
): Promise<Participant[]> {
  const res = await fetch(`${API_URL}/meetings/${meetingId}/participants`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ participants }),
  });
  return handleResponse<Participant[]>(res);
}

// PATCH /action-items/{id} -> toggle the completed flag.
export async function toggleActionItem(
  actionItemId: number,
  completed: boolean
): Promise<ActionItem> {
  const res = await fetch(`${API_URL}/action-items/${actionItemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  });
  return handleResponse<ActionItem>(res);
}

// GET /dashboard/stats -> totals shown in the sidebar / dashboard header.
export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_URL}/dashboard/stats`, { cache: "no-store" });
  return handleResponse<DashboardStats>(res);
}


