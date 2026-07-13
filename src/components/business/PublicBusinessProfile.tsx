'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BusinessListing } from '@/types/business';
import {
  LucideMapPin,
  LucidePhone,
  LucideMail,
  LucideGlobe,
  LucideExternalLink,
  LucideCheckCircle,
  LucideEye,
  LucideStar,
  LucideShare2,
  LucideBookmark,
  LucideMessageSquare,
  LucideCheck,
  LucideX,
} from 'lucide-react';
import BusinessLogo from './BusinessLogo';
import { trackEvent } from '@/lib/analytics';
import { PageType } from '@/lib/analytics/types';
import { getFullDesc, getShortDesc } from '@/lib/utils';
import { getGoogleMapsEmbedSrc } from '@/lib/google-maps';
import { useAuth } from '@/lib/auth/AuthContext';
import { createSupportTicket } from '@/lib/data-connect';

interface PublicBusinessProfileProps {
  business: BusinessListing;
}

const parseGallery = (gallery: BusinessListing['gallery']): string[] => {
  if (!gallery) return [];
  if (Array.isArray(gallery)) return gallery;
  try {
    const parsed = JSON.parse(gallery);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error parsing business gallery:', error);
    return [];
  }
};

const profileVisitorStorageKey = 'localpages_profile_visitor_key';

const getOrCreateProfileVisitorKey = () => {
  try {
    const existingKey = localStorage.getItem(profileVisitorStorageKey);
    if (existingKey) return existingKey;

    const nextKey = `anonymous:${window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
    localStorage.setItem(profileVisitorStorageKey, nextKey);
    return nextKey;
  } catch (error) {
    console.warn('Unable to persist profile visitor key:', error);
    return `anonymous:${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
};

export default function PublicBusinessProfile({ business }: PublicBusinessProfileProps) {
  const { user, loading: authLoading } = useAuth();
  const galleryImages = parseGallery(business.gallery);
  const googleMapsEmbedSrc = getGoogleMapsEmbedSrc(business.googleMapsUrl);
  const shortDescription = getShortDesc(business.description);
  const fullDescription = getFullDesc(business.description);
  const categoryHref = business.categorySlug ? `/categories/${business.categorySlug}` : '/categories';
  const locationHref = business.regionSlug && business.provinceSlug && business.citySlug
    ? `/locations/${business.regionSlug}/${business.provinceSlug}/${business.citySlug}`
    : '/locations';
  const hasOnlineLinks = !!(
    business.facebookUrl ||
    business.instagramUrl ||
    business.linkedinUrl ||
    business.tiktokUrl ||
    business.shopeeUrl ||
    business.lazadaUrl
  );
  const hasProductsServices = !!(business.products || business.services);
  const showUniqueViews = false;
  const showCustomerReviews = false;

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
  const [contactSubject, setContactSubject] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSent, setContactSent] = useState(false);
  const [contactSending, setContactSending] = useState(false);
  const [contactError, setContactError] = useState('');

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);
  const [profileViewCount, setProfileViewCount] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedGalleryImage) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedGalleryImage(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedGalleryImage]);

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

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    const trackProfileView = async () => {
      try {
        const visitorKey = user?.uid ? `user:${user.uid}` : getOrCreateProfileVisitorKey();
        const response = await fetch('/api/business/profile-view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId: business.id, visitorKey }),
        });

        if (!response.ok) return;

        const data = await response.json();
        if (!cancelled && typeof data.uniqueViews === 'number') {
          setProfileViewCount(data.uniqueViews);
        }
      } catch (error) {
        console.error('Failed to track business profile view:', error);
      }
    };

    trackProfileView();

    return () => {
      cancelled = true;
    };
  }, [authLoading, business.id, user?.uid]);

  const handleWebsiteClick = () => {
    trackEvent('business_website_click', getEventParams({ link_url: business.websiteUrl }));
  };

  const handleFacebookClick = () => {
    trackEvent('business_facebook_click', getEventParams({ link_url: business.facebookUrl }));
  };

  const handleInstagramClick = () => {
    trackEvent('business_instagram_click', getEventParams({ link_url: business.instagramUrl }));
  };

  const handleSocialClick = (platform: string, linkUrl?: string) => {
    trackEvent('business_social_click', getEventParams({ social_platform: platform, link_url: linkUrl || '' }));
  };

  const handleCallClick = (num: string) => {
    trackEvent('business_call_click', getEventParams({ interaction_type: 'call', contact_number: num }));
  };

  const handleEmailClick = () => {
    trackEvent('business_email_click', getEventParams({ interaction_type: 'email', link_url: `mailto:${business.contactEmail}` }));
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

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !contactSubject.trim() || !contactNumber.trim() || !contactMsg.trim()) return;

    const senderName = user.displayName || user.email || 'Registered user';
    const senderEmail = user.email || '';
    const ownerId = business.ownerId;

    if (!ownerId) {
      setContactError('This business is not ready to receive inquiries yet.');
      return;
    }

    setContactSending(true);
    setContactError('');

    try {
      await createSupportTicket({
        userId: user.uid,
        category: 'BUSINESS_INQUIRY',
        subject: contactSubject.trim(),
        message: `LOCALPAGES_BUSINESS_INQUIRY::${JSON.stringify({
          businessId: business.id,
          businessName: business.name,
          businessSlug: business.slug,
          ownerId,
          senderName,
          senderEmail,
          subject: contactSubject.trim(),
          senderContactNumber: contactNumber.trim(),
          message: contactMsg.trim(),
        })}`,
      });

      setContactSent(true);
      trackEvent('contact_business', getEventParams({
        interaction_type: 'platform_inquiry',
        sender_name: senderName,
        sender_email: senderEmail,
      }));
      setContactSubject('');
      setContactNumber('');
      setContactMsg('');
    } catch (error: any) {
      setContactError(error?.message || 'Failed to send inquiry. Please try again.');
    } finally {
      setContactSending(false);
    }
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

  return (
    <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Unified Business Header / Hero Section */}
      <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-4 sm:mb-8">
        {/* Cover Photo */}
        <div className="relative h-40 sm:h-64 md:h-72 w-full overflow-hidden bg-slate-100">
          {business.coverUrl ? (
            <img
              src={business.coverUrl}
              alt={`${business.name} Cover`}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <span className="text-slate-400 font-medium text-sm">Cover Image Placeholder</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Header Info Section */}
        <div className="relative px-4 sm:px-10 pb-5 sm:pb-8 pt-24 sm:pt-24 flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
          {/* Logo - Overlapping the cover photo */}
          <div className="absolute -top-14 sm:-top-20 left-4 sm:left-10">
            <div className="p-1.5 bg-white rounded-2xl shadow-xl border border-slate-100">
              <BusinessLogo 
                url={business.logoUrl} 
                name={business.name} 
                size="lg"
              />
            </div>
          </div>

          {/* Primary Identity Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="max-w-full break-words text-2xl sm:text-4xl font-sans font-bold text-slate-900 tracking-tight">
                {business.name}
              </h1>
              <div className="flex gap-2">
                {business.isVerified && (
                  <span title="Verified Listing" className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100">
                    <LucideCheckCircle className="w-3.5 h-3.5" />
                    Verified
                  </span>
                )}
                {business.isFeatured && (
                  <span title="Featured Listing" className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-yellow-50 text-yellow-600 rounded-full text-xs font-bold border border-yellow-100">
                    <LucideStar className="w-3.5 h-3.5 fill-current" />
                    Featured
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-1.5 sm:gap-y-2 text-sm text-slate-500">
              <Link href={categoryHref} className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                {business.categoryName || 'General Business'}
              </Link>
              {business.subcategoryName && business.subcategoryName !== 'Not assigned' && (
                <p className="font-semibold text-slate-600">{business.subcategoryName}</p>
              )}
              <Link href={locationHref} className="flex items-center gap-1.5 hover:text-slate-700 hover:underline">
                <LucideMapPin className="w-4 h-4 text-slate-400" />
                <span>{[business.cityName, business.provinceName].filter(Boolean).join(', ')}</span>
              </Link>
              {showUniqueViews && (
                <div className="flex items-center gap-1.5 text-blue-600 font-bold">
                  <LucideEye className="w-4 h-4" />
                  <span>{profileViewCount === null ? '...' : profileViewCount.toLocaleString()}</span>
                  <span className="text-slate-400 font-normal text-xs ml-1">Unique Views</span>
                </div>
              )}
            </div>

            {shortDescription && (
              <p className="mt-3 sm:mt-4 max-w-3xl text-sm sm:text-base leading-6 sm:leading-7 text-slate-600">
                {shortDescription}
              </p>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex w-full flex-col items-stretch gap-2.5 sm:gap-3 md:w-auto md:items-end">
            <div className="flex flex-wrap gap-2 sm:gap-3 md:justify-end">
              <button
                onClick={handleBookmarkClick}
                className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  bookmarked
                    ? 'bg-yellow-50 text-yellow-600 border border-yellow-200'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 active:scale-95'
                }`}
              >
                <LucideBookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
                <span>{bookmarked ? 'Saved' : 'Save'}</span>
              </button>
              <button
                onClick={handleShareClick}
                className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 active:scale-95 transition-all duration-200"
              >
                <LucideShare2 className="w-4 h-4 text-slate-400" />
                <span>{shareCopied ? 'Copied' : 'Share'}</span>
              </button>
              {business.websiteUrl && (
                <a
                  href={business.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleWebsiteClick}
                  className="flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-200 transition-all duration-200"
                >
                  <LucideGlobe className="w-4 h-4" />
                  <span>Visit Website</span>
                </a>
              )}
            </div>

            {hasOnlineLinks && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50/80 p-1.5 sm:p-2 md:max-w-md md:justify-end">
                {business.facebookUrl && (
                  <a href={business.facebookUrl} target="_blank" rel="noopener noreferrer" onClick={handleFacebookClick} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-bold text-[#1877F2] ring-1 ring-slate-200 transition hover:bg-blue-50">
                    <LucideExternalLink className="w-3.5 h-3.5" /> Facebook
                  </a>
                )}
                {business.instagramUrl && (
                  <a href={business.instagramUrl} target="_blank" rel="noopener noreferrer" onClick={handleInstagramClick} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-bold text-pink-600 ring-1 ring-slate-200 transition hover:bg-pink-50">
                    <LucideExternalLink className="w-3.5 h-3.5" /> Instagram
                  </a>
                )}
                {business.linkedinUrl && (
                  <a href={business.linkedinUrl} target="_blank" rel="noopener noreferrer" onClick={() => handleSocialClick('linkedin', business.linkedinUrl)} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-bold text-sky-700 ring-1 ring-slate-200 transition hover:bg-sky-50">
                    <LucideExternalLink className="w-3.5 h-3.5" /> LinkedIn
                  </a>
                )}
                {business.tiktokUrl && (
                  <a href={business.tiktokUrl} target="_blank" rel="noopener noreferrer" onClick={() => handleSocialClick('tiktok', business.tiktokUrl)} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-950 ring-1 ring-slate-200 transition hover:bg-slate-100">
                    <LucideExternalLink className="w-3.5 h-3.5" /> TikTok
                  </a>
                )}
                {business.shopeeUrl && (
                  <a href={business.shopeeUrl} target="_blank" rel="noopener noreferrer" onClick={() => handleSocialClick('shopee', business.shopeeUrl)} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-bold text-[#EE4D2D] ring-1 ring-slate-200 transition hover:bg-orange-50">
                    <LucideExternalLink className="w-3.5 h-3.5" /> Shopee
                  </a>
                )}
                {business.lazadaUrl && (
                  <a href={business.lazadaUrl} target="_blank" rel="noopener noreferrer" onClick={() => handleSocialClick('lazada', business.lazadaUrl)} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-bold text-violet-700 ring-1 ring-slate-200 transition hover:bg-violet-50">
                    <LucideExternalLink className="w-3.5 h-3.5" /> Lazada
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12 lg:gap-8">
        {/* Left Column: Detailed Information */}
        <div className="contents lg:block lg:col-span-8 lg:space-y-10">
          {/* About Section */}
          <section className="order-2 bg-white p-5 sm:p-10 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6 font-sans">About {business.name}</h2>
            <div className="prose prose-slate max-w-3xl">
              <p className="text-slate-600 leading-relaxed text-base sm:text-lg whitespace-pre-wrap">
                {fullDescription || shortDescription || "This business has not provided a description yet."}
              </p>
            </div>
          </section>

          {/* Products & Services Section */}
          {hasProductsServices && (
            <section className="order-3 bg-white p-5 sm:p-10 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-8 font-sans">Products & Services</h2>
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                {business.products && (
                  <div className="rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:p-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Products</h3>
                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{business.products}</p>
                  </div>
                )}

                {business.services && (
                  <div className="rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:p-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Services</h3>
                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{business.services}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Gallery Grid */}
          {galleryImages.length > 0 && (
            <section className="order-5 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-sans">Gallery</h2>
                <span className="text-slate-400 text-sm font-medium">{galleryImages.length} Photos</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={imgUrl}
                    type="button"
                    onClick={() => setSelectedGalleryImage(imgUrl)}
                    className="group relative aspect-[4/3] overflow-hidden rounded-lg sm:rounded-xl border border-slate-200 bg-slate-50 text-left focus:outline-none focus:ring-4 focus:ring-blue-100"
                    aria-label={`Open gallery image ${idx + 1}`}
                  >
                    <img 
                      src={imgUrl} 
                      alt={`${business.name} Gallery ${idx + 1}`} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Reviews Section */}
          {showCustomerReviews && (
            <section className="order-7 bg-white p-5 sm:p-10 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="text-xl sm:text-2xl font-sans font-bold text-slate-900 mb-5 sm:mb-8 flex items-center gap-3">
                <LucideMessageSquare className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
                <span>Customer Reviews</span>
              </h2>

              {reviewSubmitted ? (
                <div className="bg-emerald-50 border border-emerald-100 p-5 sm:p-8 rounded-xl sm:rounded-2xl flex items-start gap-4 sm:gap-5">
                  <div className="shrink-0 p-3 bg-emerald-100 rounded-2xl text-emerald-600">
                    <LucideCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-emerald-900 font-bold text-lg">Review Submitted</h4>
                    <p className="text-emerald-700 mt-2 leading-relaxed">Thank you for sharing your experience! Your feedback helps others make better decisions.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 sm:space-y-8">
                  <form onSubmit={handleReviewSubmit} className="bg-slate-50/50 border border-slate-100 rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-5 sm:space-y-6">
                    <h3 className="font-bold text-lg text-slate-900">Write a Review</h3>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <span className="text-sm font-bold text-slate-500">How would you rate your experience?</span>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="focus:outline-none transition-transform hover:scale-125"
                          >
                            <LucideStar className={`w-8 h-8 ${star <= reviewRating ? 'text-yellow-400 fill-current' : 'text-slate-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="review_comment" className="block text-sm font-bold text-slate-700 mb-2">
                        Your Feedback
                      </label>
                      <textarea
                        id="review_comment"
                        rows={4}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Tell us what you liked (or didn't like)..."
                        required
                        className="block w-full rounded-2xl border border-slate-200 p-4 text-base focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                    >
                      Submit Review
                    </button>
                  </form>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Right Column: Sidebar Information */}
        <div className="contents lg:block lg:col-span-4 lg:space-y-8">
          {/* Contact and Business Details Sidebar */}
          <div className="order-1 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            {/* Header for sidebar */}
            <div className="px-5 sm:px-8 py-4 sm:py-6 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-lg">Business Information</h3>
            </div>

            {/* Contact Details List */}
            <div className="p-5 sm:p-8 space-y-5 sm:space-y-8">
              <div className="space-y-5 sm:space-y-6">
                {(business.contactMobile || business.contactPhone) && (
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                      <LucidePhone className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phone & Mobile</p>
                      <div className="flex flex-col gap-1">
                        {business.contactMobile && (
                          <a href={`tel:${business.contactMobile}`} onClick={() => handleCallClick(business.contactMobile || '')} className="text-slate-900 hover:text-blue-600 font-bold text-base transition-colors">
                            {business.contactMobile}
                          </a>
                        )}
                        {business.contactPhone && (
                          <a href={`tel:${business.contactPhone}`} onClick={() => handleCallClick(business.contactPhone || '')} className="text-slate-900 hover:text-blue-600 font-bold text-base transition-colors">
                            {business.contactPhone}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {business.contactEmail && (
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                      <LucideMail className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
                      <a href={`mailto:${business.contactEmail}`} onClick={handleEmailClick} className="text-slate-900 hover:text-blue-600 font-bold text-base block break-all transition-colors">
                        {business.contactEmail}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="shrink-0 p-2.5 bg-slate-100 text-slate-500 rounded-xl">
                    <LucideMapPin className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Location</p>
                    <p className="text-slate-900 font-medium leading-relaxed">
                      {[business.addressLine1, business.cityName, business.provinceName, business.regionName].filter(Boolean).join(', ') || 'Address not listed'}
                    </p>
                  </div>
                </div>
              </div>

              {business.businessHours && (
                <div className="pt-5 sm:pt-8 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 sm:mb-4">Opening Hours</h4>
                  <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100">
                    {business.businessHours}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Google Map Embed */}
          {googleMapsEmbedSrc && (
            <div className="order-4 rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-white">
              <iframe
                src={googleMapsEmbedSrc}
                title={`${business.name} map`}
                className="h-60 sm:h-72 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          )}

          {/* Interactive Inquiry Form */}
          <div className="order-6 bg-[#0C0C1C] rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white shadow-xl">
            <h3 className="text-xl font-bold mb-2">Send an Inquiry</h3>
            <p className="text-slate-400 text-sm mb-5 sm:mb-6">
              Need more info? Registered users can send a direct message to this business owner.
            </p>
            
            {!user ? (
              <div className="rounded-xl border border-white/15 bg-white/5 p-4 sm:rounded-2xl sm:p-6">
                <div className="mb-5 flex items-start gap-3">
                  <div className="shrink-0 rounded-xl bg-blue-500/15 p-2 text-blue-200">
                    <LucideMessageSquare className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-bold leading-6 text-white">Create an account to inquire</p>
                    <p className="mt-1 text-sm leading-6 text-slate-300">
                      Sign in or register to message {business.name} directly through LocalPages.ph.
                    </p>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Link
                    href="/auth/register"
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold leading-5 text-white shadow-lg transition hover:bg-blue-500"
                  >
                    Register to Message
                  </Link>
                  <Link
                    href="/auth/login"
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-white/10"
                  >
                    Log In
                  </Link>
                </div>
              </div>
            ) : contactSent ? (
              <div className="bg-white/10 border border-white/20 p-5 sm:p-6 rounded-xl sm:rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <LucideCheck className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-emerald-400">Message Sent!</span>
                </div>
                <p className="text-slate-300 text-xs">The owner has received your inquiry in their LocalPages.ph business inbox.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3.5 sm:space-y-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sending as</p>
                  <p className="mt-1 font-semibold text-white">{user.displayName || user.email || 'Registered user'}</p>
                  {user.email && <p className="text-xs text-slate-400">{user.email}</p>}
                </div>
                <input
                  type="text"
                  placeholder="Subject"
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-500"
                />
                <input
                  type="tel"
                  placeholder="Contact number"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-500"
                />
                <textarea
                  placeholder="What's your inquiry?"
                  rows={4}
                  value={contactMsg}
                  onChange={(e) => setContactMsg(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-500"
                />
                {contactError && (
                  <p className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-xs font-semibold text-red-100">
                    {contactError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={contactSending}
                  className="w-full py-3.5 sm:py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {contactSending ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {selectedGalleryImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedGalleryImage(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedGalleryImage(null)}
            className="absolute right-4 top-4 rounded-full bg-white/95 p-2 text-slate-900 shadow-lg transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-white/40"
            aria-label="Close gallery image"
          >
            <LucideX className="h-5 w-5" />
          </button>
          <img
            src={selectedGalleryImage}
            alt={`${business.name} gallery image preview`}
            className="max-h-[86vh] max-w-[94vw] rounded-2xl object-contain shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
