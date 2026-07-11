'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideLayoutDashboard, LucideStore, LucideSettings, LucideMenu, LucideX } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '@/lib/utils';

interface BusinessPortalLayoutProps {
  children: React.ReactNode;
}

export default function BusinessPortalLayout({ children }: BusinessPortalLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/business', icon: LucideLayoutDashboard },
    { name: 'My Listings', href: '/business/listings', icon: LucideStore },
    { name: 'Settings', href: '/business/settings', icon: LucideSettings },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex flex-col md:flex-row w-full">
      {/* Mobile header */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Business Portal</h2>
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <LucideX className="w-5 h-5" /> : <LucideMenu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "w-full md:w-64 bg-white border-r border-slate-200 md:block flex-shrink-0 transition-all",
        mobileMenuOpen ? "block" : "hidden"
      )}>
        <div className="p-6 hidden md:block">
          <h2 className="text-lg font-bold text-slate-900">Business Portal</h2>
        </div>
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/business' && pathname.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-blue-50 text-blue-600" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-blue-600" : "text-slate-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full">
        <div className="max-w-5xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
