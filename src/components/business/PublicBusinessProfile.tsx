import React from 'react';
import { BusinessListing } from '@/types/business';
import { LucideMapPin, LucidePhone, LucideMail, LucideGlobe, LucideExternalLink, LucideCheckCircle, LucideStar } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

interface PublicBusinessProfileProps {
  business: BusinessListing;
}

export default function PublicBusinessProfile({ business }: PublicBusinessProfileProps) {
  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      {/* Cover Image Placeholder */}
      <div className="h-64 bg-slate-100 flex items-center justify-center relative">
        <span className="text-slate-400">Cover Image Placeholder</span>
        
        {/* Logo Placeholder */}
        <div className="absolute -bottom-16 left-8 w-32 h-32 bg-white rounded-2xl border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
          <div className="w-full h-full bg-slate-50 flex items-center justify-center">
            <span className="text-slate-400 text-sm">Logo</span>
          </div>
        </div>
      </div>
      
      <CardContent className="pt-20 px-8 pb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold text-slate-900">{business.name}</h1>
              {business.isVerified && (
                <div title="Verified">
                  <LucideCheckCircle className="w-6 h-6 text-blue-600" />
                </div>
              )}
              {business.isFeatured && (
                <div title="Featured">
                  <LucideStar className="w-6 h-6 text-yellow-500 fill-current" />
                </div>
              )}
            </div>
            <p className="text-lg text-blue-600 font-medium">{business.categoryName || business.categoryId}</p>
            <div className="flex items-center text-slate-500 mt-2">
              <LucideMapPin className="w-4 h-4 mr-1.5" />
              {business.addressLine1}, {business.cityName || business.cityId}, {business.provinceId}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {business.websiteUrl && (
              <a href={business.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium transition-colors">
                <LucideGlobe className="w-4 h-4" />
                Website
              </a>
            )}
            {business.facebookUrl && (
              <a href={business.facebookUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] rounded-lg text-sm font-medium transition-colors">
                <LucideExternalLink className="w-4 h-4" />
                Facebook
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">About</h2>
              <div className="prose prose-slate max-w-none text-slate-600">
                <p className="whitespace-pre-wrap">{business.description}</p>
              </div>
            </section>
            
            {business.products && (
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Products</h2>
                <p className="text-slate-600">{business.products}</p>
              </section>
            )}
            
            {business.services && (
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Services</h2>
                <p className="text-slate-600">{business.services}</p>
              </section>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-4">Contact Information</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <LucidePhone className="w-5 h-5 text-slate-400 mr-3 mt-0.5" />
                  <div>
                    {business.contactMobile && <div className="text-slate-900">{business.contactMobile}</div>}
                    {business.contactPhone && <div className="text-slate-900">{business.contactPhone}</div>}
                  </div>
                </li>
                {business.contactEmail && (
                  <li className="flex items-center">
                    <LucideMail className="w-5 h-5 text-slate-400 mr-3" />
                    <a href={`mailto:${business.contactEmail}`} className="text-blue-600 hover:underline">
                      {business.contactEmail}
                    </a>
                  </li>
                )}
              </ul>
              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-xs text-slate-500 text-center">
                  Note: Contact details are visible to public during Phase 2. Future phases may restrict full details to registered subscribers.
                </p>
              </div>
            </div>
            
            {business.businessHours && (
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-4">Business Hours</h3>
                <p className="text-slate-600 whitespace-pre-wrap">{business.businessHours}</p>
              </div>
            )}
            
            <div className="bg-slate-100 rounded-xl h-48 border border-slate-200 flex items-center justify-center">
              <span className="text-slate-400 text-sm">Map Placeholder</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
