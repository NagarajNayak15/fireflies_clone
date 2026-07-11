import { Search, Bell, User } from 'lucide-react';

export default function TopNav() {
  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search all your meetings..."
            className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-slate-900 dark:text-white placeholder:text-slate-500 transition-all"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4 ml-4">
        <button className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-purple-500 flex items-center justify-center shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
          <User className="w-4 h-4 text-white" />
        </div>
      </div>
    </header>
  );
}
