import React from 'react';
import { AdminDashboardStats } from '@/types/admin';
import { 
  LucideStore, 
  LucideClock, 
  LucideCheckCircle, 
  LucideAlertCircle, 
  LucideXCircle, 
  LucideBan, 
  LucideUsers, 
  LucideBriefcase 
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardStatsCards({ stats }: { stats: AdminDashboardStats }) {
  const cards = [
    { title: 'Total Listings', value: stats.totalBusinesses, icon: LucideStore, color: 'text-gray-600', bg: 'bg-gray-100', href: '/admin/listings' },
    { title: 'Pending Approval', value: stats.pendingApproval, icon: LucideClock, color: 'text-blue-600', bg: 'bg-blue-100', href: '/admin/listings/pending' },
    { title: 'Needs Revision', value: stats.needsRevision, icon: LucideAlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-100', href: '/admin/listings/needs-revision' },
    { title: 'Approved', value: stats.approved, icon: LucideCheckCircle, color: 'text-green-600', bg: 'bg-green-100', href: '/admin/listings/approved' },
    { title: 'Rejected', value: stats.rejected, icon: LucideXCircle, color: 'text-red-600', bg: 'bg-red-100', href: '/admin/listings/rejected' },
    { title: 'Suspended', value: stats.suspended, icon: LucideBan, color: 'text-red-800', bg: 'bg-red-200', href: '/admin/listings' },
    { title: 'Total Users', value: stats.totalUsers, icon: LucideUsers, color: 'text-purple-600', bg: 'bg-purple-100', href: '/admin/users' },
    { title: 'Business Accounts', value: stats.businessAccounts, icon: LucideBriefcase, color: 'text-indigo-600', bg: 'bg-indigo-100', href: '/admin/users' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <Link href={card.href} key={i} className="block group">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 transition-shadow group-hover:shadow-md">
              <div className={`p-3 rounded-lg ${card.bg}`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">{card.title}</p>
                <p className="text-2xl font-bold text-[#0C0C1C]">{card.value}</p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
