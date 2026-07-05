'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { canManageBusiness } from '@/lib/auth/roles';
import BusinessPortalLayout from '@/components/dashboard/BusinessPortalLayout';
import BusinessDashboardStats from '@/components/business/BusinessDashboardStats';
import BusinessListingTable from '@/components/business/BusinessListingTable';
import { getMyBusinesses } from '@/lib/data-connect/business-service';
import { BusinessListing, BusinessStats } from '@/types/business';
import Link from 'next/link';
import { LucidePlus, LucideStore, LucideUser } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { parseError, handleAuthRedirect } from '@/lib/utils/error';

export default function BusinessPage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<BusinessListing[]>([]);
  const [stats, setStats] = useState<BusinessStats>({ total: 0, draft: 0, pending: 0, approved: 0, needsRevision: 0, rejected: 0 });
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');

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
        } catch (err: any) {
          const friendly = parseError(err);
          setError(friendly.message);
          handleAuthRedirect(friendly, router);
        } finally {
          setDataLoading(false);
        }
      };
      fetchListings();
    }
  }, [user, role, router]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user || !canManageBusiness(role)) return null;

  return (
    <BusinessPortalLayout>
      <PageHeader
        title={`Welcome back, ${user.displayName || user.email?.split('@')[0] || 'Business Owner'}`}
        description="Manage your business listings and track approval status."
        actions={
          <Link href="/business/listings/new">
            <Button variant="secondary">
              <LucidePlus className="w-4 h-4 mr-2" />
              Add New Business
            </Button>
          </Link>
        }
      />

      {error ? (
        <div className="mb-6">
          <ErrorState title="Failed to Load Dashboard" message={error} />
        </div>
      ) : (
        <>
          <BusinessDashboardStats stats={stats} />

          {/* Quick Actions Grid */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
                <div>
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg w-fit mb-3">
                    <LucidePlus className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1 text-sm">Add Business Listing</h3>
                  <p className="text-xs text-slate-500 mb-4">List and publish a new business or service on LocalPages.ph.</p>
                </div>
                <Link href="/business/listings/new">
                  <Button variant="secondary" className="w-full text-xs font-semibold">
                    Add Listing
                  </Button>
                </Link>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
                <div>
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg w-fit mb-3">
                    <LucideStore className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1 text-sm">View My Listings</h3>
                  <p className="text-xs text-slate-500 mb-4">Monitor active applications, drafts, or approved listings.</p>
                </div>
                <Link href="/business/listings">
                  <Button variant="secondary" className="w-full text-xs font-semibold">
                    View Listings
                  </Button>
                </Link>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
                <div>
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg w-fit mb-3">
                    <LucideUser className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1 text-sm">My Profile</h3>
                  <p className="text-xs text-slate-500 mb-4">Update contact information, account settings, or security preferences.</p>
                </div>
                <Link href="/profile">
                  <Button variant="secondary" className="w-full text-xs font-semibold">
                    My Profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Listings</h2>
            {dataLoading ? (
              <div className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-lg shadow-sm">Loading listings...</div>
            ) : (
              <BusinessListingTable listings={listings.slice(0, 5)} /> // Show up to 5 on dashboard
            )}
          </div>
        </>
      )}
    </BusinessPortalLayout>
  );
}
