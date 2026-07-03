import React from 'react';
import Link from 'next/link';
import { BusinessListing } from '@/types/business';
import BusinessStatusBadge from '../business/BusinessStatusBadge';
import { LucideEye } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';
import { Button } from '../ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';

interface AdminListingTableProps {
  listings: BusinessListing[];
}

export default function AdminListingTable({ listings }: AdminListingTableProps) {
  if (!listings || listings.length === 0) {
    return (
      <EmptyState 
        title="No listings found"
        description="There are no listings matching your criteria."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Business Details</TableHead>
          <TableHead>Location & Category</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Dates</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {listings.map((listing) => (
          <TableRow key={listing.id}>
            <TableCell>
              <div className="font-medium text-slate-900">{listing.name}</div>
              <div className="text-xs text-slate-500 mt-1">Owner ID: {listing.ownerId}</div>
            </TableCell>
            <TableCell>
              <div className="text-sm text-slate-900">{listing.cityName || listing.cityId}</div>
              <div className="text-xs text-slate-500">{listing.categoryName || listing.categoryId}</div>
            </TableCell>
            <TableCell>
              <BusinessStatusBadge status={listing.status} />
            </TableCell>
            <TableCell className="text-sm text-slate-500">
              <div>Sub: {new Date(listing.createdAt).toLocaleDateString()}</div>
              <div className="text-xs">Upd: {new Date(listing.updatedAt).toLocaleDateString()}</div>
            </TableCell>
            <TableCell className="text-right">
              <Link href={`/admin/listings/${listing.id}`} title="Review Listing">
                <Button variant="outline" size="sm">
                  <LucideEye className="w-4 h-4 mr-2" />
                  Review
                </Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
