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
import { Button } from '@/components/ui/Button';
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
    { title: 'Total Users', value: stats.totalUsers, icon: LucideUsers },
    { title: 'Total Businesses', value: stats.totalBusinesses, icon: LucideStore },
    { title: 'Pending Listings', value: stats.pendingApproval, icon: LucideClock },
    { title: 'Approved Listings', value: stats.approved, icon: LucideCheckCircle },
  ] : [];

  const moderatorStatsCards = stats ? [
    { title: 'Pending Listings', value: stats.pendingApproval, icon: LucideClock },
    { title: 'Needs Revision', value: stats.needsRevision, icon: LucideAlertCircle },
    { title: 'Approved Listings', value: stats.approved, icon: LucideCheckCircle },
    { title: 'Rejected Listings', value: stats.rejected, icon: LucideXCircle },
  ] : [];

  // Role-specific action definitions
  const adminActions = [
    { title: 'Manage Users', desc: 'Add, edit, or suspend platform accounts.', href: '/admin/users', icon: LucideUsers, btnText: 'Manage Users' },
    { title: 'Review Listings', desc: 'Process new and pending business registrations.', href: '/admin/listings/pending', icon: LucideClock, btnText: 'Review Listings' },
    { title: 'View All Businesses', desc: 'Browse and moderate all registered directories.', href: '/admin/listings', icon: LucideStore, btnText: 'View Businesses' },
    { title: 'System Readiness', desc: 'Monitor API connections and setup state.', href: '/admin/system/backend-readiness', icon: LucideActivity, btnText: 'Check System' },
  ];

  const moderatorActions = [
    { title: 'Review Pending Listings', desc: 'Approve or reject new applications.', href: '/admin/listings/pending', icon: LucideClock, btnText: 'Review Pending' },
    { title: 'View Needs Revision', desc: 'Inspect registrations flagged for update.', href: '/admin/listings/needs-revision', icon: LucideAlertCircle, btnText: 'View Revisions' },
    { title: 'View Approved Listings', desc: 'Browse the database of active publications.', href: '/admin/listings/approved', icon: LucideCheckCircle, btnText: 'View Approved' },
  ];

  const activeStats = isUserAdmin ? adminStatsCards : moderatorStatsCards;
  const activeActions = isUserAdmin ? adminActions : moderatorActions;

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
      <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Stats</h2>
      {dataLoading || !stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-white border border-slate-200 rounded-xl h-28"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {activeStats.map((card, i) => (
            <StatCard key={i} title={card.title} value={card.value} icon={card.icon} />
          ))}
        </div>
      )}

      {/* Quick Actions Section */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
        <div className={`grid grid-cols-1 md:grid-cols-${isUserAdmin ? '4' : '3'} gap-4`}>
          {activeActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <div 
                key={i} 
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all"
              >
                <div>
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg w-fit mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1 text-sm">{action.title}</h3>
                  <p className="text-xs text-slate-500 mb-4">{action.desc}</p>
                </div>
                <Link href={action.href}>
                  <Button variant="secondary" className="w-full text-xs font-semibold">
                    {action.btnText}
                    <LucideArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
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
