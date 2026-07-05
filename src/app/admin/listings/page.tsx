'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { canAccessAdmin } from '@/lib/auth/roles';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminListingTable from '@/components/admin/AdminListingTable';
import { getAllBusinesses } from '@/lib/data-connect/admin-service';
import { BusinessListing } from '@/types/business';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminListingsPage() {
  const { user, role, loading } = useAuth();
  const [listings, setListings] = useState<BusinessListing[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (user && canAccessAdmin(role)) {
      const fetchData = async () => {
        try {
          const data = await getAllBusinesses();
          setListings(data);
        } catch (error) {
          console.error("Failed to fetch listings", error);
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
        title="All Business Listings"
        description="Manage all businesses across the platform."
      />

      {dataLoading ? (
        <div className="space-y-4">
           <Skeleton className="h-10 w-full" />
           <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <AdminListingTable listings={listings} />
      )}
    </AdminLayout>
  );
}
