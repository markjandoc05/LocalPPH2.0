import React from 'react';
import { BusinessStatus } from '@/types/business';

export default function BusinessStatusBadge({ status }: { status: BusinessStatus }) {
  const styles: Record<BusinessStatus, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    PENDING: 'bg-blue-100 text-blue-700',
    APPROVED: 'bg-green-100 text-green-700',
    REVISION_REQUESTED: 'bg-yellow-100 text-yellow-800',
    REJECTED: 'bg-red-100 text-red-700',
    INACTIVE: 'bg-gray-100 text-gray-500',
    SUSPENDED: 'bg-red-100 text-red-900',
  };
  
  const labels: Record<BusinessStatus, string> = {
    DRAFT: 'Draft',
    PENDING: 'Pending Approval',
    APPROVED: 'Approved',
    REVISION_REQUESTED: 'Needs Revision',
    REJECTED: 'Rejected',
    INACTIVE: 'Inactive',
    SUSPENDED: 'Suspended',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status] || status}
    </span>
  );
}
