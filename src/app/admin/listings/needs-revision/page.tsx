'use client';

import { useCallback, useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { canAccessAdmin } from '@/lib/auth/roles';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminListingTable from '@/components/admin/AdminListingTable';
import { getAllBusinesses } from '@/lib/data-connect/admin-service';
import { BusinessListing } from '@/types/business';
import { PageHeader } from '@/components/ui/PageHeader';

export default function AdminNeedsRevisionListingsPage() {
  const { user, role, loading } = useAuth();
  const [listings, setListings] = useState<BusinessListing[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const fetchListings = useCallback(async () => {
    const data = await getAllBusinesses({ status: 'REVISION_REQUESTED' });
    setListings(data);
  }, []);

  useEffect(() => {
    if (user && canAccessAdmin(role)) {
      const fetchData = async () => {
        try {
          await fetchListings();
        } catch (error) {
          console.error("Failed to fetch listings", error);
        } finally {
          setDataLoading(false);
        }
      };
      fetchData();
    }
  }, [user, role, fetchListings]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user || !canAccessAdmin(role)) return null;

  return (
    <AdminLayout>
      <PageHeader
        title="Needs Revision"
        description="Track requested changes and remind owners to upload their DTI /SEC Certificate or another valid business registration document."
      />

      {dataLoading ? (
        <div className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-lg shadow-sm">Loading listings...</div>
      ) : (
        <AdminListingTable
          listings={listings}
          showRevisionReminderActions
          onRevisionReminderSent={fetchListings}
        />
      )}
    </AdminLayout>
  );
}
