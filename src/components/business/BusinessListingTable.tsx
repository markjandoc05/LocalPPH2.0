import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BusinessListing } from '@/types/business';
import BusinessStatusBadge from './BusinessStatusBadge';
import { LucideEdit, LucideEye, LucideTrash2 } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';
import { Button } from '../ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';
import { auth } from '@/lib/firebase/config';
import { formatAppDate } from '@/lib/time';

export default function BusinessListingTable({ listings }: { listings: BusinessListing[] }) {
  const router = useRouter();
  
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch('/api/business/delete-listing', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ businessId: id })
        });
        if (res.ok) {
            window.location.reload();
        } else {
            const data = await res.json();
            alert(data.error || "Failed to delete listing.");
        }
      } catch (e) {
        console.error(e);
        alert("An error occurred while deleting the listing.");
      }
    }
  }

  if (!listings || listings.length === 0) {
    return (
      <EmptyState 
        title="No business listings yet"
        description="You haven't created any business listings yet."
        actionLabel="Add New Business"
        onAction={() => router.push('/business/listings/new')}
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Business Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>City</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {listings.map((listing) => (
          <TableRow key={listing.id}>
            <TableCell>
              <div className="font-medium text-slate-900">{listing.name}</div>
              <div className="text-sm text-slate-500">Updated: {formatAppDate(listing.updatedAt)}</div>
            </TableCell>
            <TableCell className="text-slate-500">
              {listing.categoryName}
            </TableCell>
            <TableCell className="text-slate-500">
              {listing.cityName}
            </TableCell>
            <TableCell>
              <BusinessStatusBadge status={listing.status} />
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Link href={`/business/listings/${listing.id}/edit`} title="Edit">
                  <Button variant="ghost" size="icon">
                    <LucideEdit className="w-4 h-4" />
                  </Button>
                </Link>
                {listing.status === 'APPROVED' && (
                  <Link href={`/business/${listing.slug}`} target="_blank" title="View Public Profile">
                    <Button variant="ghost" size="icon">
                      <LucideEye className="w-4 h-4 text-slate-500 hover:text-blue-600" />
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="icon" onClick={() => handleDelete(listing.id)} title="Delete" className="text-red-500 hover:text-red-700">
                  <LucideTrash2 className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
