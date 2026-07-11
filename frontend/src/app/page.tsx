'use client';
import { useEffect, useState } from 'react';
import { Plus, Search, Calendar, Clock, Users, ChevronRight, Video, ListTodo, MoreVertical, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import { api } from '@/lib/api';
import CreateMeetingModal from '@/components/CreateMeetingModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [deleteMeetingId, setDeleteMeetingId] = useState<number | null>(null);
  const [deleteMeetingTitle, setDeleteMeetingTitle] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, meetingsData] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getMeetings().catch(() => [])
      ]);
      if (statsData) setStats(statsData);
      if (meetingsData) setMeetings(meetingsData);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredMeetings = meetings.filter(m => m.title.toLowerCase().includes(search.toLowerCase()));

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0m';
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  };

  const statCards = [
    { label: 'Total Meetings', value: stats?.total_meetings || 0, icon: Video, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-500/20' },
    { label: 'Participants', value: stats?.total_participants || 0, icon: Users, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-500/20' },
    { label: 'Action Items', value: stats?.total_action_items || 0, icon: ListTodo, color: 'text-brand-500', bg: 'bg-brand-100 dark:bg-brand-500/20' },
    { label: 'Completed Tasks', value: stats?.completed_action_items || 0, icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-500/20' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Here's what's happening in your meetings.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-sm shadow-brand-500/20"
        >
          <Plus className="w-5 h-5" />
          Upload Meeting
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card p-6 flex flex-col items-start gap-4 hover:border-brand-200 dark:hover:border-brand-800 transition-colors">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {loading ? '...' : stat.value}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Meetings List */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Recent Meetings</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search meetings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 bg-slate-100 dark:bg-slate-800/50 border-none rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-slate-900 dark:text-white placeholder:text-slate-500 transition-all"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {loading ? (
            <div className="p-8 text-center text-slate-500 flex flex-col items-center">
              <Clock className="w-8 h-8 mb-3 animate-spin text-brand-500" />
              <p>Loading your meetings... this might take a moment if the server is waking up.</p>
            </div>
          ) : filteredMeetings.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Video className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No meetings found</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mb-6">Upload a transcript to get started with AI summaries and action items.</p>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="text-brand-600 dark:text-brand-400 font-medium text-sm hover:underline"
              >
                Upload your first meeting &rarr;
              </button>
            </div>
          ) : (
            filteredMeetings.map((meeting) => (
              <div key={meeting.id} className="group p-4 sm:p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-500/20 flex flex-shrink-0 items-center justify-center text-brand-600 dark:text-brand-400 font-medium">
                    {meeting.title.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <Link href={`/meetings/${meeting.id}`} className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {meeting.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {meeting.meeting_date ? formatDistanceToNow(new Date(meeting.meeting_date), { addSuffix: true }) : 'Unknown date'}
                      </div>
                      <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDuration(meeting.duration_seconds)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <button 
                    onClick={() => {
                      setDeleteMeetingId(meeting.id);
                      setDeleteMeetingTitle(meeting.title);
                    }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Link 
                    href={`/meetings/${meeting.id}`}
                    className="p-2 text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 group-hover:bg-brand-50 dark:group-hover:bg-brand-500/10 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                  >
                    View <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <CreateMeetingModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={fetchData} 
      />

      <DeleteConfirmModal
        isOpen={deleteMeetingId !== null}
        onClose={() => {
          setDeleteMeetingId(null);
          setDeleteMeetingTitle('');
        }}
        onSuccess={fetchData}
        meetingId={deleteMeetingId!}
        meetingTitle={deleteMeetingTitle}
      />
    </div>
  );
}
