'use client';

import { useMemo, useState } from 'react';
import { LucideMail, LucideShieldAlert } from 'lucide-react';

import { BusinessListing } from '@/types/business';
import { sendBusinessRevisionReminder } from '@/lib/data-connect/admin-service';
import {
  DTI_SEC_REVISION_MESSAGE,
  getRevisionReminderRetryAt,
  hasVerificationDocuments,
} from '@/lib/listing-revision-reminders';
import { formatAppDateTime } from '@/lib/time';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface RevisionReminderButtonProps {
  listing: BusinessListing;
  onReminderSent?: () => Promise<void> | void;
}

export default function RevisionReminderButton({
  listing,
  onReminderSent,
}: RevisionReminderButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const retryAt = useMemo(
    () => getRevisionReminderRetryAt(listing.lastRevisionReminderAt),
    [listing.lastRevisionReminderAt],
  );
  const hasDocuments = hasVerificationDocuments(listing.documents);
  const cannotSendReason = !listing.ownerEmail
    ? 'The owner does not have a registered email address.'
    : listing.ownerAccountStatus && listing.ownerAccountStatus !== 'ACTIVE'
      ? 'The owner account is not active.'
      : retryAt
        ? `Another reminder can be sent after ${formatAppDateTime(retryAt)}.`
        : '';

  const handleSend = async () => {
    setIsSending(true);
    setError('');
    setNotice('');

    try {
      const result = await sendBusinessRevisionReminder(listing.id);
      if (!result?.sent) {
        setError(result?.message || 'The reminder email was not sent.');
        return;
      }

      setNotice(
        `Reminder accepted by SMTP for ${result.recipientEmail}${result.messageId ? ` (${result.messageId})` : ''}.`,
      );
      await onReminderSent?.();
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'The reminder email could not be sent.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <div className="space-y-1">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            setError('');
            setNotice('');
            setIsOpen(true);
          }}
          disabled={Boolean(cannotSendReason)}
          title={cannotSendReason || 'Preview and send a revision reminder'}
        >
          <LucideMail className="mr-2 h-4 w-4" />
          Send Reminder
        </Button>
        {cannotSendReason && (
          <p className="max-w-52 text-right text-[11px] leading-4 text-slate-500">
            {cannotSendReason}
          </p>
        )}
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => !isSending && setIsOpen(false)}
        title="Send revision reminder"
        description="Review the registered recipient and message before sending."
        className="max-w-2xl"
        footer={(
          <>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSending}>
              {notice ? 'Close' : 'Cancel'}
            </Button>
            {!notice && (
              <Button type="button" variant="secondary" onClick={handleSend} isLoading={isSending}>
                <LucideMail className="mr-2 h-4 w-4" />
                Send Email
              </Button>
            )}
          </>
        )}
      >
        <div className="space-y-4 text-sm">
          <dl className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Business</dt>
              <dd className="mt-1 font-semibold text-slate-900">{listing.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Registered recipient</dt>
              <dd className="mt-1 break-all font-semibold text-slate-900">{listing.ownerEmail}</dd>
            </div>
          </dl>

          <div className={`rounded-lg border p-3 ${
            hasDocuments
              ? 'border-amber-200 bg-amber-50 text-amber-900'
              : 'border-blue-200 bg-blue-50 text-blue-900'
          }`}>
            <div className="flex items-start gap-2">
              <LucideShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                {hasDocuments
                  ? 'A verification document is already uploaded. Confirm it is invalid or incomplete before sending this reminder.'
                  : 'No verification document is currently uploaded.'}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Subject</p>
            <p className="mt-1 rounded-lg border border-slate-200 px-3 py-2 font-medium text-slate-900">
              Reminder: DTI /SEC Certificate needed for {listing.name}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Message preview</p>
            <div className="mt-1 whitespace-pre-wrap rounded-lg border border-slate-200 bg-white p-4 leading-6 text-slate-700">
              <p>Hi {listing.ownerName || 'there'},</p>
              <p className="mt-3">This is a reminder that your listing for {listing.name} still requires an update before it can be approved.</p>
              <p className="mt-3">{DTI_SEC_REVISION_MESSAGE}</p>
              <p className="mt-3"><span className="font-semibold">Revision notes:</span><br />{listing.moderatorNotes || 'Please upload the requested business registration document.'}</p>
              <p className="mt-3">The email includes a direct link to update and resubmit the listing.</p>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-800">{error}</div>
          )}
          {notice && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-800">{notice}</div>
          )}
        </div>
      </Modal>
    </>
  );
}
