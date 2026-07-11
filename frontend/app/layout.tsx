import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Fireflies Clone",
  description: "Meeting notes & transcription dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex flex-1 flex-col">
            <Navbar />
            <main className="flex-1 p-6">{children}</main>
          </div>
        </div>
        {/* Global toast notifications (success / error) live here. */}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
