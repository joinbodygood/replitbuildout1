"use client";

import { Bell, Search } from "lucide-react";

type Props = {
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
  user: { name: string; role: string };
};

export function AdminTopBar({ title, breadcrumbs, user }: Props) {
  return (
    <header className="h-14 border-b border-[#E5E5E5] bg-white flex items-center px-6 gap-4 shrink-0">
      {/* Breadcrumbs */}
      <div className="flex-1 min-w-0">
        {breadcrumbs && breadcrumbs.length > 1 && (
          <p className="text-xs text-[#55575A] mb-0.5">
            {breadcrumbs.map((b, i) => (
              <span key={i}>
                {i > 0 && <span className="mx-1.5">/</span>}
                <span className={i === breadcrumbs.length - 1 ? "text-[#0C0D0F]" : ""}>
                  {b.label}
                </span>
              </span>
            ))}
          </p>
        )}
        <h1
          className="text-base font-semibold text-[#0C0D0F] leading-tight truncate"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          {title}
        </h1>
      </div>

      {/* Search */}
      <div className="relative hidden md:block">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#55575A]" />
        <input
          placeholder="Search…"
          className="pl-9 pr-4 py-1.5 text-sm border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#ED1B1B] w-52 transition-colors"
        />
      </div>

      {/* Notifications */}
      <button className="relative p-1.5 text-[#55575A] hover:text-[#0C0D0F] transition-colors">
        <Bell size={18} />
        <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-[#ED1B1B] rounded-full" />
      </button>

      {/* Avatar */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-[#ED1B1B] rounded-full flex items-center justify-center text-white text-xs font-bold">
          {user.name.slice(0, 2).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
