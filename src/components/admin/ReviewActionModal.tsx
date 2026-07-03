import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';

type ActionType = 'APPROVE' | 'REJECT' | 'REVISION' | 'SUSPEND' | null;

interface ReviewActionModalProps {
  isOpen: boolean;
  actionType: ActionType;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isSubmitting: boolean;
}

export default function ReviewActionModal({ isOpen, actionType, onClose, onConfirm, isSubmitting }: ReviewActionModalProps) {
  const [reason, setReason] = useState('');

  if (!isOpen || !actionType) return null;

  const requiresReason = ['REJECT', 'REVISION', 'SUSPEND'].includes(actionType);

  const getTitle = () => {
    switch (actionType) {
      case 'APPROVE': return 'Approve Listing';
      case 'REJECT': return 'Reject Listing';
      case 'REVISION': return 'Request Revision';
      case 'SUSPEND': return 'Suspend Listing';
      default: return '';
    }
  };

  const getButtonClass = () => {
    switch (actionType) {
      case 'APPROVE': return 'bg-green-600 hover:bg-green-700 text-white';
      case 'REJECT':
      case 'SUSPEND': return 'bg-red-600 hover:bg-red-700 text-white';
      case 'REVISION': return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      default: return '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(reason);
  };

  const footer = (
    <>
      <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button 
        onClick={handleSubmit} 
        disabled={isSubmitting || (requiresReason && !reason.trim())}
        className={getButtonClass()}
      >
        {isSubmitting ? 'Processing...' : 'Confirm'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      footer={footer}
    >
      <form id="action-form" onSubmit={handleSubmit}>
        {actionType === 'APPROVE' ? (
          <p className="text-slate-600">Are you sure you want to approve this listing? It will become publicly visible immediately.</p>
        ) : (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {actionType === 'REVISION' ? 'Revision Notes (Required)' : 'Reason (Required)'}
            </label>
            <Textarea 
              required={requiresReason}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder={`Provide context for the business owner...`}
            />
          </div>
        )}
      </form>
    </Modal>
  );
}
