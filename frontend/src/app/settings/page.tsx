'use client';
import { Settings as SettingsIcon, Crown, Bell, Lock, Users, Sparkles } from 'lucide-react';

export default function Settings() {
  const sections = [
    { title: 'Account Settings', icon: Users, description: 'Manage your profile and workspace' },
    { title: 'Notifications', icon: Bell, description: 'Configure email and push notifications' },
    { title: 'Integrations', icon: Sparkles, description: 'Connect with Zoom, Google Meet, and Slack' },
    { title: 'Privacy & Security', icon: Lock, description: 'Manage data retention and access controls' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your Fireflies account preferences.</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center backdrop-blur-sm relative overflow-hidden">
        {/* Background decorative blobs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-md mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-brand-100 to-purple-100 dark:from-brand-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-white/50 dark:border-slate-800">
            <SettingsIcon className="w-10 h-10 text-brand-600 dark:text-brand-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Settings are Coming Soon</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            We are working hard to bring you advanced workspace controls, custom vocabulary dictionaries, and automated sharing rules.
          </p>
          
          <div className="bg-brand-50 dark:bg-brand-900/20 rounded-xl p-5 border border-brand-100 dark:border-brand-800/50 flex items-start gap-4 text-left">
            <div className="bg-brand-500 p-2 rounded-lg shrink-0 mt-0.5">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-brand-900 dark:text-brand-100 mb-1">Upgrade to Pro</h4>
              <p className="text-sm text-brand-700 dark:text-brand-300">Get early access to all premium settings and unlimited AI summaries.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
