'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { BusinessListing, BusinessStatus } from '@/types/business';
import { formatAppDate } from '@/lib/time';
import BusinessStatusBadge from '../business/BusinessStatusBadge';
import {
  LucideChevronLeft,
  LucideChevronRight,
  LucideEye,
  LucideFilter,
  LucideRotateCcw,
  LucideSearch,
  LucideSlidersHorizontal
} from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';

interface AdminListingTableProps {
  listings: BusinessListing[];
}

type SortOption = 'created_desc' | 'created_asc' | 'updated_desc' | 'updated_asc' | 'name_asc' | 'name_desc' | 'status_asc';
type StatusFilter = 'ALL' | BusinessStatus;

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending Approval' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REVISION_REQUESTED', label: 'Needs Revision' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'created_desc', label: 'Newest submitted' },
  { value: 'created_asc', label: 'Oldest submitted' },
  { value: 'updated_desc', label: 'Recently updated' },
  { value: 'updated_asc', label: 'Least recently updated' },
  { value: 'name_asc', label: 'Business name A-Z' },
  { value: 'name_desc', label: 'Business name Z-A' },
  { value: 'status_asc', label: 'Status A-Z' },
];

const getDateValue = (value: string) => new Date(value).getTime() || 0;
const LISTINGS_PER_PAGE = 10;

export default function AdminListingTable({ listings }: AdminListingTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [submittedFrom, setSubmittedFrom] = useState('');
  const [submittedTo, setSubmittedTo] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('created_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const filteredListings = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const fromDate = submittedFrom ? new Date(`${submittedFrom}T00:00:00`).getTime() : null;
    const toDate = submittedTo ? new Date(`${submittedTo}T23:59:59`).getTime() : null;

    return listings
      .filter((listing) => {
        if (statusFilter !== 'ALL' && listing.status !== statusFilter) return false;

        const submittedAt = getDateValue(listing.createdAt);
        if (fromDate && submittedAt < fromDate) return false;
        if (toDate && submittedAt > toDate) return false;

        if (!normalizedSearch) return true;

        return [
          listing.name,
          listing.ownerName,
          listing.cityName,
          listing.provinceName,
          listing.regionName,
          listing.categoryName,
          listing.subcategoryName,
          listing.status,
          listing.id,
        ]
          .some((value) => String(value || '').toLowerCase().includes(normalizedSearch));
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'created_asc':
            return getDateValue(a.createdAt) - getDateValue(b.createdAt);
          case 'updated_desc':
            return getDateValue(b.updatedAt) - getDateValue(a.updatedAt);
          case 'updated_asc':
            return getDateValue(a.updatedAt) - getDateValue(b.updatedAt);
          case 'name_asc':
            return a.name.localeCompare(b.name);
          case 'name_desc':
            return b.name.localeCompare(a.name);
          case 'status_asc':
            return a.status.localeCompare(b.status);
          case 'created_desc':
          default:
            return getDateValue(b.createdAt) - getDateValue(a.createdAt);
        }
      });
  }, [listings, searchTerm, sortBy, statusFilter, submittedFrom, submittedTo]);

  const hasActiveFilters = searchTerm || statusFilter !== 'ALL' || submittedFrom || submittedTo || sortBy !== 'created_desc';
  const totalPages = Math.max(1, Math.ceil(filteredListings.length / LISTINGS_PER_PAGE));
  const visiblePage = Math.min(currentPage, totalPages);
  const pageStart = (visiblePage - 1) * LISTINGS_PER_PAGE;
  const paginatedListings = filteredListings.slice(pageStart, pageStart + LISTINGS_PER_PAGE);
  const pageEnd = Math.min(pageStart + LISTINGS_PER_PAGE, filteredListings.length);

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setSubmittedFrom('');
    setSubmittedTo('');
    setSortBy('created_desc');
    setCurrentPage(1);
  };

  if (!listings || listings.length === 0) {
    return (
      <EmptyState 
        title="No listings found"
        description="There are no listings matching your criteria."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[160px_minmax(260px,1fr)_190px_220px_auto_auto] lg:items-end">
            <div className="lg:pb-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <LucideFilter className="h-4 w-4 text-blue-600" />
                Filter listings
              </div>
              <p className="mt-1 text-xs text-slate-600">
                {filteredListings.length} of {listings.length} listings
              </p>
            </div>

            <label className="space-y-1 sm:col-span-2 lg:col-span-1">
              <span className="text-xs font-medium text-slate-600">Search</span>
              <div className="relative">
                <LucideSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Business, owner, city, or category"
                  className="pl-9"
                />
              </div>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600">Status</span>
              <Select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as StatusFilter);
                  setCurrentPage(1);
                }}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            </label>

            <label className="space-y-1 sm:col-span-2 lg:col-span-1">
              <span className="text-xs font-medium text-slate-600">Sort by</span>
              <Select
                value={sortBy}
                onChange={(event) => {
                  setSortBy(event.target.value as SortOption);
                  setCurrentPage(1);
                }}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            </label>

            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAdvancedFilters((value) => !value)}
              size="sm"
              className="h-10 w-full"
            >
              <LucideSlidersHorizontal className="mr-2 h-4 w-4" />
              {showAdvancedFilters ? 'Hide' : 'Advanced'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
              size="sm"
              className="h-10 w-full"
            >
              <LucideRotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>

          {showAdvancedFilters && (
            <div className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600">Submitted from</span>
                <input
                  type="date"
                  value={submittedFrom}
                  onChange={(event) => {
                    setSubmittedFrom(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-black placeholder:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600">Submitted to</span>
                <input
                  type="date"
                  value={submittedTo}
                  onChange={(event) => {
                    setSubmittedTo(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-black placeholder:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {filteredListings.length === 0 ? (
        <EmptyState
          title="No listings match these filters"
          description="Try adjusting the status, submitted date range, or sorting option."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
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
              {paginatedListings.map((listing) => (
                <TableRow key={listing.id} className="hover:bg-blue-50/50">
                  <TableCell>
                    <div className="font-medium text-slate-900">{listing.name}</div>
                    <div className="text-xs text-slate-600 mt-1">Owner: {listing.ownerName}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-900">{listing.cityName}</div>
                    <div className="text-xs text-slate-600">{listing.categoryName}</div>
                  </TableCell>
                  <TableCell>
                    <BusinessStatusBadge status={listing.status} />
                  </TableCell>
                  <TableCell className="text-sm text-slate-700">
                    <div>Sub: {formatAppDate(listing.createdAt)}</div>
                    <div className="text-xs">Upd: {formatAppDate(listing.updatedAt)}</div>
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
          <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-700">
              Showing <span className="font-semibold">{pageStart + 1}</span> to{' '}
              <span className="font-semibold">{pageEnd}</span> of{' '}
              <span className="font-semibold">{filteredListings.length}</span> listings
            </p>
            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={visiblePage === 1}
                className="min-w-24"
              >
                <LucideChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <span className="whitespace-nowrap rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                Page {visiblePage} of {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={visiblePage === totalPages}
                className="min-w-24"
              >
                Next
                <LucideChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
