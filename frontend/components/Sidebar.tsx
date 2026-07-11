"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Left sidebar with the logo and primary navigation links.
// `usePathname` lets us highlight the active link.
const links = [
  { href: "/meetings", label: "Meetings", icon: "🎙️" },
  { href: "/analytics", label: "Analytics", icon: "📊" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white font-bold">
          F
        </div>
        <span className="text-lg font-semibold text-brand-700">Fireflies</span>
      </div>

      <nav className="flex flex-col gap-1 px-3">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-brand-100 text-brand-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-5 py-4 text-xs text-slate-400">
        Fireflies Clone v1.0
      </div>
    </aside>
  );
}
