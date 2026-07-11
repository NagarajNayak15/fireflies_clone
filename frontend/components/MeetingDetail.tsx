"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getMeeting, toggleActionItem } from "@/lib/api";
import { MeetingDetail as MeetingDetailType, TranscriptLine } from "@/lib/types";
import { formatDate, formatDuration, formatTimestamp } from "@/lib/format";
import { createSilentAudioUrl } from "@/lib/audio";
import { useDebounce } from "@/lib/useDebounce";
import LoadingState from "@/components/LoadingState";
import EditMeetingModal from "@/components/EditMeetingModal";
import DeleteModal from "@/components/DeleteModal";
import toast from "react-hot-toast";

export function MeetingDetailView({ id }: { id: number }) {
  const router = useRouter();
  const [meeting, setMeeting] = useState<MeetingDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(-1);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");

  // Transcript in-page search
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 250);
  const [matchIndex, setMatchIndex] = useState(0);

  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await getMeeting(id);
      setMeeting(data);
      // Build a silent placeholder audio track long enough for the transcript.
      const lastTs = data.transcripts.reduce(
        (max, t) => Math.max(max, t.timestamp_seconds),
        0
      );
      setAudioUrl(createSilentAudioUrl(lastTs));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load meeting.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Transcripts are kept sorted by time so index math is predictable.
  const transcripts = useMemo(() => {
    if (!meeting) return [];
    return [...meeting.transcripts].sort(
      (a, b) => a.timestamp_seconds - b.timestamp_seconds
    );
  }, [meeting]);

  // Find which transcript lines match the in-page search query.
  const matchLines = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return [] as number[];
    return transcripts
      .map((t, i) => (t.transcript_text.toLowerCase().includes(q) ? i : -1))
      .filter((i) => i !== -1);
  }, [debouncedSearch, transcripts]);

  // Whenever the search query changes, reset to the first match.
  useEffect(() => {
    setMatchIndex(0);
  }, [debouncedSearch]);

  // Called many times per second while the audio plays.
  // Plain-English logic:
  //   1. Read the player's current playback position in seconds.
  //   2. Walk through the (time-sorted) transcript lines.
  //   3. The "active" line is the LAST one whose timestamp is <= currentTime,
  //      i.e. the most recent thing said up to this moment.
  //   4. Save that index in state so the UI can highlight it.
  function handleTimeUpdate() {
    const audio = audioRef.current;
    if (!audio) return;
    const currentTime = audio.currentTime;
    let idx = -1;
    for (let i = 0; i < transcripts.length; i++) {
      if (transcripts[i].timestamp_seconds <= currentTime) {
        idx = i;
      } else {
        break;
      }
    }
    setActiveIndex(idx);
  }

  // Clicking a transcript line jumps the player to that line's timestamp.
  function seekTo(line: TranscriptLine) {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = line.timestamp_seconds;
      audio.play().catch(() => {});
    }
  }

  // Jump to the previous / next search match and seek the player to it.
  function gotoMatch(direction: 1 | -1) {
    if (matchLines.length === 0) return;
    const next =
      (matchIndex + direction + matchLines.length) % matchLines.length;
    setMatchIndex(next);
    const lineIndex = matchLines[next];
    seekTo(transcripts[lineIndex]);
    document
      .getElementById(`transcript-line-${lineIndex}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function onToggleActionItem(itemId: number, completed: boolean) {
    try {
      const updated = await toggleActionItem(itemId, completed);
      setMeeting((prev) =>
        prev
          ? {
              ...prev,
              action_items: prev.action_items.map((a) =>
                a.id === itemId ? updated : a
              ),
            }
          : prev
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update.");
    }
  }

  if (loading) return <LoadingState />;
  if (!meeting) return <p className="text-slate-500">Meeting not found.</p>;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => router.push("/meetings")}
            className="mb-1 text-sm text-brand-600 hover:underline"
          >
            ← All meetings
          </button>
          <h1 className="text-2xl font-semibold text-slate-800">
            {meeting.title}
          </h1>
          <p className="text-sm text-slate-500">
            {formatDate(meeting.meeting_date)} ·{" "}
            {formatDuration(meeting.duration_seconds)}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowEdit(true)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Edit
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Main column: player + transcript */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            {/* HTML5 audio player with its built-in seek bar. */}
            <audio
              ref={audioRef}
              src={audioUrl}
              controls
              className="w-full"
              onTimeUpdate={handleTimeUpdate}
            />
            <p className="mt-2 text-xs text-slate-400">
              Placeholder audio track (the backend stores no media). Playback
              still drives transcript highlighting.
            </p>
          </div>

          {/* In-transcript search */}
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search in transcript..."
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
            />
            <span className="text-xs text-slate-400">
              {matchLines.length === 0
                ? "0 matches"
                : `${matchIndex + 1}/${matchLines.length}`}
            </span>
            <button
              onClick={() => gotoMatch(-1)}
              disabled={matchLines.length === 0}
              className="rounded-md px-2 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            >
              ↑
            </button>
            <button
              onClick={() => gotoMatch(1)}
              disabled={matchLines.length === 0}
              className="rounded-md px-2 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            >
              ↓
            </button>
          </div>

          {/* Transcript lines */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white">
            {transcripts.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">No transcript lines.</p>
            ) : (
              transcripts.map((line, i) => {
                const isActive = i === activeIndex;
                const isMatch =
                  debouncedSearch.trim() !== "" && matchLines.includes(i);
                return (
                  <button
                    key={line.id}
                    id={`transcript-line-${i}`}
                    onClick={() => seekTo(line)}
                    className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition ${
                      isActive ? "bg-brand-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <span className="w-12 shrink-0 font-mono text-xs text-brand-600">
                      {formatTimestamp(line.timestamp_seconds)}
                    </span>
                    <span className="w-24 shrink-0 text-sm font-semibold text-slate-700">
                      {line.speaker}
                    </span>
                    <span className="flex-1 text-sm text-slate-700">
                      {highlight(line.transcript_text, debouncedSearch, isMatch)}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right column: summary, action items, topics */}
        <div className="flex flex-col gap-5">
          {/* AI Summary */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="mb-2 font-semibold text-slate-800">AI Summary</h2>
            {meeting.summary ? (
              <p className="whitespace-pre-line text-sm text-slate-600">
                {meeting.summary.content}
              </p>
            ) : (
              <p className="text-sm text-slate-400">No summary available.</p>
            )}
          </div>

          {/* Action Items */}
          <ActionItems
            items={meeting.action_items}
            onToggle={onToggleActionItem}
          />

          {/* Topics / Chapters */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="mb-2 font-semibold text-slate-800">
              Topics / Chapters
            </h2>
            {meeting.topics.length === 0 ? (
              <p className="text-sm text-slate-400">No topics.</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {meeting.topics.map((t) => (
                  <li key={t.id}>
                    <button
                      onClick={() =>
                        t.timestamp_seconds != null &&
                        seekTo({
                          id: t.id,
                          speaker: "",
                          timestamp_seconds: t.timestamp_seconds,
                          transcript_text: "",
                        })
                      }
                      className="flex w-full items-center justify-between rounded-md px-2 py-1 text-left text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <span>{t.title}</span>
                      {t.timestamp_seconds != null && (
                        <span className="font-mono text-xs text-brand-600">
                          {formatTimestamp(t.timestamp_seconds)}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {showEdit && (
        <EditMeetingModal
          meeting={meeting}
          onClose={() => setShowEdit(false)}
          onUpdated={() => {
            setShowEdit(false);
            load();
          }}
        />
      )}

      {showDelete && (
        <DeleteModal
          meetingId={meeting.id}
          meetingTitle={meeting.title}
          onClose={() => setShowDelete(false)}
          onDeleted={() => router.push("/meetings")}
        />
      )}
    </div>
  );
}

// Render transcript text with the search query wrapped in <mark> so matches
// stand out. Falls back to the plain text when there is no query.
function highlight(text: string, query: string, isMatch?: boolean) {
  const q = query.trim();
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className={isMatch ? "bg-brand-200" : "bg-yellow-200"}>
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
}

// Action items list with toggleable checkboxes. Editing/adding/deleting is NOT
// supported by the backend (only toggle), so this is read + toggle only.
function ActionItems({
  items,
  onToggle,
}: {
  items: MeetingDetailType["action_items"];
  onToggle: (id: number, completed: boolean) => void;
}) {
  const done = items.filter((i) => i.completed).length;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">Action Items</h2>
        <span className="text-xs text-slate-400">
          {done}/{items.length} done
        </span>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-slate-400">No action items.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={(e) => onToggle(item.id, e.target.checked)}
                className="mt-1 h-4 w-4 accent-brand-600"
              />
              <div className="text-sm">
                <p
                  className={
                    item.completed
                      ? "text-slate-400 line-through"
                      : "text-slate-700"
                  }
                >
                  {item.task}
                </p>
                {(item.owner || item.deadline) && (
                  <p className="text-xs text-slate-400">
                    {item.owner ? `Owner: ${item.owner}` : ""}
                    {item.owner && item.deadline ? " · " : ""}
                    {item.deadline ? `Due: ${item.deadline}` : ""}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
