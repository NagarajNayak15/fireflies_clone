'use client';
import { useState, useRef } from 'react';
import { X, Upload, FileText, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function CreateMeetingModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
  const [title, setTitle] = useState('');
  const [transcriptText, setTranscriptText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      toast.error('Title is required');
      return;
    }
    if (!file && !transcriptText) {
      toast.error('Please upload a .txt file or paste transcript text');
      return;
    }

    setLoading(true);
    let finalFile = file;

    // If they pasted text but didn't upload a file, convert text to a Blob/File
    if (!finalFile && transcriptText) {
      const blob = new Blob([transcriptText], { type: 'text/plain' });
      finalFile = new File([blob], 'transcript.txt', { type: 'text/plain' });
    }

    const formData = new FormData();
    formData.append('title', title);
    if (finalFile) {
      formData.append('transcript', finalFile);
    }

    // Show a loading toast because the free-tier backend might be waking up
    const loadingToast = toast.loading('Waking up the server, this may take up to a minute...');

    try {
      await api.createMeeting(formData);
      toast.success('Meeting created successfully!', { id: loadingToast });
      setTitle('');
      setTranscriptText('');
      setFile(null);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create meeting', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.name.endsWith('.txt')) {
        toast.error('Only .txt files are supported');
        return;
      }
      setFile(selected);
      setTranscriptText(''); // clear text if file uploaded
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Upload New Meeting</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Meeting Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q3 Roadmap Planning"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Transcript</label>
            
            <div className="space-y-3">
              {/* File Upload Area */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${file ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
              >
                <input 
                  type="file" 
                  accept=".txt" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                {file ? (
                  <>
                    <FileText className="w-8 h-8 text-brand-500 mb-2" />
                    <span className="text-sm font-medium text-brand-700 dark:text-brand-300">{file.name}</span>
                    <span className="text-xs text-brand-500 mt-1">Click to change file</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Upload a .txt file</span>
                    <span className="text-xs text-slate-500 mt-1">or drag and drop</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
                <span className="text-xs font-medium text-slate-400 uppercase">OR PASTE TEXT</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
              </div>

              {/* Text Area */}
              <textarea
                value={transcriptText}
                onChange={(e) => {
                  setTranscriptText(e.target.value);
                  if (e.target.value) setFile(null); // clear file if they type
                }}
                disabled={!!file}
                placeholder={file ? "Clear the uploaded file to paste text instead." : "Paste raw transcript text here..."}
                className={`w-full h-32 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all resize-none ${file ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Processing...' : 'Upload Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
