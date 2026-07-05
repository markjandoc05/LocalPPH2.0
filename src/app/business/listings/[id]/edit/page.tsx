'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { canManageBusiness } from '@/lib/auth/roles';
import BusinessPortalLayout from '@/components/dashboard/BusinessPortalLayout';
import BusinessForm from '@/components/business/BusinessForm';
import { getBusinessById, updateBusiness, submitBusiness } from '@/lib/data-connect/business-service';
import { BusinessListing } from '@/types/business';
import Link from 'next/link';
import { LucideArrowLeft, LucideAlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';

import { parseError, handleAuthRedirect } from '@/lib/utils/error';

export default function EditBusinessListingPage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [business, setBusiness] = useState<BusinessListing | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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
  }, [user, role, id]);

  const handleSubmit = async (data: Partial<BusinessListing>, action: 'save' | 'submit') => {
    if (!user || !business) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      // 1. Update data
      await updateBusiness(id, data);
      
      // 2. If submit action, run submit mutation
      if (action === 'submit') {
        await submitBusiness(id);
      }
      
      // Redirect back to listings
      router.push('/business/listings');
      router.refresh();
    } catch (err: any) {
      const friendly = parseError(err);
      setError(friendly.message);
      setIsSubmitting(false);
      handleAuthRedirect(friendly, router);
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
        description="Update your business information."
      />

      {error && (
        <div className="mb-6">
           <ErrorState title="Error updating listing" message={error} />
        </div>
      )}

      {business?.status === 'REVISION_REQUESTED' && business.moderatorNotes && (
        <div className="mb-8 p-6 bg-yellow-50 rounded-xl border border-yellow-200 flex gap-4">
          <LucideAlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-yellow-800">Revision Required</h3>
            <p className="text-sm text-yellow-700 mt-1">{business.moderatorNotes}</p>
          </div>
        </div>
      )}

      {business && (
        <BusinessForm initialData={business} onSubmit={handleSubmit} isLoading={isSubmitting} />
      )}
    </BusinessPortalLayout>
  );
}
