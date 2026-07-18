'use client';

import { useState, useEffect } from 'react';
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
import { BusinessListing } from '@/types/business';
import Link from 'next/link';
import { LucideArrowLeft } from 'lucide-react';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';

import { parseError, handleAuthRedirect } from '@/lib/utils/error';

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
  }, [user, role, id]);

  const openAction = (type: 'APPROVE' | 'REJECT' | 'REVISION' | 'SUSPEND') => {
    setActionType(type);
    setModalOpen(true);
    setActionError('');
    setActionNotice(null);
  };

  const handleConfirmAction = async (reason: string) => {
    if (!user || !business || !actionType) return;
    
    setIsSubmitting(true);
    setActionError('');
    setActionNotice(null);
    try {
      if (actionType === 'APPROVE') {
        const result = await approveBusiness(id, user.uid);
        const emailResult = result?.approvalEmailNotification;
        if (emailResult?.sent) {
          setActionNotice({
            type: 'success',
            message: `Listing approved. Approval email was accepted by SMTP${emailResult.messageId ? ` (${emailResult.messageId})` : ''}.`,
          });
        } else {
          setActionNotice({
            type: 'warning',
            message: `Listing approved, but approval email was not sent${emailResult?.message ? `: ${emailResult.message}` : emailResult?.reason ? `: ${emailResult.reason}` : '.'}`,
          });
        }
      } else if (actionType === 'REJECT') {
        await rejectBusiness(id, user.uid, reason);
      } else if (actionType === 'REVISION') {
        await requestBusinessRevision(id, user.uid, reason);
      } else if (actionType === 'SUSPEND') {
        await suspendBusiness(id, user.uid, reason);
      }
      
      setModalOpen(false);
      // Reload business data to reflect new status
      const updated = await getBusinessForReview(id);
      setBusiness(updated);
    } catch (err: any) {
      const friendly = parseError(err);
      setActionError(friendly.message);
      handleAuthRedirect(friendly, router);
    } finally {
      setIsSubmitting(false);
    }
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
            {business.status !== 'APPROVED' && (
              <Button
                onClick={() => openAction('APPROVE')}
                isLoading={isSubmitting && actionType === 'APPROVE'}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Approve
              </Button>
            )}
            
            {(business.status === 'PENDING' || business.status === 'APPROVED') && (
              <Button
                onClick={() => openAction('REVISION')}
                isLoading={isSubmitting && actionType === 'REVISION'}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Request Revision
              </Button>
            )}
            
            {business.status !== 'REJECTED' && (
              <Button
                onClick={() => openAction('REJECT')}
                variant="outline"
                isLoading={isSubmitting && actionType === 'REJECT'}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Reject
              </Button>
            )}
            
            {business.status === 'APPROVED' && (
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
          
          <ReviewActionModal 
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
