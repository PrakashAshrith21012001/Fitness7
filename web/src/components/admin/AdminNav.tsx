"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { StaffRole } from "@f7/content";
import { cn } from "@/lib/cn";

const ITEMS: { href: string; label: string; min: StaffRole }[] = [
  { href: "/admin", label: "Today", min: "coach" },
  { href: "/admin/treks", label: "Treks", min: "coach" },
  { href: "/admin/members", label: "Members", min: "coach" },
  { href: "/admin/leads", label: "Leads", min: "coach" },
  { href: "/admin/announcements", label: "Announcements", min: "admin" },
  { href: "/admin/staff", label: "Staff", min: "owner" },
];
const RANK: Record<StaffRole, number> = { coach: 1, admin: 2, owner: 3 };

export function AdminNav({ role }: { role: StaffRole }) {
  const path = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:px-3 md:pb-0" aria-label="Admin">
      {ITEMS.filter((i) => RANK[role] >= RANK[i.min]).map((i) => {
        const on = i.href === "/admin" ? path === "/admin" : path.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            className={cn("whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold min-h-[44px] flex items-center", on ? "bg-green text-on-accent" : "text-white/80 hover:bg-surface-2")}
            aria-current={on ? "page" : undefined}
          >
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
