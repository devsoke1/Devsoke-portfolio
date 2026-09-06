"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  ExternalLink,
  FileText,
  FolderKanban,
  HelpCircle,
  Image as ImageIcon,
  Inbox,
  Layers,
  LogOut,
  Users,
} from "lucide-react";
import BrandMark from "@/components/brand/BrandMark";
import { logoutAdmin } from "../actions";

type AdminSummary = {
  email: string;
  name: string | null;
  role: "SUPER_ADMIN" | "ADMIN" | "EDITOR";
};

type AdminShellProps = {
  admin: AdminSummary;
  active: "dashboard" | "projects" | "services" | "blog" | "media" | "inquiries" | "faqs";
  children: ReactNode;
};

const navItems = [
  {
    id: "dashboard",
    label: "Overview",
    href: "/admin/dashboard",
    icon: Users,
  },
  {
    id: "inquiries",
    label: "Inquiries",
    href: "/admin/inquiries",
    icon: Inbox,
  },
  {
    id: "projects",
    label: "Projects",
    href: "/admin/projects",
    icon: FolderKanban,
  },
  {
    id: "services",
    label: "Services",
    href: "/admin/services",
    icon: Layers,
  },
  {
    id: "faqs",
    label: "FAQs",
    href: "/admin/faqs",
    icon: HelpCircle,
  },
  {
    id: "blog",
    label: "Articles",
    href: "/admin/blog",
    icon: FileText,
  },
  {
    id: "media",
    label: "Media",
    href: "/admin/media",
    icon: ImageIcon,
  },
] as const;

export default function AdminShell({ admin, active, children }: AdminShellProps) {
  const adminRole = admin.role.replace("_", " ");

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col md:flex-row text-brand-fg">
      <aside className="w-full md:w-64 bg-brand-card border-b md:border-b-0 md:border-r border-brand-border flex flex-col justify-between flex-shrink-0">
        <div className="p-5 sm:p-6">
          <div className="flex items-center space-x-3 pb-6 border-b border-brand-rose/15 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-rose/25 bg-brand-plum shadow-md shadow-brand-rose/10">
              <BrandMark variant="icon" className="h-7 w-7" decorative />
            </div>
            <div>
              <h3 className="text-sm font-bold font-heading text-brand-fg">Devsoke Admin</h3>
              <span className="text-[10px] text-gray-400 font-mono">{adminRole}</span>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                    isActive
                      ? "bg-brand-rose/15 border border-brand-rose/30 text-brand-fg shadow-sm"
                      : "border border-transparent hover:border-brand-rose/20 hover:bg-brand-rose/10 text-gray-400 hover:text-brand-fg"
                  }`}
                >
                  <Icon size={16} className={isActive ? "text-brand-rose-text" : undefined} />
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/"
              className="w-full flex items-center gap-3 px-4 py-3 border border-transparent hover:border-brand-rose/20 hover:bg-brand-rose/10 text-gray-400 hover:text-brand-fg text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
            >
              <ExternalLink size={16} /> Live Website
            </Link>
          </nav>
        </div>

        <div className="p-5 sm:p-6 border-t border-brand-rose/15">
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-rose/10 hover:bg-brand-rose/20 border border-brand-rose/25 text-xs text-brand-rose-text font-bold uppercase tracking-wider rounded-xl transition-all"
            >
              <LogOut size={16} /> Log Out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 p-5 sm:p-7 md:p-10 space-y-6 sm:space-y-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
