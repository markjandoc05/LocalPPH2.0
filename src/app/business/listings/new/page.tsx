'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { canManageBusiness } from '@/lib/auth/roles';
import BusinessPortalLayout from '@/components/dashboard/BusinessPortalLayout';
import BusinessForm from '@/components/business/BusinessForm';
import { createBusinessDraftWithResult, getBusinessById, submitBusiness } from '@/lib/data-connect/business-service';
import { completeListingRequest, getPendingListingRequest, rememberListingRequest } from '@/lib/data-connect/listing-draft-session';
import { BusinessListing } from '@/types/business';
import Link from 'next/link';
import { LucideArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { ErrorState } from '@/components/ui/ErrorState';
import { trackEvent } from '@/lib/analytics';

import { parseError, handleAuthRedirect } from '@/lib/utils/error';

const draftStorage = () => {
  try { return window.sessionStorage; } catch { return null; }
};

export default function NewBusinessListingPage() {
  const { user, role, loading } = useAuth();

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user || !canManageBusiness(role)) return null;

  // A different signed-in owner gets a separate form and request lifecycle.
  return <NewListingForm key={user.uid} ownerId={user.uid} />;
}

function NewListingForm({ ownerId }: { ownerId: string }) {
  const router = useRouter();
  const [request] = useState(() => {
    const pendingId = getPendingListingRequest(ownerId, draftStorage());
    return { id: pendingId || crypto.randomUUID(), pending: Boolean(pendingId) };
  });
  const requestId = request.id;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [canCreate, setCanCreate] = useState(true);
  const [savedListingId, setSavedListingId] = useState<string | null>(null);
  const [checkingSavedListing, setCheckingSavedListing] = useState(request.pending);
  const inFlight = useRef(false);
  const mounted = useRef(true);
  const confirmedListing = useRef<string | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (!request.pending) return;
    let cancelled = false;
    const checkSavedListing = async () => {
      try {
        const existing = await getBusinessById(requestId);
        if (!cancelled && existing?.ownerId === ownerId) {
          confirmedListing.current = requestId;
          setSavedListingId(requestId);
        } else if (!cancelled && existing) {
          setCanCreate(false);
          setError("You don't have permission to open this listing.");
        }
      } catch (err) {
        if (!cancelled) {
          const friendly = parseError(err);
          setError(friendly.message);
          handleAuthRedirect(friendly, router);
        }
      }
      if (!cancelled) setCheckingSavedListing(false);
    };
    void checkSavedListing();
    return () => { cancelled = true; };
  }, [ownerId, request.pending, requestId, router]);

  const handleSubmit = async (data: Partial<BusinessListing>, action: 'save' | 'submit', policyVersion?: string) => {
    if (!canCreate || inFlight.current) return;
    if (confirmedListing.current) {
      router.replace(`/business/listings/${confirmedListing.current}/edit`);
      return;
    }
    const isCurrent = () => mounted.current;
    inFlight.current = true;
    rememberListingRequest(ownerId, requestId, draftStorage());
    
    setIsSubmitting(true);
    setError('');

    try {
      const result = await createBusinessDraftWithResult({ ...data, id: requestId, ownerId });
      const businessId = result.id;
      if (!isCurrent()) return;
      confirmedListing.current = businessId;
      if (!result.created) {
        setSavedListingId(businessId);
        setIsSubmitting(false);
        router.replace(`/business/listings/${businessId}/edit`);
        return;
      }
      
      // 2. If submit action, run submit mutation
      if (action === 'submit') {
        await submitBusiness(businessId, policyVersion);
        if (!isCurrent()) return;
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
      
      completeListingRequest(ownerId, businessId, draftStorage());
      router.replace('/business/listings');
      router.refresh(); // Force refresh to show new data
    } catch (err) {
      if (!isCurrent()) return;
      const friendly = parseError(err);
      if (confirmedListing.current || friendly.status === 409) {
        const savedId = confirmedListing.current || requestId;
        confirmedListing.current = savedId;
        setSavedListingId(savedId);
        rememberListingRequest(ownerId, savedId, draftStorage());
        setError('Your listing was saved, but we could not confirm the next step. Open it to check its details and status.');
      } else {
        setError(friendly.message);
        handleAuthRedirect(friendly, router);
      }
      inFlight.current = false;
      setIsSubmitting(false);
    }
  };

  if (checkingSavedListing) return <div className="p-8 text-center">Loading...</div>;

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

      {savedListingId ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6" role="status">
          <p className="mb-4 text-sm text-slate-700">Open your saved listing to review its details and status before making further changes.</p>
          <Link href={`/business/listings/${savedListingId}/edit`} className="font-semibold text-blue-600 hover:underline">Open saved listing</Link>
          <p className="mt-4"><Link href="/business/listings" className="text-sm text-slate-600 hover:underline">View all listings</Link></p>
        </div>
      ) : canCreate ? (
        <BusinessForm key={requestId} initialData={{ id: requestId }} onSubmit={handleSubmit} isLoading={isSubmitting} />
      ) : null}
    </BusinessPortalLayout>
  );
}
