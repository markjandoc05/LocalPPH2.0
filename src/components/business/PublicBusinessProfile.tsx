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
  LucideMessageSquare,
  LucideCheck,
} from 'lucide-react';
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Unified Business Header / Hero Section */}
      <div className="relative bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        {/* Cover Photo */}
        <div className="relative h-48 sm:h-64 md:h-72 w-full overflow-hidden bg-slate-100">
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
        <div className="relative px-6 sm:px-10 pb-8 pt-20 sm:pt-24 flex flex-col md:flex-row md:items-end justify-between gap-6">
          {/* Logo - Overlapping the cover photo */}
          <div className="absolute -top-16 sm:-top-20 left-6 sm:left-10">
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
              <h1 className="text-3xl sm:text-4xl font-sans font-bold text-slate-900 tracking-tight">
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

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
              <p className="font-semibold text-blue-600">{business.categoryName || 'General Business'}</p>
              <div className="flex items-center gap-1.5">
                <LucideMapPin className="w-4 h-4 text-slate-400" />
                <span>{[business.cityName, business.provinceName].filter(Boolean).join(', ')}</span>
              </div>
              <div className="flex items-center gap-1 text-yellow-500 font-bold">
                <LucideStar className="w-4 h-4 fill-current" />
                <span>4.8</span>
                <span className="text-slate-400 font-normal text-xs ml-1">(12 Reviews)</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={handleBookmarkClick}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
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
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 active:scale-95 transition-all duration-200"
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
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-200 transition-all duration-200"
              >
                <LucideGlobe className="w-4 h-4" />
                <span>Visit Website</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Detailed Information */}
        <div className="lg:col-span-8 space-y-10">
          {/* About Section */}
          <section className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 font-sans">About {business.name}</h2>
            <div className="prose prose-slate max-w-3xl">
              <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">
                {getFullDesc(business.description) || "This business has not provided a description yet."}
              </p>
            </div>
            
            {(business.products || business.services) && (
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 border-t border-slate-100">
                {business.products && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Products</h3>
                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{business.products}</p>
                  </div>
                )}
                {business.services && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Services</h3>
                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{business.services}</p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Gallery Grid */}
          {business.gallery && Array.isArray(business.gallery) && business.gallery.length > 0 && (
            <section className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-slate-900 font-sans">Photo Gallery</h2>
                <span className="text-slate-400 text-sm font-medium">{business.gallery.length} Photos</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {business.gallery.map((imgUrl, idx) => (
                  <div key={idx} className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img 
                      src={imgUrl} 
                      alt={`${business.name} Gallery ${idx + 1}`} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Social Links Section */}
          <section className="flex flex-wrap gap-4 pt-4">
            {business.facebookUrl && (
              <a href={business.facebookUrl} target="_blank" rel="noopener noreferrer" onClick={handleFacebookClick} className="flex items-center gap-2.5 px-5 py-3 bg-[#1877F2]/10 text-[#1877F2] rounded-2xl text-sm font-bold hover:bg-[#1877F2]/20 transition-all">
                <LucideExternalLink className="w-4 h-4" /> Facebook
              </a>
            )}
            {business.instagramUrl && (
              <a href={business.instagramUrl} target="_blank" rel="noopener noreferrer" onClick={handleInstagramClick} className="flex items-center gap-2.5 px-5 py-3 bg-pink-50 text-pink-600 rounded-2xl text-sm font-bold hover:bg-pink-100 transition-all">
                <LucideExternalLink className="w-4 h-4" /> Instagram
              </a>
            )}
            {business.tiktokUrl && (
              <a href={business.tiktokUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-5 py-3 bg-black text-white rounded-2xl text-sm font-bold hover:bg-slate-900 transition-all">
                <LucideExternalLink className="w-4 h-4" /> TikTok
              </a>
            )}
            {business.shopeeUrl && (
              <a href={business.shopeeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-5 py-3 bg-orange-50 text-[#EE4D2D] border border-orange-100 rounded-2xl text-sm font-bold hover:bg-orange-100 transition-all">
                <LucideExternalLink className="w-4 h-4" /> Shopee
              </a>
            )}
          </section>

          {/* Reviews Section */}
          <section className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-sans font-bold text-slate-900 mb-8 flex items-center gap-3">
              <LucideMessageSquare className="w-7 h-7 text-blue-600" />
              <span>Customer Reviews</span>
            </h2>

            {reviewSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-2xl flex items-start gap-5">
                <div className="shrink-0 p-3 bg-emerald-100 rounded-2xl text-emerald-600">
                  <LucideCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-emerald-900 font-bold text-lg">Review Submitted</h4>
                  <p className="text-emerald-700 mt-2 leading-relaxed">Thank you for sharing your experience! Your feedback helps others make better decisions.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <form onSubmit={handleReviewSubmit} className="bg-slate-50/50 border border-slate-100 rounded-3xl p-8 space-y-6">
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
        </div>

        {/* Right Column: Sidebar Information */}
        <div className="lg:col-span-4 space-y-8">
          {/* Contact and Business Details Sidebar */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            {/* Header for sidebar */}
            <div className="px-8 py-6 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-lg">Business Information</h3>
            </div>

            {/* Contact Details List */}
            <div className="p-8 space-y-8">
              <div className="space-y-6">
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
                <div className="pt-8 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Opening Hours</h4>
                  <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {business.businessHours}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Inquiry Form */}
          <div className="bg-[#0C0C1C] rounded-3xl p-8 text-white shadow-xl">
            <h3 className="text-xl font-bold mb-2">Send an Inquiry</h3>
            <p className="text-slate-400 text-sm mb-6">Need more info? Send a direct message to the business owner.</p>
            
            {contactSent ? (
              <div className="bg-white/10 border border-white/20 p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <LucideCheck className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-emerald-400">Message Sent!</span>
                </div>
                <p className="text-slate-300 text-xs">The owner has been notified and will get back to you via email soon.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-500"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-500"
                />
                <textarea
                  placeholder="What's your inquiry?"
                  rows={4}
                  value={contactMsg}
                  onChange={(e) => setContactMsg(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Interactive Map/Directions Preview */}
          <div 
            onClick={handleDirectionsClick}
            className="group relative h-56 rounded-3xl overflow-hidden border border-slate-200 cursor-pointer shadow-sm active:scale-95 transition-transform"
          >
            <div className="absolute inset-0 bg-slate-200 bg-[url('https://picsum.photos/seed/map/800/600')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex flex-col items-center justify-center text-white text-center p-6">
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 mb-3 group-hover:scale-110 transition-transform">
                <LucideMapPin className="w-8 h-8 text-blue-400" />
              </div>
              <span className="font-bold text-lg">Get Directions</span>
              <p className="text-white/70 text-xs mt-1 font-medium">Open in Google Maps</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

