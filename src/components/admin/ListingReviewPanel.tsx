import React from 'react';
import { BusinessListing } from '@/types/business';
import BusinessStatusBadge from '../business/BusinessStatusBadge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { getShortDesc, getFullDesc } from '@/lib/utils';
import { getGoogleMapsEmbedSrc, getGoogleMapsLink } from '@/lib/google-maps';

interface ListingReviewPanelProps {
  business: BusinessListing;
}

type VerificationDocument = {
  id?: string;
  url?: string;
  name?: string;
  path?: string;
};

const parseGallery = (gallery: BusinessListing['gallery']): string[] => {
  if (!gallery) return [];
  if (Array.isArray(gallery)) return gallery;
  try {
    const parsed = JSON.parse(gallery);
    return Array.isArray(parsed) ? parsed.filter((url): url is string => typeof url === 'string' && !!url) : [];
  } catch (error) {
    console.error('Error parsing review gallery:', error);
    return [];
  }
};

const parseDocuments = (documents: BusinessListing['documents']): VerificationDocument[] => {
  if (!documents) return [];
  if (Array.isArray(documents)) return documents;
  try {
    const parsed = JSON.parse(documents);
    return Array.isArray(parsed) ? parsed.filter((doc): doc is VerificationDocument => !!doc && typeof doc === 'object') : [];
  } catch (error) {
    console.error('Error parsing review documents:', error);
    return [];
  }
};

const displayValue = (value?: string | null) => value?.trim() || 'None provided';

export default function ListingReviewPanel({ business }: ListingReviewPanelProps) {
  const galleryImages = parseGallery(business.gallery);
  const documents = parseDocuments(business.documents);
  const googleMapsEmbedSrc = getGoogleMapsEmbedSrc(business.googleMapsUrl);
  const googleMapsLink = getGoogleMapsLink(business.googleMapsUrl);

  const contactLinks = [
    { label: 'Website', value: business.websiteUrl },
    { label: 'Facebook', value: business.facebookUrl },
    { label: 'Instagram', value: business.instagramUrl },
    { label: 'LinkedIn', value: business.linkedinUrl },
    { label: 'TikTok', value: business.tiktokUrl },
    { label: 'Shopee', value: business.shopeeUrl },
    { label: 'Lazada', value: business.lazadaUrl },
  ].flatMap((link) => link.value ? [{ label: link.label, value: link.value }] : []);

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
                  <dd className="text-sm text-slate-900">{displayValue(business.addressLine1)}</dd>
                  <dd className="text-sm text-slate-900">{business.cityName}, {business.provinceName}, {business.regionName}</dd>
                  <dd className="text-sm text-slate-900">ZIP Code: {displayValue(business.zipCode)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Contact Numbers</dt>
                  <dd className="text-sm text-slate-900">Mobile: {displayValue(business.contactMobile)}</dd>
                  <dd className="text-sm text-slate-900">Phone: {displayValue(business.contactPhone)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Email</dt>
                  <dd className="text-sm text-blue-600 break-all">{displayValue(business.contactEmail)}</dd>
                </div>
                {contactLinks.length > 0 && (
                  <div>
                    <dt className="text-sm text-slate-500">Online Links</dt>
                    <dd className="mt-1 space-y-1">
                      {contactLinks.map((link) => (
                        <a
                          key={link.label}
                          href={link.value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-blue-600 break-all hover:underline"
                        >
                          {link.label}: {link.value}
                        </a>
                      ))}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm text-slate-500">Google Maps</dt>
                  {googleMapsEmbedSrc ? (
                    <dd className="mt-2 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                      <iframe
                        src={googleMapsEmbedSrc}
                        title={`${business.name} map`}
                        className="h-56 w-full border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        allowFullScreen
                      />
                    </dd>
                  ) : googleMapsLink ? (
                    <dd className="mt-1">
                      <a
                        href={googleMapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 break-all hover:underline"
                      >
                        {googleMapsLink}
                      </a>
                    </dd>
                  ) : (
                    <dd className="text-sm text-slate-900 whitespace-pre-wrap break-words">{displayValue(business.googleMapsUrl)}</dd>
                  )}
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Owner</dt>
                  <dd className="text-sm text-slate-900">{displayValue(business.ownerName)}</dd>
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
            <h3 className="font-semibold text-lg mb-4">Business Details</h3>
            <dl className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <dt className="text-sm text-slate-500">Business Hours</dt>
                <dd className="text-sm mt-1 text-slate-900 whitespace-pre-wrap">{displayValue(business.businessHours)}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Products</dt>
                <dd className="text-sm mt-1 text-slate-900 whitespace-pre-wrap">{displayValue(business.products)}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Services</dt>
                <dd className="text-sm mt-1 text-slate-900 whitespace-pre-wrap">{displayValue(business.services)}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6 space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-4">Uploaded Media</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-xs font-medium text-slate-500 uppercase mb-2">Business Logo</h4>
                  <div className="h-32 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-200 overflow-hidden relative">
                    {business.logoUrl ? (
                      <img src={business.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
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
            {galleryImages.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-slate-500 uppercase mb-2">Gallery Images</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {galleryImages.map((imgUrl, idx) => (
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
              {documents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {documents.map((doc, idx) => {
                    const isPdf = doc.url?.toLowerCase().includes('.pdf') || doc.name?.toLowerCase().includes('.pdf');
                    return (
                      <div key={doc.id || idx} className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
                        <div>
                          <p className="font-semibold text-slate-800 text-sm truncate">{doc.name || `Document ${idx + 1}`}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-1">ID: {doc.id || 'None provided'}</p>
                        </div>
                        <div className="mt-4 flex gap-2">
                          {doc.url && (
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center px-3 py-1.5 bg-[#2563EB] text-white hover:bg-blue-600 rounded-lg text-xs font-medium transition-colors"
                            >
                              View Document
                            </a>
                          )}
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
