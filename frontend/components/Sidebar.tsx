"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    href: "/meetings",
    label: "Meetings",
    icon: "🎙️",
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: "📊",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: "⚙️",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 flex-col border-r border-slate-200 bg-white">

      {/* Logo */}
      <div className="px-5 py-6">
        <Image
          src="/fireflies-logo.png"
          alt="Fireflies"
          width={150}
          height={45}
          priority
          className="object-contain"
        />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 px-3">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            pathname.startsWith(link.href + "/");

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                active
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className="text-lg">{link.icon}</span>

              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

  
    </aside>
  );
}