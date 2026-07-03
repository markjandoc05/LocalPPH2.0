'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { canAccessAdmin } from '@/lib/auth/roles';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminListingTable from '@/components/admin/AdminListingTable';
import { getAllBusinesses } from '@/lib/data-connect/admin-service';
import { BusinessListing } from '@/types/business';
import { PageHeader } from '@/components/ui/PageHeader';

export default function AdminRejectedListingsPage() {
  const { user, role, loading } = useAuth();
  const [listings, setListings] = useState<BusinessListing[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (user && canAccessAdmin(role)) {
      const fetchData = async () => {
        try {
          const data = await getAllBusinesses({ status: 'REJECTED' });
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
        title="Rejected Listings"
        description="Listings that have been rejected."
      />

      {dataLoading ? (
        <div className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-lg shadow-sm">Loading listings...</div>
      ) : (
        <AdminListingTable listings={listings} />
      )}
    </AdminLayout>
  );
}
