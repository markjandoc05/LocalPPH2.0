"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LucideLayoutDashboard,
  LucideStore,
  LucideUsers,
  LucideCheckCircle,
  LucideAlertCircle,
  LucideXCircle,
  LucideClock,
  LucideActivity,
  LucideDatabase,
  LucideMenu,
  LucideX
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { canAccessAdmin } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";
import { Button } from "../ui/Button";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { role } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Basic check here, though it's protected at the page level
  if (!canAccessAdmin(role)) {
    return null;
  }

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LucideLayoutDashboard,
      exact: true,
    },
    {
      name: "All Listings",
      href: "/admin/listings",
      icon: LucideStore,
      exact: true,
    },
    {
      name: "Pending Approval",
      href: "/admin/listings/pending",
      icon: LucideClock,
      exact: false,
    },
    {
      name: "Needs Revision",
      href: "/admin/listings/needs-revision",
      icon: LucideAlertCircle,
      exact: false,
    },
    {
      name: "Approved",
      href: "/admin/listings/approved",
      icon: LucideCheckCircle,
      exact: false,
    },
    {
      name: "Rejected",
      href: "/admin/listings/rejected",
      icon: LucideXCircle,
      exact: false,
    },
    { name: "Users", href: "/admin/users", icon: LucideUsers, exact: false },
    {
      name: "System Readiness",
      href: "/admin/system/backend-readiness",
      icon: LucideActivity,
      exact: false,
    },
    {
      name: "Firebase Test",
      href: "/admin/system/firebase-test",
      icon: LucideDatabase,
      exact: false,
    },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex flex-col md:flex-row w-full">
      {/* Mobile header */}
      <div className="md:hidden bg-[#0C0C1C] text-white px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-bold">Admin CMS</h2>
        <Button variant="ghost" size="icon" className="text-white hover:bg-slate-800 hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <LucideX className="w-5 h-5" /> : <LucideMenu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "w-full md:w-64 bg-[#0C0C1C] border-r border-gray-800 md:block flex-shrink-0 transition-all",
        mobileMenuOpen ? "block" : "hidden"
      )}>
        <div className="p-6 hidden md:block">
          <h2 className="text-lg font-bold text-white tracking-wide">
            CMS / Admin
          </h2>
          <p className="text-xs text-gray-400 mt-1">Superuser Access</p>
        </div>
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#2563EB] text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-gray-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full">
        <div className="max-w-6xl mx-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
