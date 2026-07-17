"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  LayoutDashboard,
  ReceiptText,
  Sparkles,
  Table2,
  UtensilsCrossed,
} from "lucide-react";

const navigation = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ReceiptText,
  },
  {
    label: "Menu",
    href: "/admin/menu",
    icon: UtensilsCrossed,
  },
  {
    label: "Tables",
    href: "/admin/tables",
    icon: Table2,
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-black/5 bg-[#f6f3f2] px-6 py-7 shadow-sm xl:flex">
      <Link
        href="/admin/dashboard"
        className="font-heading text-[34px] font-bold text-[#855300]"
      >
        TableMind
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ffdad2] text-sm font-bold text-[#763222]">
          AU
        </div>

        <div>
          <p className="text-sm font-semibold text-[#1b1c1c]">Admin User</p>
          <p className="text-xs text-[#534434]">The Bistro Downtown</p>
        </div>
      </div>

      <nav className="mt-14 space-y-3">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-semibold tracking-wide transition ${
                isActive
                  ? "translate-x-1 bg-[#e89611] text-[#2a1700]"
                  : "text-[#534434] hover:bg-[#eae7e7]"
              }`}
            >
              <Icon size={21} strokeWidth={1.8} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-[#a16400] px-4 py-4 text-sm font-semibold text-white shadow-lg"
      >
        <Sparkles size={19} />
        Intelligence Insights
      </button>
    </aside>
  );
}