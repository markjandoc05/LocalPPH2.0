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

export default function ReviewListingPage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [business, setBusiness] = useState<BusinessListing | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  
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
          setError('Failed to load business listing.');
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
  };

  const handleConfirmAction = async (reason: string) => {
    if (!user || !business || !actionType) return;
    
    setIsSubmitting(true);
    try {
      if (actionType === 'APPROVE') {
        await approveBusiness(id, user.uid);
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
      alert(`Failed to ${actionType.toLowerCase()} listing: ${err.message}`);
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
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Approve
              </Button>
            )}
            
            {(business.status === 'PENDING' || business.status === 'APPROVED') && (
              <Button
                onClick={() => openAction('REVISION')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Request Revision
              </Button>
            )}
            
            {business.status !== 'REJECTED' && (
              <Button
                onClick={() => openAction('REJECT')}
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Reject
              </Button>
            )}
            
            {business.status === 'APPROVED' && (
              <Button
                onClick={() => openAction('SUSPEND')}
                className="bg-red-600 hover:bg-red-700 text-white ml-2"
              >
                Suspend
              </Button>
            )}
          </div>
        )}
      </div>

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
