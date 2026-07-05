'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { canManageBusiness } from '@/lib/auth/roles';
import BusinessPortalLayout from '@/components/dashboard/BusinessPortalLayout';
import BusinessForm from '@/components/business/BusinessForm';
import { createBusinessDraft, submitBusiness } from '@/lib/data-connect/business-service';
import { BusinessListing } from '@/types/business';
import Link from 'next/link';
import { LucideArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { ErrorState } from '@/components/ui/ErrorState';
import { trackEvent } from '@/lib/analytics';

import { parseError, handleAuthRedirect } from '@/lib/utils/error';

export default function NewBusinessListingPage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (data: Partial<BusinessListing>, action: 'save' | 'submit') => {
    if (!user) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      // 1. Always create draft first
      const businessId = await createBusinessDraft({ ...data, ownerId: user.uid });
      
      // 2. If submit action, run submit mutation
      if (action === 'submit') {
        await submitBusiness(businessId);
        trackEvent('submit_listing', {
          business_id: businessId,
          business_name: data.name || '',
          category: data.categoryId || '',
          city: data.cityId || '',
          province: data.provinceId || '',
          region: data.regionId || '',
          action_type: 'submit',
          page_type: 'New Listing',
        });
      } else {
        trackEvent('register_business', {
          business_id: businessId,
          business_name: data.name || '',
          category: data.categoryId || '',
          city: data.cityId || '',
          province: data.provinceId || '',
          region: data.regionId || '',
          action_type: 'draft_save',
          page_type: 'New Listing',
        });
      }
      
      // Redirect back to listings
      router.push('/business/listings');
      router.refresh(); // Force refresh to show new data
    } catch (err: any) {
      const friendly = parseError(err);
      setError(friendly.message);
      setIsSubmitting(false);
      handleAuthRedirect(friendly, router);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user || !canManageBusiness(role)) return null;

  return (
    <BusinessPortalLayout>
      <div className="mb-4">
        <Link href="/business/listings" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <LucideArrowLeft className="w-4 h-4" />
          Back to Listings
        </Link>
      </div>
      
      <PageHeader
        title="Add New Business"
        description="Create a new listing for your business."
      />

      {error && (
        <div className="mb-6">
           <ErrorState title="Error creating listing" message={error} />
        </div>
      )}

      <BusinessForm onSubmit={handleSubmit} isLoading={isSubmitting} />
    </BusinessPortalLayout>
  );
}
