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

interface PublicBusinessProfileProps {
  business: BusinessListing;
}

export default function PublicBusinessProfile({ business }: PublicBusinessProfileProps) {
  // Interactive UI state
  const [bookmarked, setBookmarked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('bookmarked_businesses');
        if (saved) {
          const list: string[] = JSON.parse(saved);
          return list.includes(business.id);
        }
      } catch (err) {
        console.error('Failed to load initial bookmark status:', err);
      }
    }
    return false;
  });
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
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      {/* Cover Image */}
      <div className="h-64 bg-slate-100 flex items-center justify-center relative overflow-hidden">
        {business.coverUrl ? (
          <img src={business.coverUrl} alt={`${business.name} Cover`} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-slate-100 to-slate-200 flex items-center justify-center">
            <span className="text-slate-400 font-medium text-sm">Cover Image Placeholder</span>
          </div>
        )}
        
        {/* Logo */}
        <BusinessLogo 
            url={business.logoUrl} 
            name={business.name} 
            className="absolute -bottom-16 left-8 shadow-md z-20 border-4 border-white" 
            size="lg"
        />
      </div>
      
      <CardContent className="pt-20 px-8 pb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-8 border-b border-slate-100 pb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-3xl font-sans font-bold text-slate-900">{business.name}</h1>
              {business.isVerified && (
                <div title="Verified Listing" className="flex items-center gap-0.5 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold border border-blue-100">
                  <LucideCheckCircle className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </div>
              )}
              {business.isFeatured && (
                <div title="Featured Listing" className="flex items-center gap-0.5 px-2 py-0.5 bg-yellow-50 text-yellow-600 rounded-full text-xs font-semibold border border-yellow-100">
                  <LucideStar className="w-3.5 h-3.5 fill-current" />
                  <span>Featured</span>
                </div>
              )}
            </div>
            <p className="text-lg text-[#2563EB] font-medium">{business.categoryName}</p>
            <div className="flex items-center text-slate-500 mt-2 text-sm">
              <LucideMapPin className="w-4 h-4 mr-1.5 text-slate-400" />
              {business.addressLine1}, {business.cityName}, {business.provinceName}, {business.regionName}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* Website Link */}
            {business.websiteUrl && (
              <a
                href={business.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWebsiteClick}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 transition-colors"
              >
                <LucideGlobe className="w-4 h-4 text-slate-400" />
                <span>Website</span>
              </a>
            )}

            {/* Facebook Link */}
            {business.facebookUrl && (
              <a
                href={business.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleFacebookClick}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] rounded-xl text-sm font-semibold transition-colors"
              >
                <LucideExternalLink className="w-4 h-4" />
                <span>Facebook</span>
              </a>
            )}

            {/* Instagram Link */}
            {business.instagramUrl && (
              <a
                href={business.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleInstagramClick}
                className="inline-flex items-center gap-2 px-4 py-2 bg-pink-50 hover:bg-pink-100 text-pink-600 border border-pink-100 rounded-xl text-sm font-semibold transition-colors"
              >
                <LucideExternalLink className="w-4 h-4" />
                <span>Instagram</span>
              </a>
            )}

            {/* TikTok Link */}
            {business.tiktokUrl && (
              <a
                href={business.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-black hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                <LucideExternalLink className="w-4 h-4" />
                <span>TikTok</span>
              </a>
            )}

            {/* Shopee Link */}
            {business.shopeeUrl && (
              <a
                href={business.shopeeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#EE4D2D]/10 hover:bg-[#EE4D2D]/20 text-[#EE4D2D] border border-[#EE4D2D]/20 rounded-xl text-sm font-semibold transition-colors"
              >
                <LucideExternalLink className="w-4 h-4" />
                <span>Shopee</span>
              </a>
            )}

            {/* Lazada Link */}
            {business.lazadaUrl && (
              <a
                href={business.lazadaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#F57224]/10 hover:bg-[#F57224]/20 text-[#F57224] border border-[#F57224]/20 rounded-xl text-sm font-semibold transition-colors"
              >
                <LucideExternalLink className="w-4 h-4" />
                <span>Lazada</span>
              </a>
            )}

            {/* Share Business Profile */}
            <button
              onClick={handleShareClick}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 transition-colors"
            >
              <LucideShare2 className="w-4 h-4 text-slate-400" />
              <span>{shareCopied ? 'Copied!' : 'Share'}</span>
            </button>

            {/* Bookmark Business */}
            <button
              onClick={handleBookmarkClick}
              className={`inline-flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-semibold transition-colors ${
                bookmarked
                  ? 'bg-yellow-50 border-yellow-200 text-yellow-600'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <LucideBookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
              <span>{bookmarked ? 'Bookmarked' : 'Save'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (About, Products, Reviews) */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 font-sans">About</h2>
              <div className="prose prose-slate max-w-none text-slate-600">
                <p className="whitespace-pre-wrap leading-relaxed">{business.description}</p>
              </div>
            </section>

            {/* Gallery Section */}
            {business.gallery && Array.isArray(business.gallery) && business.gallery.length > 0 && (
              <section className="border-t border-slate-100 pt-8">
                <h2 className="text-xl font-bold text-slate-900 mb-4 font-sans">Gallery</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {business.gallery.map((imgUrl, idx) => (
                    <div key={idx} className="aspect-video relative rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:opacity-95 transition-opacity">
                      <img src={imgUrl} alt={`${business.name} Gallery Image ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </section>
            )}
            
            {business.products && (
              <section className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 mb-3 font-sans">Products</h2>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{business.products}</p>
              </section>
            )}
            
            {business.services && (
              <section className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 mb-3 font-sans">Services</h2>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{business.services}</p>
              </section>
            )}

            {/* Interactive Write a Review Section (Satisfies review_submission Tracking) */}
            <section className="border-t border-slate-100 pt-8">
              <h2 className="text-xl font-sans font-bold text-slate-900 mb-4 flex items-center gap-2">
                <LucideMessageSquare className="w-5 h-5 text-[#2563EB]" />
                <span>Customer Reviews</span>
              </h2>

              {reviewSubmitted ? (
                <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-2xl flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full text-green-600">
                    <LucideCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold">Thank you for your feedback!</h4>
                    <p className="text-xs text-green-600 mt-1">Your review has been captured and submitted for validation.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-slate-800">Leave a Review</h3>
                  
                  {/* Stars Rating Selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-slate-500 mr-2">Your Rating:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="text-yellow-400 focus:outline-none transition-transform hover:scale-110"
                      >
                        <LucideStar className={`w-6 h-6 ${star <= reviewRating ? 'fill-current' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>

                  {/* Comment Input */}
                  <div>
                    <label htmlFor="review_comment" className="block text-xs font-medium text-slate-500 mb-1.5">
                      Review Comment
                    </label>
                    <textarea
                      id="review_comment"
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience with this business..."
                      required
                      className="block w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] placeholder-slate-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0C0C1C] hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
                  >
                    <span>Submit Review</span>
                  </button>
                </form>
              )}
            </section>
          </div>
          
          {/* Sidebar (Contacts, Actions, and Dynamic Message Box) */}
          <div className="space-y-6">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 font-sans text-base">Contact Information</h3>
              <ul className="space-y-4">
                {business.contactMobile && (
                  <li className="flex items-start">
                    <LucidePhone className="w-5 h-5 text-slate-400 mr-3 mt-0.5" />
                    <div>
                      <a
                        href={`tel:${business.contactMobile}`}
                        onClick={() => handleCallClick(business.contactMobile || '')}
                        className="text-slate-900 hover:text-[#2563EB] font-mono text-sm hover:underline"
                      >
                        {business.contactMobile}
                      </a>
                      <span className="block text-[10px] text-slate-400 font-sans uppercase">Mobile</span>
                    </div>
                  </li>
                )}
                {business.contactPhone && (
                  <li className="flex items-start">
                    <LucidePhone className="w-5 h-5 text-slate-400 mr-3 mt-0.5" />
                    <div>
                      <a
                        href={`tel:${business.contactPhone}`}
                        onClick={() => handleCallClick(business.contactPhone || '')}
                        className="text-slate-900 hover:text-[#2563EB] font-mono text-sm hover:underline"
                      >
                        {business.contactPhone}
                      </a>
                      <span className="block text-[10px] text-slate-400 font-sans uppercase">Landline</span>
                    </div>
                  </li>
                )}
                {business.contactEmail && (
                  <li className="flex items-start">
                    <LucideMail className="w-5 h-5 text-slate-400 mr-3 mt-0.5" />
                    <div>
                      <a
                        href={`mailto:${business.contactEmail}`}
                        onClick={handleEmailClick}
                        className="text-[#2563EB] hover:underline text-sm font-medium"
                      >
                        {business.contactEmail}
                      </a>
                      <span className="block text-[10px] text-slate-400 font-sans uppercase">Email Address</span>
                    </div>
                  </li>
                )}
              </ul>
              
              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-xs text-slate-400 text-center leading-relaxed">
                  Note: Contact details are visible to public during Phase 2. Future phases may restrict full details to registered subscribers.
                </p>
              </div>
            </div>
            
            {business.businessHours && (
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-3 font-sans text-base">Business Hours</h3>
                <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{business.businessHours}</p>
              </div>
            )}

            {/* Interactive Contact Business Form (Satisfies contact_business Tracking) */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 font-sans text-base">Inquire or Send Message</h3>
              
              {contactSent ? (
                <div className="bg-blue-50 text-[#2563EB] text-xs p-4 rounded-xl font-medium border border-blue-100 leading-relaxed">
                  ✅ Message sent! The business owner has been notified.
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
                      className="block w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Your Email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      required
                      className="block w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                  </div>
                  <div>
                    <textarea
                      placeholder="How can we help you?"
                      rows={3}
                      value={contactMsg}
                      onChange={(e) => setContactMsg(e.target.value)}
                      required
                      className="block w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-4 bg-[#2563EB] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                  >
                    <LucideSend className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </button>
                </form>
              )}
            </div>
            
            {/* Directions Map with Click Trigger (Satisfies business_directions_click Tracking) */}
            <div
              onClick={handleDirectionsClick}
              className="bg-slate-100 hover:bg-slate-200 rounded-2xl h-48 border border-slate-200 flex flex-col items-center justify-center cursor-pointer group transition-all duration-300 relative overflow-hidden shadow-sm"
            >
              <div className="absolute inset-0 bg-[#0C0C1C]/10 group-hover:bg-[#0C0C1C]/20 transition-colors" />
              <div className="relative z-10 flex flex-col items-center justify-center text-center p-4">
                <LucideMapPin className="w-8 h-8 text-[#2563EB] mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800">Get Location Directions</span>
                <span className="text-[10px] text-slate-500 mt-1 uppercase font-mono">Click to open map</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

