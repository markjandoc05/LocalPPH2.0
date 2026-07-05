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
    <Card className="hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full group">
      {/* Cover / Logo Area Placeholder */}
      <div className="h-32 bg-slate-50 flex items-center justify-center relative border-b border-slate-100 group-hover:bg-slate-100 transition-colors">
        <span className="text-slate-400 text-sm font-medium">Cover Image</span>
        <div className="absolute -bottom-6 left-6 w-16 h-16 bg-white rounded-lg border border-slate-200 flex items-center justify-center shadow-sm">
           <span className="text-slate-400 text-xs font-medium">Logo</span>
        </div>
      </div>
      
      <CardContent className="p-6 pt-10 flex-grow flex flex-col">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="text-lg font-bold text-slate-900 line-clamp-1">
            <Link href={`/business/${business.slug}`} className="hover:text-blue-600 transition-colors">
              {business.name}
            </Link>
          </h3>
          <div className="flex gap-1 flex-shrink-0">
            {business.isVerified && (
              <div className="text-blue-600" title="Verified Business">
                <LucideCheckCircle className="w-5 h-5" />
              </div>
            )}
            {business.isFeatured && (
              <div className="text-amber-500" title="Featured Business">
                <LucideStar className="w-5 h-5 fill-current" />
              </div>
            )}
          </div>
        </div>

        <div className="mb-3">
          <Badge variant="info" className="font-medium text-[11px] uppercase tracking-wider">
            {business.subcategoryName !== "Not assigned" 
              ? `${business.categoryName} - ${business.subcategoryName}`
              : business.categoryName}
          </Badge>
        </div>
        
        <div className="flex items-center text-sm text-slate-500 mb-4 line-clamp-1">
          <LucideMapPin className="w-4 h-4 mr-1 flex-shrink-0" />
          {business.cityName}, {business.provinceName}
        </div>
        
        <p className="text-sm text-slate-600 line-clamp-3 mb-6 flex-grow">
          {business.description}
        </p>
        
        <div className="mt-auto space-y-3">
          <div className="flex gap-2">
            {business.websiteUrl && (
              <a 
                href={business.websiteUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className={buttonVariants({ variant: 'outline', size: 'sm', className: "flex-1 text-xs" })}
              >
                <LucideGlobe className="w-4 h-4 mr-1.5" />
                Website
              </a>
            )}
            {business.facebookUrl && (
              <a 
                href={business.facebookUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className={buttonVariants({ variant: 'outline', size: 'sm', className: "flex-1 text-xs text-blue-700" })}
              >
                <LucideExternalLink className="w-4 h-4 mr-1.5" />
                Facebook
              </a>
            )}
          </div>
          <Link 
            href={`/business/${business.slug}`}
            className={buttonVariants({ variant: 'default', className: "w-full" })}
          >
            View Profile
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
