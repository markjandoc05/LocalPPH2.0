'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { canAccessAdmin } from '@/lib/auth/roles';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboardStatsCards from '@/components/admin/AdminDashboardStats';
import AdminListingTable from '@/components/admin/AdminListingTable';
import { getAdminDashboardStats, getPendingBusinesses } from '@/lib/data-connect/admin-service';
import { AdminDashboardStats } from '@/types/admin';
import { BusinessListing } from '@/types/business';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';

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

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user || !canAccessAdmin(role)) return null;

  return (
    <AdminLayout>
      <PageHeader
        title="Admin Dashboard"
        description="Platform overview and pending tasks."
      />

      {dataLoading || !stats ? (
        <div className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-lg shadow-sm">Loading metrics...</div>
      ) : (
        <AdminDashboardStatsCards stats={stats} />
      )}

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
