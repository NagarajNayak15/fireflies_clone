import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import TopNav from '@/components/TopNav';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Fireflies.ai Clone',
  description: 'AI Meeting Notes and Transcription',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="antialiased h-full">
      <body className={`${inter.className} h-full overflow-hidden flex bg-slate-50 dark:bg-[#0b0f19]`}>
        <Sidebar />
        <div className="flex-1 flex flex-col h-full min-w-0">
          <TopNav />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '12px',
            },
            success: {
              style: {
                background: '#10b981',
              }
            },
            error: {
              style: {
                background: '#ef4444',
              }
            }
          }}
        />
      </body>
    </html>
  );
}
