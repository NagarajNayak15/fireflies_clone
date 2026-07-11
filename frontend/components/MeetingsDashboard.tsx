"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getMeetings, getDashboardStats } from "@/lib/api";
import { MeetingList, DashboardStats } from "@/lib/types";
import { formatDate, formatDuration } from "@/lib/format";
import CreateMeetingModal from "@/components/CreateMeetingModal";
import DeleteModal from "@/components/DeleteModal";
import LoadingState from "@/components/LoadingState";
import toast from "react-hot-toast";

type SortKey = "newest" | "oldest" | "title" | "duration";
type FilterKey = "all" | "short" | "long";

export default function MeetingsDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") || "";

  const [meetings, setMeetings] = useState<MeetingList[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(urlQuery);
  const [sort, setSort] = useState<SortKey>("newest");
  const [filter, setFilter] = useState<FilterKey>("all");

  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MeetingList | null>(null);

  // Load the meeting list (and dashboard stats) from the backend.
  async function load() {
    setLoading(true);
    try {
      const [list, dashboard] = await Promise.all([
        getMeetings(),
        getDashboardStats().catch(() => null),
      ]);
      setMeetings(list);
      setStats(dashboard);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load meetings."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the local search box in sync when the URL query changes (navbar search).
  useEffect(() => {
    setSearch(urlQuery);
  }, [urlQuery]);

  // Apply search (by title) + filter (by duration) + sort, all client-side.
  const visible = useMemo(() => {
    let rows = meetings;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((m) => m.title.toLowerCase().includes(q));
    }

    if (filter === "short") {
      rows = rows.filter(
        (m) => m.duration_seconds != null && m.duration_seconds <= 600
      );
    } else if (filter === "long") {
      rows = rows.filter(
        (m) => m.duration_seconds != null && m.duration_seconds > 600
      );
    }

    const sorted = [...rows];
    sorted.sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "duration")
        return (b.duration_seconds ?? 0) - (a.duration_seconds ?? 0);
      // dates can be null; treat null as oldest
      const ad = a.meeting_date ? new Date(a.meeting_date).getTime() : 0;
      const bd = b.meeting_date ? new Date(b.meeting_date).getTime() : 0;
      return sort === "newest" ? bd - ad : ad - bd;
    });
    return sorted;
  }, [meetings, search, sort, filter]);

  return (
    <div className="flex flex-col gap-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Meetings" value={stats?.total_meetings ?? meetings.length} />
        <StatCard label="Participants" value={stats?.total_participants ?? "—"} />
        <StatCard label="Action Items" value={stats?.total_action_items ?? "—"} />
        <StatCard
          label="Completed"
          value={
            stats
              ? `${stats.completed_action_items}/${stats.total_action_items || 0}`
              : "—"
          }
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Meetings</h1>
          <p className="text-sm text-slate-500">
            {visible.length} meeting{visible.length === 1 ? "" : "s"}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + New Meeting
        </button>
      </div>

      {/* Search + sort + filter controls */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title..."
          className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-brand-400"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400"
        >
          <option value="newest">Sort: Newest</option>
          <option value="oldest">Sort: Oldest</option>
          <option value="title">Sort: Title A–Z</option>
          <option value="duration">Sort: Duration</option>
        </select>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterKey)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400"
        >
          <option value="all">Filter: All</option>
          <option value="short">Filter: ≤ 10 min</option>
          <option value="long">Filter: &gt; 10 min</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <LoadingState />
      ) : visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center text-slate-500">
          No meetings found. Create one to get started.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Duration</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((m) => (
                <tr
                  key={m.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => router.push(`/meetings/${m.id}`)}
                >
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {m.title}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatDate(m.meeting_date)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatDuration(m.duration_seconds)}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => router.push(`/meetings/${m.id}`)}
                      className="mr-2 rounded-md px-2 py-1 text-brand-600 hover:bg-brand-50"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => setDeleteTarget(m)}
                      className="rounded-md px-2 py-1 text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <CreateMeetingModal
          onClose={() => setShowCreate(false)}
          onCreated={(id) => {
            setShowCreate(false);
            router.push(`/meetings/${id}`);
          }}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          meetingId={deleteTarget.id}
          meetingTitle={deleteTarget.title}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => {
            setDeleteTarget(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-800">{value}</p>
    </div>
  );
}
