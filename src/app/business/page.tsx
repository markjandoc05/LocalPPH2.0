'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { canManageBusiness } from '@/lib/auth/roles';
import BusinessPortalLayout from '@/components/dashboard/BusinessPortalLayout';
import BusinessDashboardStats from '@/components/business/BusinessDashboardStats';
import BusinessListingTable from '@/components/business/BusinessListingTable';
import { getMyBusinesses } from '@/lib/data-connect/business-service';
import { BusinessListing, BusinessStats } from '@/types/business';
import Link from 'next/link';
import { LucidePlus } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';

export default function BusinessPage() {
  const { user, role, loading } = useAuth();
  const [listings, setListings] = useState<BusinessListing[]>([]);
  const [stats, setStats] = useState<BusinessStats>({ total: 0, draft: 0, pending: 0, approved: 0, needsRevision: 0, rejected: 0 });
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (user && canManageBusiness(role)) {
      const fetchListings = async () => {
        try {
          const data = await getMyBusinesses(user.uid);
          setListings(data);
          
          const newStats = {
            total: data.length,
            draft: data.filter(b => b.status === 'DRAFT').length,
            pending: data.filter(b => b.status === 'PENDING').length,
            approved: data.filter(b => b.status === 'APPROVED').length,
            needsRevision: data.filter(b => b.status === 'REVISION_REQUESTED').length,
            rejected: data.filter(b => b.status === 'REJECTED').length,
          };
          setStats(newStats);
        } catch (error) {
          console.error("Failed to fetch businesses", error);
        } finally {
          setDataLoading(false);
        }
      };
      fetchListings();
    }
  }, [user, role]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user || !canManageBusiness(role)) return null;

  return (
    <BusinessPortalLayout>
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${user.displayName}`}
        actions={
          <Link href="/business/listings/new">
            <Button>
              <LucidePlus className="w-4 h-4 mr-2" />
              Add New Business
            </Button>
          </Link>
        }
      />

      <BusinessDashboardStats stats={stats} />

      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Listings</h2>
        {dataLoading ? (
          <div className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-lg shadow-sm">Loading listings...</div>
        ) : (
          <BusinessListingTable listings={listings.slice(0, 5)} /> // Show up to 5 on dashboard
        )}
      </div>
    </BusinessPortalLayout>
  );
}
