'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { canManageBusiness } from '@/lib/auth/roles';
import BusinessPortalLayout from '@/components/dashboard/BusinessPortalLayout';
import BusinessForm from '@/components/business/BusinessForm';
import ListingReviewRequest from '@/components/business/ListingReviewRequest';
import { OWNER_EDITABLE_STATUSES } from '@/lib/listing-policy';
import { getBusinessById, updateBusiness, submitBusiness } from '@/lib/data-connect/business-service';
import { BusinessListing } from '@/types/business';
import Link from 'next/link';
import { LucideArrowLeft, LucideAlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';

import { parseError, handleAuthRedirect } from '@/lib/utils/error';
import { ApiError } from '@/lib/data-connect/client-provider';

export default function EditBusinessListingPage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [business, setBusiness] = useState<BusinessListing | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const busy = useRef(false);

  useEffect(() => {
    if (user && canManageBusiness(role) && id) {
      const fetchBusiness = async () => {
        try {
          const data = await getBusinessById(id);
          // Verify ownership in UI (backend should also verify)
          if (data && data.ownerId !== user.uid && role !== 'ADMIN') {
            setError("You don't have permission to perform this action.");
          } else {
            setBusiness(data);
          }
        } catch (err: any) {
          const friendly = parseError(err);
          setError(friendly.message);
          handleAuthRedirect(friendly, router);
        } finally {
          setDataLoading(false);
        }
      };
      fetchBusiness();
    }
  }, [user, role, id, router]);

  const handleSubmit = async (data: Partial<BusinessListing>, action: 'save' | 'submit', policyVersion?: string) => {
    if (!user || !business || busy.current) return;
    busy.current = true;
    
    setIsSubmitting(true);
    setError('');

    try {
      // 1. Update data
      await updateBusiness(id, data);
      
      // 2. If submit action, run submit mutation
      if (action === 'submit') {
        await submitBusiness(id, policyVersion);
      }
      
      // Redirect back to listings
      router.push('/business/listings');
      router.refresh();
    } catch (err: any) {
      const friendly = parseError(err);
      setError(err instanceof ApiError && [400, 409].includes(err.status) ? err.message : friendly.message);
      setIsSubmitting(false);
      handleAuthRedirect(friendly, router);
    } finally {
      busy.current = false;
    }
  };

  if (authLoading || dataLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!user || !canManageBusiness(role)) return null;

  if (error && !business) {
    return (
      <BusinessPortalLayout>
        <div className="p-8">
          <ErrorState title="Access Denied" message={error} />
          <div className="mt-4 flex justify-center">
            <Link href="/business/listings">
              <Button variant="outline">Return to listings</Button>
            </Link>
          </div>
        </div>
      </BusinessPortalLayout>
    );
  }

  return (
    <BusinessPortalLayout>
      <div className="mb-4">
        <Link href="/business/listings" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <LucideArrowLeft className="w-4 h-4" />
          Back to Listings
        </Link>
      </div>

      <PageHeader
        title="Edit Business"
        description={business?.status === 'APPROVED' ? 'Your approved listing remains published. Request changes below.' : 'View the review decision or update eligible listing information.'}
      />

      {error && (
        <div className="mb-6">
           <ErrorState title="Error updating listing" message={error} />
        </div>
      )}

      {business && ['REVISION_REQUESTED', 'REJECTED', 'SUSPENDED'].includes(business.status) && (
        <div className="mb-8 p-6 bg-yellow-50 rounded-xl border border-yellow-200 flex gap-4">
          <LucideAlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-yellow-800">{business.status === 'REVISION_REQUESTED' ? 'Revision required' : business.status === 'REJECTED' ? 'Listing rejected' : 'Listing suspended'}</h3>
            <p className="text-sm text-yellow-700 mt-1 whitespace-pre-wrap">{business.moderatorNotes || 'No reason was recorded for this older decision. Request a review for clarification.'}</p>
          </div>
        </div>
      )}

      {business && OWNER_EDITABLE_STATUSES.includes(business.status) && (
        <BusinessForm initialData={business} onSubmit={handleSubmit} isLoading={isSubmitting} />
      )}
      {business && ['APPROVED', 'REJECTED', 'SUSPENDED', 'PENDING'].includes(business.status) && <>
        {business.status === 'PENDING' && <p className="mb-4 text-sm text-slate-700">Your submission is awaiting review. Request changes or clarification below; ordinary resubmission is disabled.</p>}
        <ListingReviewRequest key={business.id} id={business.id} approved={business.status === 'APPROVED'} />
      </>}
      {business?.status === 'INACTIVE' && <p className="text-sm text-slate-700">This listing is inactive. <Link href="/support" className="text-blue-700 underline">Contact support</Link> for assistance.</p>}
    </BusinessPortalLayout>
  );
}
