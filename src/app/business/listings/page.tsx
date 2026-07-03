'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { canManageBusiness } from '@/lib/auth/roles';
import BusinessPortalLayout from '@/components/dashboard/BusinessPortalLayout';
import BusinessListingTable from '@/components/business/BusinessListingTable';
import { getMyBusinesses } from '@/lib/data-connect/business-service';
import { BusinessListing } from '@/types/business';
import Link from 'next/link';
import { LucidePlus } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';

export default function BusinessListingsPage() {
  const { user, role, loading } = useAuth();
  const [listings, setListings] = useState<BusinessListing[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (user && canManageBusiness(role)) {
      const fetchListings = async () => {
        try {
          const data = await getMyBusinesses(user.uid);
          setListings(data);
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
        title="My Listings"
        description="Manage all your business locations"
        actions={
          <Link href="/business/listings/new">
            <Button>
              <LucidePlus className="w-4 h-4 mr-2" />
              Add New Business
            </Button>
          </Link>
        }
      />

      {dataLoading ? (
        <div className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-lg shadow-sm">Loading listings...</div>
      ) : (
        <BusinessListingTable listings={listings} />
      )}
    </BusinessPortalLayout>
  );
}
