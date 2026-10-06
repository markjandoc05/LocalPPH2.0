'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { canAccessAdmin } from '@/lib/auth/roles';
import AdminLayout from '@/components/admin/AdminLayout';
import ListingReviewPanel from '@/components/admin/ListingReviewPanel';
import ReviewActionModal from '@/components/admin/ReviewActionModal';
import { 
  getBusinessForReview, 
  approveBusiness, 
  rejectBusiness, 
  requestBusinessRevision, 
  suspendBusiness 
} from '@/lib/data-connect/admin-service';
import { canReviewListing, type ModerationRequest, type ModerationReasonCode } from '@/lib/listing-policy';
import { BusinessListing } from '@/types/business';
import Link from 'next/link';
import { LucideArrowLeft } from 'lucide-react';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';

import { parseError, handleAuthRedirect } from '@/lib/utils/error';
import { ApiError } from '@/lib/data-connect/client-provider';

export default function ReviewListingPage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [business, setBusiness] = useState<BusinessListing | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'warning'; message: string } | null>(null);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'REVISION' | 'SUSPEND' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewRequest, setReviewRequest] = useState<ModerationRequest | null>(null);
  const busy = useRef(false);

  useEffect(() => {
    if (user && canAccessAdmin(role) && id) {
      const fetchBusiness = async () => {
        try {
          const data = await getBusinessForReview(id);
          if (data) {
            setBusiness(data);
          } else {
            setError('Listing not found.');
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

  const openAction = (type: 'APPROVE' | 'REJECT' | 'REVISION' | 'SUSPEND') => {
    if (!business || busy.current) return;
    setReviewRequest({ decisionId: crypto.randomUUID(), expectedStatus: business.status, expectedUpdatedAt: business.updatedAt });
    setActionType(type);
    setModalOpen(true);
    setActionError('');
    setActionNotice(null);
  };

  const handleConfirmAction = async (reason: string, reasonCode?: ModerationReasonCode) => {
    if (!user || !business || !actionType || !reviewRequest || busy.current) return;
    busy.current = true;
    setIsSubmitting(true); setActionError(''); setActionNotice(null);
    try {
      const request = { ...reviewRequest, reasonCode };
      const result = actionType === 'APPROVE' ? await approveBusiness(id, user.uid, request)
        : actionType === 'REJECT' ? await rejectBusiness(id, user.uid, reason, request)
        : actionType === 'REVISION' ? await requestBusinessRevision(id, user.uid, reason, request)
        : await suspendBusiness(id, user.uid, reason, request);
      const emailResult = result.approvalEmailNotification || result.revisionEmailNotification || result.moderationEmailNotification;
      const label = actionType === 'APPROVE' ? 'Listing approved' : actionType === 'REJECT' ? 'Listing rejected' : actionType === 'REVISION' ? 'Revision requested' : 'Listing suspended';
      setActionNotice({ type: emailResult?.sent || result.alreadyApplied ? 'success' : 'warning', message: result.alreadyApplied
        ? 'This decision was already saved. No duplicate notification was sent.'
        : emailResult?.sent ? `${label}. Email notification was accepted by SMTP.` : `${label}. The decision was saved, but email was not sent${emailResult?.message ? `: ${emailResult.message}` : '.'}` });
      setModalOpen(false);
      try { setBusiness(await getBusinessForReview(id)); }
      catch { setActionError('The decision was saved, but the listing could not be reloaded. Refresh this page before taking another action.'); }
    } catch (err) {
      const friendly = parseError(err);
      setActionError(err instanceof ApiError && [400, 409].includes(err.status) ? err.message : friendly.message);
      handleAuthRedirect(friendly, router);
    } finally { busy.current = false; setIsSubmitting(false); }
  };

  if (authLoading || dataLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!user || !canAccessAdmin(role)) return null;

  if (error && !business) {
    return (
      <AdminLayout>
        <div className="p-8">
          <ErrorState title="Error" message={error} />
          <div className="mt-4 flex justify-center">
            <Link href="/admin/listings">
              <Button variant="outline">Return to listings</Button>
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <Link href="/admin/listings" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-4">
            <LucideArrowLeft className="w-4 h-4" />
            Back to Listings
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Review Listing</h1>
        </div>
        
        {business && (
          <div className="flex gap-2">
            {canReviewListing(business.status, 'APPROVED') && (
              <Button
                onClick={() => openAction('APPROVE')}
                isLoading={isSubmitting && actionType === 'APPROVE'}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Approve
              </Button>
            )}
            
            {(canReviewListing(business.status, 'REVISION_REQUESTED')) && (
              <Button
                onClick={() => openAction('REVISION')}
                isLoading={isSubmitting && actionType === 'REVISION'}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Request Revision
              </Button>
            )}
            
            {canReviewListing(business.status, 'REJECTED') && (
              <Button
                onClick={() => openAction('REJECT')}
                variant="outline"
                isLoading={isSubmitting && actionType === 'REJECT'}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Reject
              </Button>
            )}
            
            {canReviewListing(business.status, 'SUSPENDED') && (
              <Button
                onClick={() => openAction('SUSPEND')}
                isLoading={isSubmitting && actionType === 'SUSPEND'}
                className="bg-red-600 hover:bg-red-700 text-white ml-2"
              >
                Suspend
              </Button>
            )}
          </div>
        )}
      </div>

      {actionError && (
        <div className="mb-6">
          <ErrorState title="Action Failed" message={actionError} />
        </div>
      )}

      {actionNotice && (
        <div className={`mb-6 rounded-xl border p-4 text-sm ${
          actionNotice.type === 'success'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
            : 'border-amber-200 bg-amber-50 text-amber-800'
        }`}>
          {actionNotice.message}
        </div>
      )}

      {business && (
        <>
          <ListingReviewPanel business={business} />
          
          <ReviewActionModal key={reviewRequest?.decisionId}
            listingName={business.name}
            errorMessage={actionError}
            onReload={() => {
              setModalOpen(false);
              void getBusinessForReview(id).then((updated) => { setBusiness(updated); setActionError(''); }).catch(() => setActionError('Unable to refresh the listing. Please reload this page.'));
            }}
            isOpen={modalOpen} 
            actionType={actionType} 
            onClose={() => setModalOpen(false)} 
            onConfirm={handleConfirmAction}
            isSubmitting={isSubmitting}
          />
        </>
      )}
    </AdminLayout>
  );
}
