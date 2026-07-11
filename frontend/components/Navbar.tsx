"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Top navbar: a global search box and a profile icon placeholder.
export default function Navbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Search redirects to the meetings dashboard with the query in the URL.
    const q = query.trim();
    router.push(q ? `/meetings?q=${encodeURIComponent(q)}` : "/meetings");
  }

  return (
    <header className="flex items-center gap-4 border-b border-slate-200 bg-white px-6 py-3">
      <form onSubmit={onSubmit} className="flex-1 max-w-xl">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search meetings..."
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-brand-400 focus:bg-white"
        />
      </form>
      <div className="h-9 w-9 rounded-full bg-brand-600 text-center leading-9 text-white font-semibold">
        U
      </div>
    </header>
  );
}
