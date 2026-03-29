"use client";

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
  { label: "Dashboard",    href: "/admin",                 icon: LayoutDashboard },
  { label: "Orders",       href: "/admin/orders",          icon: ShoppingBag },
  { label: "Products",     href: "/admin/products",        icon: Package },
  { label: "Patients",     href: "/admin/patients",        icon: Users },
  { label: "Subscriptions",href: "/admin/subscriptions",   icon: RefreshCw },
  { label: "Discounts",    href: "/admin/discounts",       icon: Tag },
  { label: "Content",      href: "/admin/content",         icon: FileText },
  { label: "Messaging",    href: "/admin/messaging",       icon: MessageSquare },
  { label: "Helpdesk",     href: "/admin/helpdesk",        icon: Headphones },
  { label: "Marketing",    href: "/admin/marketing",       icon: Megaphone },
  { label: "Analytics",    href: "/admin/analytics",       icon: BarChart2 },
  { label: "Settings",     href: "/admin/settings",        icon: Settings },
];

type Props = { user: { name: string; email: string; role: string } };

export function AdminSidebar({ user }: Props) {
  const pathname = usePathname();
  const router = useRouter();

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
        {NAV.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-all group ${
              isActive(href)
                ? "bg-[#FDE7E7] text-[#ED1B1B]"
                : "text-[#55575A] hover:bg-gray-50 hover:text-[#0C0D0F]"
            }`}
          >
            <Icon size={17} className="shrink-0" />
            <span className="flex-1">{label}</span>
            {isActive(href) && <ChevronRight size={14} />}
          </Link>
        ))}
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
