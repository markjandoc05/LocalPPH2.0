'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { canAccessAdmin, isAdmin } from '@/lib/auth/roles';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminListingTable from '@/components/admin/AdminListingTable';
import { getAdminDashboardStats, getPendingBusinesses } from '@/lib/data-connect/admin-service';
import { AdminDashboardStats } from '@/types/admin';
import { BusinessListing } from '@/types/business';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { 
  LucideUsers, 
  LucideStore, 
  LucideClock, 
  LucideCheckCircle, 
  LucideAlertCircle, 
  LucideXCircle, 
  LucideActivity,
  LucideArrowRight
} from 'lucide-react';

export default function AdminPage() {
  const { user, role, loading } = useAuth();
  
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [pendingListings, setPendingListings] = useState<BusinessListing[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (user && canAccessAdmin(role)) {
      const fetchData = async () => {
        try {
          const [dashboardStats, pending] = await Promise.all([
            getAdminDashboardStats(),
            getPendingBusinesses()
          ]);
          setStats(dashboardStats);
          setPendingListings(pending);
        } catch (error) {
          console.error("Failed to fetch admin data", error);
        } finally {
          setDataLoading(false);
        }
      };
      fetchData();
    }
  }, [user, role]);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;
  if (!user || !canAccessAdmin(role)) return null;

  const isUserAdmin = isAdmin(role);
  const welcomeName = user.displayName || user.email?.split('@')[0] || (isUserAdmin ? 'Administrator' : 'Moderator');

  // Role-specific stats definitions
  const adminStatsCards = stats ? [
    { title: 'Total Users', value: stats.totalUsers, icon: LucideUsers, href: '/admin/users' },
    { title: 'Total Businesses', value: stats.totalBusinesses, icon: LucideStore, href: '/admin/listings' },
    { title: 'Pending Listings', value: stats.pendingApproval, icon: LucideClock, href: '/admin/listings/pending' },
    { title: 'Approved Listings', value: stats.approved, icon: LucideCheckCircle, href: '/admin/listings/approved' },
  ] : [];

  const moderatorStatsCards = stats ? [
    { title: 'Pending Listings', value: stats.pendingApproval, icon: LucideClock, href: '/admin/listings/pending' },
    { title: 'Needs Revision', value: stats.needsRevision, icon: LucideAlertCircle, href: '/admin/listings/needs-revision' },
    { title: 'Approved Listings', value: stats.approved, icon: LucideCheckCircle, href: '/admin/listings/approved' },
    { title: 'Rejected Listings', value: stats.rejected, icon: LucideXCircle, href: '/admin/listings/rejected' },
  ] : [];

  // Role-specific action definitions
  const adminActions = [
    { title: 'Manage Users', desc: 'Add, edit, or suspend platform accounts.', href: '/admin/users', icon: LucideUsers },
    { title: 'Review Listings', desc: 'Process new and pending business registrations.', href: '/admin/listings/pending', icon: LucideClock },
    { title: 'View All Businesses', desc: 'Browse and moderate all registered directories.', href: '/admin/listings', icon: LucideStore },
    { title: 'System Readiness', desc: 'Monitor API connections and setup state.', href: '/admin/system/backend-readiness', icon: LucideActivity },
  ];

  const moderatorActions = [
    { title: 'Review Pending Listings', desc: 'Approve or reject new applications.', href: '/admin/listings/pending', icon: LucideClock },
    { title: 'View Needs Revision', desc: 'Inspect registrations flagged for update.', href: '/admin/listings/needs-revision', icon: LucideAlertCircle },
    { title: 'View Approved Listings', desc: 'Browse the database of active publications.', href: '/admin/listings/approved', icon: LucideCheckCircle },
  ];

  const activeStats = isUserAdmin ? adminStatsCards : moderatorStatsCards;
  const activeActions = isUserAdmin ? adminActions : moderatorActions;
  const actionGridClass = isUserAdmin
    ? 'grid-cols-2 lg:grid-cols-4'
    : 'grid-cols-2 lg:grid-cols-3';

  return (
    <AdminLayout>
      <PageHeader
        title={`Welcome back, ${welcomeName}`}
        description={isUserAdmin 
          ? "Manage platform users, verify business listings, and monitor system health." 
          : "Review, approve, or reject business listings and verify compliance."
        }
      />

      {/* Stats Section */}
      <h2 className="mb-3 text-base font-bold text-slate-900 sm:mb-4 sm:text-lg">Quick Stats</h2>
      {dataLoading || !stats ? (
        <div className="mb-7 grid grid-cols-2 gap-2.5 sm:mb-8 sm:gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl border border-slate-200 bg-white sm:h-28"></div>
          ))}
        </div>
      ) : (
        <div className="mb-7 grid grid-cols-2 gap-2.5 sm:mb-8 sm:gap-4 lg:grid-cols-4">
          {activeStats.map((card, i) => (
            <StatCard key={i} title={card.title} value={card.value} icon={card.icon} href={card.href} />
          ))}
        </div>
      )}

      {/* Quick Actions Section */}
      <div className="mb-8">
        <h2 className="mb-3 text-base font-bold text-slate-900 sm:mb-4 sm:text-lg">Quick Actions</h2>
        <div className={`grid ${actionGridClass} gap-2.5 sm:gap-4`}>
          {activeActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <Link
                key={i} 
                href={action.href}
                className="group flex min-h-[92px] flex-col justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:min-h-[150px] sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="mb-3 w-fit rounded-lg bg-blue-50 p-1.5 text-blue-600 sm:p-2">
                    <Icon className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                  </div>
                  <LucideArrowRight className="h-3.5 w-3.5 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600 sm:h-4 sm:w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold leading-tight text-slate-900 sm:mb-1 sm:text-sm">{action.title}</h3>
                  <p className="hidden text-xs leading-relaxed text-slate-500 sm:block">{action.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Needs Attention Table */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-900">Needs Attention (Pending)</h2>
          <Link href="/admin/listings/pending" className="text-sm font-medium text-blue-600 hover:underline">
            View All Pending
          </Link>
        </div>
        {dataLoading ? (
          <div className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-lg shadow-sm">Loading listings...</div>
        ) : (
          <AdminListingTable listings={pendingListings.slice(0, 5)} />
        )}
      </div>
    </AdminLayout>
  );
}
