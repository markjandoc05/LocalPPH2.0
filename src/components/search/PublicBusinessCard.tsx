import React from 'react';
import Link from 'next/link';
import { BusinessListing } from '@/types/business';
import { LucideCheckCircle, LucideStar, LucideMapPin, LucideGlobe, LucideExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface PublicBusinessCardProps {
  business: BusinessListing;
}

export default function PublicBusinessCard({ business }: PublicBusinessCardProps) {
  return (
    <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full group relative bg-white border border-slate-200">
      {/* Absolute link covering the entire card area for natural click behavior */}
      <Link 
        href={`/business/${business.slug}`} 
        className="absolute inset-0 z-10" 
        aria-label={`View profile for ${business.name}`}
      />

      {/* Cover Image Area */}
      <div className="h-32 bg-slate-50 flex items-center justify-center relative border-b border-slate-100 overflow-hidden">
        {business.coverUrl ? (
          <img 
            src={business.coverUrl} 
            alt={`${business.name} Cover`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-50 to-indigo-100 flex items-center justify-center">
            <span className="text-slate-400 text-[10px] font-semibold tracking-wider uppercase opacity-40">LocalPages.ph</span>
          </div>
        )}

        {/* Logo Overlay */}
        <div className="absolute -bottom-6 left-6 w-16 h-16 bg-white rounded-xl border-2 border-white shadow-md flex items-center justify-center z-20">
          {business.logoUrl ? (
            <img 
              src={business.logoUrl} 
              alt={`${business.name} Logo`}
              className="w-full h-full object-contain p-1"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-500 text-lg font-bold uppercase">
              {business.name.charAt(0)}
            </div>
          )}
        </div>
      </div>
      
      <CardContent className="p-6 pt-10 flex-grow flex flex-col">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors duration-200">
            {business.name}
          </h3>
          <div className="flex gap-1 flex-shrink-0 relative z-20">
            {business.isVerified && (
              <div className="text-blue-600" title="Verified Business">
                <LucideCheckCircle className="w-5 h-5 fill-blue-50 text-blue-600" />
              </div>
            )}
            {business.isFeatured && (
              <div className="text-amber-500" title="Featured Business">
                <LucideStar className="w-5 h-5 fill-current" />
              </div>
            )}
          </div>
        </div>

        <div className="mb-3 relative z-20">
          <Badge variant="info" className="font-semibold text-[10px] uppercase tracking-wider bg-blue-50 text-blue-700 border-blue-100">
            {business.subcategoryName !== "Not assigned" 
              ? `${business.categoryName} - ${business.subcategoryName}`
              : business.categoryName}
          </Badge>
        </div>
        
        <div className="flex items-center text-sm font-medium text-slate-500 mb-4 line-clamp-1">
          <LucideMapPin className="w-4 h-4 mr-1 flex-shrink-0 text-[#2563EB]" />
          {business.cityName}, {business.provinceName}
        </div>
        
        <p className="text-sm text-slate-600 line-clamp-3 mb-6 flex-grow leading-relaxed">
          {business.description || "No description provided."}
        </p>
        
        <div className="mt-auto space-y-3 relative z-20">
          <div className="flex gap-2">
            {business.websiteUrl && (
              <a 
                href={business.websiteUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className={buttonVariants({ variant: 'outline', size: 'sm', className: "flex-1 text-xs hover:bg-slate-50 font-medium transition-colors" })}
              >
                <LucideGlobe className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                Website
              </a>
            )}
            {business.facebookUrl && (
              <a 
                href={business.facebookUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className={buttonVariants({ variant: 'outline', size: 'sm', className: "flex-1 text-xs text-blue-700 hover:bg-blue-50/50 font-medium transition-colors" })}
              >
                <LucideExternalLink className="w-3.5 h-3.5 mr-1.5" />
                Facebook
              </a>
            )}
          </div>
          <Link 
            href={`/business/${business.slug}`}
            className={buttonVariants({ variant: 'default', className: "w-full shadow-sm font-semibold transition-transform active:scale-[0.98]" })}
          >
            View Profile
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
