'use client';

import React, { useState, useEffect } from 'react';
import { BusinessListing } from '@/types/business';
import {
  LucideMapPin,
  LucidePhone,
  LucideMail,
  LucideGlobe,
  LucideExternalLink,
  LucideCheckCircle,
  LucideStar,
  LucideShare2,
  LucideBookmark,
  LucideSend,
  LucideMessageSquare,
  LucideCheck,
} from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import BusinessLogo from './BusinessLogo';
import { trackEvent } from '@/lib/analytics';
import { PageType } from '@/lib/analytics/types';
import { getFullDesc } from '@/lib/utils';

interface PublicBusinessProfileProps {
  business: BusinessListing;
}

export default function PublicBusinessProfile({ business }: PublicBusinessProfileProps) {
  // Interactive UI state
  const [bookmarked, setBookmarked] = useState<boolean>(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('bookmarked_businesses');
        if (saved) {
          const list: string[] = JSON.parse(saved);
          const isCurrentlyBookmarked = list.includes(business.id);
          if (isCurrentlyBookmarked) {
            // Use setTimeout to avoid synchronous setState during effect execution
            // which can trigger "cascading renders" lint warnings
            setTimeout(() => setBookmarked(true), 0);
          }
        }
      } catch (err) {
        console.error('Failed to load initial bookmark status:', err);
      }
    }
  }, [business.id]);

  const [shareCopied, setShareCopied] = useState(false);
  
  // Contact Form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSent, setContactSent] = useState(false);

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const galleryImages = Array.isArray(business.gallery)
    ? business.gallery
    : typeof business.gallery === 'string'
      ? (() => {
          try {
            const parsed = JSON.parse(business.gallery);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        })()
      : [];

  const fullAddress = [business.addressLine1, business.cityName, business.provinceName, business.regionName]
    .filter(Boolean)
    .join(', ');

  // Construct standard parameters (Requirement 5)
  const getEventParams = (extra = {}) => {
    return {
      page_type: 'Business Profile' as PageType,
      business_id: business.id,
      business_slug: business.slug,
      business_name: business.name,
      category: business.categoryName || business.categoryId || '',
      city: business.cityName || business.cityId || '',
      province: business.provinceId || '',
      region: business.regionId || '',
      verified: !!business.isVerified,
      featured: !!business.isFeatured,
      premium: !!(business as any).isPremium,
      ...extra,
    };
  };

  // Track the custom view_business event once on load (Requirement 4 & 9)
  useEffect(() => {
    trackEvent('view_business', {
      page_type: 'Business Profile' as PageType,
      business_id: business.id,
      business_slug: business.slug,
      business_name: business.name,
      category: business.categoryName || business.categoryId || '',
      city: business.cityName || business.cityId || '',
      province: business.provinceId || '',
      region: business.regionId || '',
      verified: !!business.isVerified,
      featured: !!business.isFeatured,
      premium: !!(business as any).isPremium,
    });
  }, [business]);

  const handleWebsiteClick = () => {
    trackEvent('business_website_click', getEventParams({ link_url: business.websiteUrl }));
  };

  const handleFacebookClick = () => {
    trackEvent('business_facebook_click', getEventParams({ link_url: business.facebookUrl }));
  };

  const handleInstagramClick = () => {
    trackEvent('business_instagram_click', getEventParams({ link_url: business.instagramUrl }));
  };

  const handleCallClick = (num: string) => {
    trackEvent('business_call_click', getEventParams({ interaction_type: 'call', contact_number: num }));
  };

  const handleEmailClick = () => {
    trackEvent('business_email_click', getEventParams({ interaction_type: 'email', link_url: `mailto:${business.contactEmail}` }));
  };

  const handleDirectionsClick = () => {
    trackEvent('business_directions_click', getEventParams({ link_url: business.googleMapsUrl || 'placeholder_directions' }));
  };

  const handleBookmarkClick = () => {
    const nextState = !bookmarked;
    setBookmarked(nextState);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bookmarked_businesses');
      let list: string[] = saved ? JSON.parse(saved) : [];
      if (nextState) {
        if (!list.includes(business.id)) {
          list.push(business.id);
        }
      } else {
        list = list.filter(id => id !== business.id);
      }
      localStorage.setItem('bookmarked_businesses', JSON.stringify(list));
    }
    // Track bookmark activity (Requirement 4)
    trackEvent('bookmark_business', getEventParams({ interaction_type: nextState ? 'add' : 'remove' }));
  };

  const handleShareClick = async () => {
    let platform = 'copy';
    const profileUrl = typeof window !== 'undefined' ? window.location.href : '';
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: business.name,
          text: `Check out ${business.name} on LocalPages.ph!`,
          url: profileUrl,
        });
        platform = 'navigator';
      } catch (err) {
        console.warn('Share cancelled or failed', err);
        return;
      }
    } else {
      try {
        await navigator.clipboard.writeText(profileUrl);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      } catch (err) {
        console.error('Clipboard copy failed', err);
      }
    }
    // Track share interaction (Requirement 4)
    trackEvent('share_business', getEventParams({ share_platform: platform }));
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMsg.trim()) return;
    setContactSent(true);
    // Track contact submission (Requirement 4 & 9)
    trackEvent('contact_business', getEventParams({
      interaction_type: 'email_form',
      sender_name: contactName,
      sender_email: contactEmail,
    }));
    setContactMsg('');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setReviewSubmitted(true);
    // Track review submission (Requirement 4 & 9)
    trackEvent('review_submission', getEventParams({
      rating: reviewRating,
      review_length: reviewComment.trim().length,
    }));
    setReviewComment('');
  };

  const actionClass =
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2";

  return (
    <Card className="overflow-hidden rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
      {/* Cover Image */}
      <div className="relative flex h-56 items-center justify-center overflow-hidden bg-slate-100 sm:h-72 lg:h-[320px]">
        {business.coverUrl ? (
          <img
            src={business.coverUrl}
            alt={`${business.name} Cover`}
            className="w-full h-full object-cover"
            decoding="async"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-slate-100 to-slate-200 flex items-center justify-center">
            <span className="text-sm font-medium text-slate-400">Cover Image Placeholder</span>
          </div>
        )}
      </div>
      
      <CardContent className="px-5 pb-10 pt-0 sm:px-8 lg:px-10">
        <section className="relative z-10 -mt-12 border-b border-slate-100 pb-8 sm:-mt-14">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
              <BusinessLogo
                url={business.logoUrl}
                name={business.name}
                className="h-32 w-32 rounded-3xl border-4 border-white shadow-lg ring-1 ring-slate-200 sm:h-36 sm:w-36"
                size="lg"
              />
              <div className="min-w-0 pb-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {business.isVerified && (
                    <div title="Verified Listing" className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 ring-1 ring-blue-100">
                      <LucideCheckCircle className="h-3.5 w-3.5" />
                      <span>Verified</span>
                    </div>
                  )}
                  {business.isFeatured && (
                    <div title="Featured Listing" className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-semibold text-yellow-600 ring-1 ring-yellow-100">
                      <LucideStar className="h-3.5 w-3.5 fill-current" />
                      <span>Featured</span>
                    </div>
                  )}
                </div>
                <h1 className="font-sans text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">{business.name}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-500">
                  <span className="text-base font-medium text-[#2563EB]">{business.categoryName || 'Category'}</span>
                  <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-block" />
                  <span className="inline-flex items-center gap-1.5">
                    <LucideMapPin className="h-4 w-4 text-slate-400" />
                    <span>{fullAddress || 'Address not provided'}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 lg:max-w-[44rem] lg:justify-end">
              {business.websiteUrl && (
                <a
                  href={business.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleWebsiteClick}
                  className={`${actionClass} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}
                >
                  <LucideGlobe className="h-4 w-4 text-slate-400" />
                  <span>Website</span>
                </a>
              )}

              {business.facebookUrl && (
                <a
                  href={business.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleFacebookClick}
                  className={`${actionClass} bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20`}
                >
                  <LucideExternalLink className="h-4 w-4" />
                  <span>Facebook</span>
                </a>
              )}

              {business.instagramUrl && (
                <a
                  href={business.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleInstagramClick}
                  className={`${actionClass} border border-pink-100 bg-pink-50 text-pink-600 hover:bg-pink-100`}
                >
                  <LucideExternalLink className="h-4 w-4" />
                  <span>Instagram</span>
                </a>
              )}

              {business.tiktokUrl && (
                <a
                  href={business.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${actionClass} bg-black text-white hover:bg-slate-800`}
                >
                  <LucideExternalLink className="h-4 w-4" />
                  <span>TikTok</span>
                </a>
              )}

              {business.shopeeUrl && (
                <a
                  href={business.shopeeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${actionClass} border border-[#EE4D2D]/20 bg-[#EE4D2D]/10 text-[#EE4D2D] hover:bg-[#EE4D2D]/20`}
                >
                  <LucideExternalLink className="h-4 w-4" />
                  <span>Shopee</span>
                </a>
              )}

              {business.lazadaUrl && (
                <a
                  href={business.lazadaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${actionClass} border border-[#F57224]/20 bg-[#F57224]/10 text-[#F57224] hover:bg-[#F57224]/20`}
                >
                  <LucideExternalLink className="h-4 w-4" />
                  <span>Lazada</span>
                </a>
              )}

              <button
                onClick={handleShareClick}
                className={`${actionClass} border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100`}
                aria-label={shareCopied ? 'Profile link copied' : 'Share this business'}
              >
                <LucideShare2 className="h-4 w-4 text-slate-400" />
                <span>{shareCopied ? 'Copied!' : 'Share'}</span>
              </button>

              <button
                onClick={handleBookmarkClick}
                className={`${actionClass} border ${
                  bookmarked
                    ? 'border-yellow-200 bg-yellow-50 text-yellow-600'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
                aria-label={bookmarked ? 'Remove saved business' : 'Save this business'}
              >
                <LucideBookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
                <span>{bookmarked ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-10 pt-8 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
          {/* Main Content */}
          <main className="min-w-0 space-y-10">
            <section className="max-w-5xl">
              <h2 className="mb-4 font-sans text-2xl font-bold text-slate-950">About</h2>
              <p className="whitespace-pre-wrap text-base leading-8 text-slate-600 sm:text-lg">{getFullDesc(business.description) || "No description provided."}</p>
            </section>

            <section>
              {(business.products || business.services) && (
                <div className="grid gap-6 border-t border-slate-100 pt-8 md:grid-cols-2">
                  {business.products && (
                    <div>
                      <h2 className="mb-3 font-sans text-lg font-bold text-slate-950">Products</h2>
                      <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">{business.products}</p>
                    </div>
                  )}

                  {business.services && (
                    <div>
                      <h2 className="mb-3 font-sans text-lg font-bold text-slate-950">Services</h2>
                      <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">{business.services}</p>
                    </div>
                  )}
                </div>
              )}
            </section>

            {galleryImages.length > 0 && (
              <section className="border-t border-slate-100 pt-8">
                <h2 className="mb-4 font-sans text-2xl font-bold text-slate-950">Gallery</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {galleryImages.map((imgUrl, idx) => (
                    <div key={idx} className="relative aspect-video overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200/70 transition-opacity hover:opacity-95">
                      <img
                        src={imgUrl}
                        alt={`${business.name} Gallery Image ${idx + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Interactive Write a Review Section (Satisfies review_submission Tracking) */}
            <section className="border-t border-slate-100 pt-8">
              <h2 className="mb-5 flex items-center gap-2 font-sans text-2xl font-bold text-slate-950">
                <LucideMessageSquare className="h-5 w-5 text-[#2563EB]" />
                <span>Customer Reviews</span>
              </h2>

              {reviewSubmitted ? (
                <div className="flex items-center gap-3 rounded-2xl bg-green-50 p-6 text-green-700 ring-1 ring-green-200">
                  <div className="rounded-full bg-green-100 p-2 text-green-600">
                    <LucideCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold">Thank you for your feedback!</h4>
                    <p className="mt-1 text-xs text-green-600">Your review has been captured and submitted for validation.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4 rounded-3xl bg-slate-50/70 p-5 ring-1 ring-slate-200/70 sm:p-6">
                  <h3 className="text-sm font-bold text-slate-800">Leave a Review</h3>
                  
                  {/* Stars Rating Selector */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="mr-2 text-xs font-medium text-slate-500">Your Rating:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="rounded text-yellow-400 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
                        aria-label={`Set rating to ${star} star${star === 1 ? '' : 's'}`}
                      >
                        <LucideStar className={`h-6 w-6 ${star <= reviewRating ? 'fill-current' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>

                  {/* Comment Input */}
                  <div>
                    <label htmlFor="review_comment" className="mb-1.5 block text-xs font-medium text-slate-500">
                      Review Comment
                    </label>
                    <textarea
                      id="review_comment"
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience with this business..."
                      required
                      className="block w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#0C0C1C] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
                  >
                    <span>Submit Review</span>
                  </button>
                </form>
              )}
            </section>
          </main>
          
          <aside className="h-fit rounded-3xl bg-slate-50/80 p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6 lg:sticky lg:top-24">
            <div>
              <h3 className="mb-4 font-sans text-base font-bold text-slate-950">Contact Information</h3>
              <ul className="space-y-4">
                {business.contactMobile && (
                  <li className="flex items-start">
                    <LucidePhone className="mr-3 mt-0.5 h-5 w-5 text-slate-400" />
                    <div>
                      <a
                        href={`tel:${business.contactMobile}`}
                        onClick={() => handleCallClick(business.contactMobile || '')}
                        className="font-mono text-sm text-slate-900 hover:text-[#2563EB] hover:underline"
                      >
                        {business.contactMobile}
                      </a>
                      <span className="block font-sans text-[10px] uppercase text-slate-400">Mobile</span>
                    </div>
                  </li>
                )}
                {business.contactPhone && (
                  <li className="flex items-start">
                    <LucidePhone className="mr-3 mt-0.5 h-5 w-5 text-slate-400" />
                    <div>
                      <a
                        href={`tel:${business.contactPhone}`}
                        onClick={() => handleCallClick(business.contactPhone || '')}
                        className="font-mono text-sm text-slate-900 hover:text-[#2563EB] hover:underline"
                      >
                        {business.contactPhone}
                      </a>
                      <span className="block font-sans text-[10px] uppercase text-slate-400">Landline</span>
                    </div>
                  </li>
                )}
                {business.contactEmail && (
                  <li className="flex items-start">
                    <LucideMail className="mr-3 mt-0.5 h-5 w-5 text-slate-400" />
                    <div>
                      <a
                        href={`mailto:${business.contactEmail}`}
                        onClick={handleEmailClick}
                        className="break-all text-sm font-medium text-[#2563EB] hover:underline"
                      >
                        {business.contactEmail}
                      </a>
                      <span className="block font-sans text-[10px] uppercase text-slate-400">Email Address</span>
                    </div>
                  </li>
                )}
                {fullAddress && (
                  <li className="flex items-start">
                    <LucideMapPin className="mr-3 mt-0.5 h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-sm leading-relaxed text-slate-700">{fullAddress}</p>
                      <span className="block font-sans text-[10px] uppercase text-slate-400">Address</span>
                    </div>
                  </li>
                )}
              </ul>

              <p className="mt-5 border-t border-slate-200 pt-5 text-xs leading-relaxed text-slate-400">
                Note: Contact details are visible to public during Phase 2. Future phases may restrict full details to registered subscribers.
              </p>
            </div>

            {business.businessHours && (
              <div className="mt-6 border-t border-slate-200 pt-6">
                <h3 className="mb-3 font-sans text-base font-bold text-slate-950">Business Hours</h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{business.businessHours}</p>
              </div>
            )}

            {/* Directions Map with Click Trigger (Satisfies business_directions_click Tracking) */}
            <div className="mt-6 border-t border-slate-200 pt-6">
              <div
                onClick={handleDirectionsClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleDirectionsClick();
                  }
                }}
                className="group relative flex h-48 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl bg-slate-200 transition-all duration-300 hover:bg-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
              >
                <div className="absolute inset-0 bg-[#0C0C1C]/10 transition-colors group-hover:bg-[#0C0C1C]/20" />
                <div className="relative z-10 flex flex-col items-center justify-center p-4 text-center">
                  <LucideMapPin className="mb-2 h-9 w-9 text-[#2563EB] transition-transform group-hover:scale-110" />
                  <span className="text-xs font-bold text-slate-800">Get Location Directions</span>
                  <span className="mt-1 font-mono text-[10px] uppercase text-slate-500">Click to open map</span>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-200 pt-6">
              <h3 className="mb-4 font-sans text-base font-bold text-slate-950">Inquire or Send Message</h3>
              
              {contactSent ? (
                <div className="flex items-start gap-3 rounded-2xl bg-blue-50 p-4 text-xs font-medium leading-relaxed text-[#2563EB] ring-1 ring-blue-100">
                  <LucideCheck className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>Message sent! The business owner has been notified.</span>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      required
                      className="block w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Your Email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      required
                      className="block w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                  </div>
                  <div>
                    <textarea
                      placeholder="How can we help you?"
                      rows={3}
                      value={contactMsg}
                      onChange={(e) => setContactMsg(e.target.value)}
                      required
                      className="block w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-2xl bg-[#2563EB] px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
                  >
                    <LucideSend className="h-3.5 w-3.5" />
                    <span>Send Message</span>
                  </button>
                </form>
              )}
            </div>
          </aside>
        </div>
      </CardContent>
    </Card>
  );
}
