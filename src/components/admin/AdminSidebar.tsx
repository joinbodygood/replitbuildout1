"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  RefreshCw,
  Tag,
  FileText,
  MessageSquare,
  Megaphone,
  BarChart2,
  Settings,
  LogOut,
  ChevronRight,
  Headphones,
} from "lucide-react";

const NAV = [
  { label: "Dashboard",     href: "/admin",                icon: LayoutDashboard, badge: false },
  { label: "Orders",        href: "/admin/orders",         icon: ShoppingBag,     badge: false },
  { label: "Products",      href: "/admin/products",       icon: Package,         badge: false },
  { label: "Patients",      href: "/admin/patients",       icon: Users,           badge: false },
  { label: "Subscriptions", href: "/admin/subscriptions",  icon: RefreshCw,       badge: false },
  { label: "Discounts",     href: "/admin/discounts",      icon: Tag,             badge: false },
  { label: "Content",       href: "/admin/content",        icon: FileText,        badge: false },
  { label: "Messaging",     href: "/admin/messaging",      icon: MessageSquare,   badge: false },
  { label: "Helpdesk",      href: "/admin/helpdesk",       icon: Headphones,      badge: true  },
  { label: "Marketing",     href: "/admin/marketing",      icon: Megaphone,       badge: false },
  { label: "Analytics",     href: "/admin/analytics",      icon: BarChart2,       badge: false },
  { label: "Settings",      href: "/admin/settings",       icon: Settings,        badge: false },
];

type Props = { user: { name: string; email: string; role: string } };

export function AdminSidebar({ user }: Props) {
  const pathname = usePathname();
  const router   = useRouter();
  const [openCount, setOpenCount] = useState<number>(0);

  // Poll Chatwoot open conversation count every 60 s
  useEffect(() => {
    let cancelled = false;
    async function fetchCount() {
      try {
        const res  = await fetch("/api/admin/chatwoot");
        if (!res.ok) return;
        const data = await res.json() as { openCount: number };
        if (!cancelled) setOpenCount(data.openCount ?? 0);
      } catch {
        // silently ignore network errors
      }
    }
    fetchCount();
    const interval = setInterval(fetchCount, 60_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 bg-white border-r border-[#E5E5E5] flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[#E5E5E5]">
        <p className="font-bold text-lg text-[#0C0D0F]" style={{ fontFamily: "Poppins, sans-serif" }}>
          Body Good<span className="text-[#ED1B1B]">.</span>
        </p>
        <p className="text-xs text-[#55575A] mt-0.5">Admin Dashboard</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {NAV.map(({ label, href, icon: Icon, badge }) => {
          const active      = isActive(href);
          const showBadge   = badge && openCount > 0;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-all group ${
                active
                  ? "bg-[#FDE7E7] text-[#ED1B1B]"
                  : "text-[#55575A] hover:bg-gray-50 hover:text-[#0C0D0F]"
              }`}
            >
              <Icon size={17} className="shrink-0" />
              <span className="flex-1">{label}</span>
              {showBadge && !active && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#ED1B1B] text-white text-[10px] font-bold flex items-center justify-center">
                  {openCount > 99 ? "99+" : openCount}
                </span>
              )}
              {active && <ChevronRight size={14} />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-[#E5E5E5] p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-[#ED1B1B] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#0C0D0F] truncate">{user.name}</p>
            <p className="text-xs text-[#55575A] truncate">{user.role.replace("_", " ")}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-[#55575A] hover:text-[#ED1B1B] transition-colors w-full"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
