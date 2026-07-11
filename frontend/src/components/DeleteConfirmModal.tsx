'use client';
import { useState } from 'react';
import { X, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function DeleteConfirmModal({ isOpen, onClose, onSuccess, meetingId, meetingTitle }: { isOpen: boolean, onClose: () => void, onSuccess: () => void, meetingId: number, meetingTitle: string }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setLoading(true);
    const loadingToast = toast.loading('Deleting meeting...');
    try {
      await api.deleteMeeting(meetingId);
      toast.success('Meeting deleted successfully!', { id: loadingToast });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete meeting', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Delete Meeting</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Are you sure you want to delete <span className="font-semibold text-slate-700 dark:text-slate-300">"{meetingTitle}"</span>? This action cannot be undone and will remove all transcripts, summaries, and action items.
          </p>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {loading ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
