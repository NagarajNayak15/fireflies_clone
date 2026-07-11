'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Settings, Video, FileAudio } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Meetings', href: '/', icon: Video },
    { name: 'Analytics', href: '/analytics', icon: LayoutDashboard },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl flex flex-col h-full hidden md:flex">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-brand-600 p-2 rounded-xl">
          <FileAudio className="w-6 h-6 text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
          Fireflies
        </span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 m-4 rounded-xl bg-gradient-to-br from-brand-50 to-indigo-50 dark:from-brand-900/20 dark:to-indigo-900/20 border border-brand-100 dark:border-brand-800/50">
        <h4 className="text-sm font-semibold text-brand-900 dark:text-brand-100 mb-1">Pro Plan</h4>
        <p className="text-xs text-brand-600 dark:text-brand-300 mb-3">Unlimited AI summaries & transcripts.</p>
        <button className="w-full text-xs font-medium bg-brand-600 hover:bg-brand-700 text-white py-2 rounded-lg transition-colors">
          Upgrade Now
        </button>
      </div>
    </aside>
  );
}
