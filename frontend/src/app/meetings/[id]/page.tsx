'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Play, Pause, Search, CheckCircle2, Circle, Clock, Users, Edit3, X, FileText, LayoutList, ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function MeetingDetail() {
  const { id } = useParams();
  const router = useRouter();
  
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'summary' | 'action_items' | 'topics'>('summary');
  
  // Audio Player State
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Transcript Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchIndex, setSearchIndex] = useState(0);
  
  // Edit Participants State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editParticipantsText, setEditParticipantsText] = useState('');
  const [savingParticipants, setSavingParticipants] = useState(false);

  useEffect(() => {
    fetchMeeting();
  }, [id]);

  const fetchMeeting = async () => {
    try {
      const data = await api.getMeeting(Number(id));
      setMeeting(data);
    } catch (error) {
      toast.error('Failed to load meeting details');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Audio Sync Logic
  // -------------------------
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const seekTo = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
      if (!isPlaying) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleSeekbarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    seekTo(time);
  };

  // Determine if a transcript line is currently active
  // A line is active if the audio currentTime is between this line's timestamp 
  // and the next line's timestamp.
  const isLineActive = (index: number, currentSeconds: number) => {
    if (!meeting?.transcripts) return false;
    const lineTime = meeting.transcripts[index].timestamp_seconds;
    const nextLineTime = index < meeting.transcripts.length - 1 
      ? meeting.transcripts[index + 1].timestamp_seconds 
      : duration || 999999;
    
    return currentSeconds >= lineTime && currentSeconds < nextLineTime;
  };

  // -------------------------
  // Search Logic
  // -------------------------
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await api.searchTranscript(Number(id), searchQuery);
      setSearchResults(results);
      setSearchIndex(0);
      if (results.length > 0) {
        // Jump to first result
        seekTo(results[0].timestamp_seconds);
      } else {
        toast('No matches found', { icon: '🔍' });
      }
    } catch (error) {
      toast.error('Search failed');
    }
  };

  const nextSearchResult = () => {
    if (searchResults.length > 0) {
      const nextIndex = (searchIndex + 1) % searchResults.length;
      setSearchIndex(nextIndex);
      seekTo(searchResults[nextIndex].timestamp_seconds);
    }
  };

  const prevSearchResult = () => {
    if (searchResults.length > 0) {
      const prevIndex = (searchIndex - 1 + searchResults.length) % searchResults.length;
      setSearchIndex(prevIndex);
      seekTo(searchResults[prevIndex].timestamp_seconds);
    }
  };

  // -------------------------
  // Actions
  // -------------------------
  const toggleActionItem = async (itemId: number, completed: boolean) => {
    try {
      await api.updateActionItem(itemId, !completed);
      // Optimistic update
      setMeeting((prev: any) => ({
        ...prev,
        action_items: prev.action_items.map((item: any) => 
          item.id === itemId ? { ...item, completed: !completed } : item
        )
      }));
    } catch (error) {
      toast.error('Failed to update action item');
    }
  };

  const handleUpdateParticipants = async () => {
    setSavingParticipants(true);
    const names = editParticipantsText.split(',').map(n => n.trim()).filter(Boolean);
    try {
      const updated = await api.updateParticipants(Number(id), names);
      setMeeting((prev: any) => ({ ...prev, participants: updated }));
      toast.success('Participants updated');
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error('Failed to update participants');
    } finally {
      setSavingParticipants(false);
    }
  };

  const openEditModal = () => {
    setEditParticipantsText(meeting?.participants?.map((p: any) => p.name).join(', ') || '');
    setIsEditModalOpen(true);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p>Loading meeting...</p>
        </div>
      </div>
    );
  }

  if (!meeting) return null;

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{meeting.title}</h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {formatTime(meeting.duration_seconds)}</span>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {meeting.participants?.map((p: any) => p.name).join(', ') || 'No participants'}
                <button onClick={openEditModal} className="ml-1 text-brand-600 hover:underline">Edit</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Left Area: Player & Transcript */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          
          {/* Audio Player (Placeholder) */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 shrink-0">
            {/* We use a public domain / generic placeholder audio file */}
            <audio 
              ref={audioRef} 
              src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
            />
            
            <div className="flex items-center gap-4">
              <button 
                onClick={togglePlay}
                className="w-12 h-12 bg-brand-600 hover:bg-brand-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors shrink-0"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
              </button>
              
              <div className="flex-1 flex flex-col gap-2">
                <input 
                  type="range" 
                  min="0" 
                  max={duration || 100} 
                  value={currentTime} 
                  onChange={handleSeekbarChange}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
                <div className="flex justify-between text-xs font-medium text-slate-500">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Transcript Search */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search transcript..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800/50 border-none rounded-lg text-sm focus:ring-2 focus:ring-brand-500/50"
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 text-sm font-medium rounded-lg hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors">
                Search
              </button>
              {searchResults.length > 0 && (
                <div className="flex items-center gap-2 ml-2 text-sm text-slate-500">
                  <span>{searchIndex + 1} of {searchResults.length}</span>
                  <button type="button" onClick={prevSearchResult} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><ChevronLeft className="w-4 h-4" /></button>
                  <button type="button" onClick={nextSearchResult} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><ChevronRight className="w-4 h-4" /></button>
                </div>
              )}
            </form>
          </div>

          {/* Transcript Lines */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {meeting.transcripts?.map((line: any, index: number) => {
              const active = isLineActive(index, currentTime);
              // Highlight if it matches the current search result
              const isSearchResult = searchResults.length > 0 && searchResults[searchIndex]?.id === line.id;
              
              return (
                <div 
                  key={line.id} 
                  className={`flex gap-4 p-3 -mx-3 rounded-xl cursor-pointer transition-colors ${
                    active ? 'bg-brand-50/50 dark:bg-brand-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                  } ${isSearchResult ? 'ring-2 ring-brand-400 ring-offset-2 dark:ring-offset-slate-900' : ''}`}
                  onClick={() => seekTo(line.timestamp_seconds)}
                >
                  <div className="w-12 shrink-0 pt-1">
                    <span className="text-xs font-medium text-slate-400 hover:text-brand-500 transition-colors">
                      {formatTime(line.timestamp_seconds)}
                    </span>
                  </div>
                  <div>
                    <span className={`text-sm font-semibold mb-1 block ${active ? 'text-brand-600 dark:text-brand-400' : 'text-slate-900 dark:text-slate-200'}`}>
                      {line.speaker}
                    </span>
                    <p className={`text-sm leading-relaxed ${active ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                      {line.transcript_text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-80 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden shrink-0">
          <div className="flex border-b border-slate-100 dark:border-slate-800 shrink-0">
            <button 
              onClick={() => setActiveTab('summary')}
              className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'summary' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              Summary
            </button>
            <button 
              onClick={() => setActiveTab('action_items')}
              className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'action_items' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              Actions
            </button>
            <button 
              onClick={() => setActiveTab('topics')}
              className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'topics' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              Topics
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5">
            {activeTab === 'summary' && (
              <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed">
                {meeting.summary?.content ? (
                  meeting.summary.content.split('\n').map((para: string, i: number) => (
                    <p key={i} className="mb-4">{para}</p>
                  ))
                ) : (
                  <p className="text-slate-400 italic">No summary available for this meeting.</p>
                )}
              </div>
            )}
            
            {activeTab === 'action_items' && (
              <div className="space-y-3">
                {meeting.action_items?.length > 0 ? meeting.action_items.map((item: any) => (
                  <div 
                    key={item.id} 
                    className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:border-brand-200 dark:hover:border-brand-800 transition-colors"
                  >
                    <button 
                      onClick={() => toggleActionItem(item.id, item.completed)}
                      className="mt-0.5 shrink-0 transition-colors"
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 hover:text-brand-500" />
                      )}
                    </button>
                    <div>
                      <p className={`text-sm ${item.completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                        {item.task}
                      </p>
                      {item.owner && (
                        <span className="inline-block mt-2 text-xs font-medium px-2 py-0.5 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-md">
                          @{item.owner}
                        </span>
                      )}
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-slate-400 italic">No action items found.</p>
                )}
              </div>
            )}
            
            {activeTab === 'topics' && (
              <div className="space-y-2">
                {meeting.topics?.length > 0 ? meeting.topics.map((topic: any) => (
                  <button
                    key={topic.id}
                    onClick={() => topic.timestamp_seconds != null && seekTo(topic.timestamp_seconds)}
                    className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-left group"
                  >
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {topic.title}
                    </span>
                    {topic.timestamp_seconds != null && (
                      <span className="text-xs font-medium text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatTime(topic.timestamp_seconds)}
                      </span>
                    )}
                  </button>
                )) : (
                  <p className="text-sm text-slate-400 italic">No topics identified.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Participants Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Edit Participants</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Participants (comma separated)
              </label>
              <textarea
                value={editParticipantsText}
                onChange={(e) => setEditParticipantsText(e.target.value)}
                className="w-full h-24 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500/50 text-sm"
                placeholder="John Doe, Jane Smith"
              />
              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateParticipants}
                  disabled={savingParticipants}
                  className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl disabled:opacity-70"
                >
                  {savingParticipants ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
