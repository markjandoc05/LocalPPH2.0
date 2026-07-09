import React from 'react';
import { BusinessListing } from '@/types/business';
import BusinessStatusBadge from '../business/BusinessStatusBadge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { getShortDesc, getFullDesc } from '@/lib/utils';

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
                  <dt className="text-sm text-slate-500">Short Description</dt>
                  <dd className="text-sm mt-1 text-slate-900">{getShortDesc(business.description)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Full Description</dt>
                  <dd className="text-sm mt-1 text-slate-900 whitespace-pre-wrap">{getFullDesc(business.description)}</dd>
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

          <div className="mt-8 border-t border-slate-100 pt-6 space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-4">Uploaded Media</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-xs font-medium text-slate-500 uppercase mb-2">Business Logo</h4>
                  <div className="h-32 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-200 overflow-hidden relative">
                    {business.logoUrl ? (
                      <img src={business.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm text-slate-400">No logo uploaded</span>
                    )}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <h4 className="text-xs font-medium text-slate-500 uppercase mb-2">Cover Image</h4>
                  <div className="h-32 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-200 overflow-hidden relative">
                    {business.coverUrl ? (
                      <img src={business.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm text-slate-400">No cover image uploaded</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Gallery Images */}
            {business.gallery && Array.isArray(business.gallery) && business.gallery.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-slate-500 uppercase mb-2">Gallery Images</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {business.gallery.map((imgUrl, idx) => (
                    <div key={idx} className="aspect-video relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                      <img src={imgUrl} alt={`Gallery Image ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verification Documents */}
            <div>
              <h3 className="font-semibold text-lg border-t border-slate-100 pt-6 mb-4">Verification Documents</h3>
              {business.documents && Array.isArray(business.documents) && business.documents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {business.documents.map((doc: any, idx: number) => {
                    const isPdf = doc.url?.toLowerCase().includes('.pdf') || doc.name?.toLowerCase().includes('.pdf');
                    return (
                      <div key={doc.id || idx} className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
                        <div>
                          <p className="font-semibold text-slate-800 text-sm truncate">{doc.name || `Document ${idx + 1}`}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-1">ID: {doc.id}</p>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <a 
                            href={doc.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center justify-center px-3 py-1.5 bg-[#2563EB] text-white hover:bg-blue-600 rounded-lg text-xs font-medium transition-colors"
                          >
                            View Document
                          </a>
                          {isPdf && (
                            <span className="inline-flex items-center px-2 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-semibold border border-red-150">
                              PDF
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No verification documents uploaded</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
