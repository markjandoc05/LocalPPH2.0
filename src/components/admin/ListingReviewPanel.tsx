import React from 'react';
import { BusinessListing } from '@/types/business';
import BusinessStatusBadge from '../business/BusinessStatusBadge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';

interface ListingReviewPanelProps {
  business: BusinessListing;
}

export default function ListingReviewPanel({ business }: ListingReviewPanelProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between pb-4">
          <div>
            <CardTitle className="text-2xl">{business.name}</CardTitle>
            <CardDescription className="mt-1">Slug: {business.slug}</CardDescription>
          </div>
          <BusinessStatusBadge status={business.status} />
        </CardHeader>
        <CardContent>
          {business.moderatorNotes && (
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-1">Previous Moderator Notes:</h4>
              <p className="text-sm text-yellow-700">{business.moderatorNotes}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-lg border-b border-slate-100 pb-2 mb-4">Basic Details</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-slate-500">Category</dt>
                  <dd className="font-medium text-slate-900">{business.categoryName || 'Not assigned'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Subcategory</dt>
                  <dd className="font-medium text-slate-900">{business.subcategoryName || 'Not assigned'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Description</dt>
                  <dd className="text-sm mt-1 text-slate-900">{business.description}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Keywords</dt>
                  <dd className="text-sm text-slate-900">{business.keywords || 'None provided'}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="font-semibold text-lg border-b border-slate-100 pb-2 mb-4">Contact & Location</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-slate-500">Address</dt>
                  <dd className="text-sm text-slate-900">{business.addressLine1}</dd>
                  <dd className="text-sm text-slate-900">{business.cityName}, {business.provinceName}, {business.regionName}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Contact</dt>
                  <dd className="text-sm text-slate-900">{business.contactMobile} {business.contactPhone ? `/ ${business.contactPhone}` : ''}</dd>
                  <dd className="text-sm text-blue-600">{business.contactEmail}</dd>
                  <dd className="text-sm text-blue-600">{business.websiteUrl}</dd>
                </div>
                {business.facebookUrl && <dd className="text-sm text-blue-600">Facebook: {business.facebookUrl}</dd>}
                {business.instagramUrl && <dd className="text-sm text-blue-600">Instagram: {business.instagramUrl}</dd>}
                {business.tiktokUrl && <dd className="text-sm text-blue-600">TikTok: {business.tiktokUrl}</dd>}
                {business.shopeeUrl && <dd className="text-sm text-blue-600">Shopee: {business.shopeeUrl}</dd>}
                {business.lazadaUrl && <dd className="text-sm text-blue-600">Lazada: {business.lazadaUrl}</dd>}
                <div>
                  <dt className="text-sm text-slate-500">Owner</dt>
                  <dd className="text-sm text-slate-900">{business.ownerName}</dd>
                </div>
              </dl>

              <details className="mt-8 border border-slate-200 rounded-lg p-4">
                <summary className="font-semibold text-sm cursor-pointer">Technical Details</summary>
                <div className="mt-2 text-xs font-mono text-slate-500 space-y-1">
                  <div>ID: {business.id}</div>
                  <div>Owner ID: {business.ownerId}</div>
                  <div>Category ID: {business.categoryId}</div>
                  <div>Subcategory ID: {business.subcategoryId}</div>
                  <div>Region ID: {business.regionId}</div>
                  <div>Province ID: {business.provinceId}</div>
                  <div>City ID: {business.cityId}</div>
                </div>
              </details>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <h3 className="font-semibold text-lg mb-4">Media (Placeholders)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-32 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-200">
                <span className="text-sm text-slate-400">Logo</span>
              </div>
              <div className="h-32 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-200 col-span-2">
                <span className="text-sm text-slate-400">Cover Image</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
