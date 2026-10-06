import React, { useRef, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { MODERATION_PRESETS, REVIEW_ACTION_STATUS, type ModerationReasonCode, type ReviewAction } from '@/lib/listing-policy';

interface ReviewActionModalProps {
  isOpen: boolean;
  actionType: ReviewAction | null;
  listingName: string;
  onClose: () => void;
  onConfirm: (reason: string, reasonCode?: ModerationReasonCode) => Promise<void>;
  isSubmitting: boolean;
  errorMessage?: string;
  onReload: () => void;
  onRequestRevision?: () => void;
}

export default function ReviewActionModal({ isOpen, actionType, listingName, onClose, onConfirm, isSubmitting, errorMessage, onReload, onRequestRevision }: ReviewActionModalProps) {
  const [reason, setReason] = useState('');
  const [reasonCode, setReasonCode] = useState<ModerationReasonCode | undefined>();
  const [preview, setPreview] = useState(false);
  const busy = useRef(false);
  if (!isOpen || !actionType) return null;
  const requiresReason = actionType !== 'APPROVE';
  const status = REVIEW_ACTION_STATUS[actionType];
  const titles = { APPROVE: 'Approve listing', REJECT: 'Reject listing', REVISION: 'Request revision', SUSPEND: 'Suspend listing' };
  const selectedPreset = MODERATION_PRESETS.find((preset) => preset.code === reasonCode);
  const missingRegistrationPreset = MODERATION_PRESETS.find((preset) => preset.code === 'MISSING_REGISTRATION_DOCUMENTS');
  const valid = !requiresReason || (!!selectedPreset && (selectedPreset.statuses as readonly string[]).includes(status) && !!reason.trim() && reason.trim().length <= 5000);
  const confirm = async () => {
    if (busy.current || isSubmitting || !preview || !valid) return;
    busy.current = true;
    try { await onConfirm(reason.trim(), reasonCode); } finally { busy.current = false; }
  };
  return <Modal isOpen={isOpen} onClose={() => { if (!isSubmitting && !busy.current) onClose(); }} title={titles[actionType]} description={listingName} footer={<>
    <Button variant="outline" onClick={() => { if (!busy.current) onClose(); }} disabled={isSubmitting}>Cancel</Button>
    {preview && <Button variant="outline" onClick={() => setPreview(false)} disabled={isSubmitting}>Edit response</Button>}
    <Button disabled={!valid || isSubmitting} isLoading={isSubmitting} className={actionType === 'REJECT' || actionType === 'SUSPEND' ? 'bg-red-600 hover:bg-red-700 text-white' : ''} onClick={() => { if (preview) void confirm(); else setPreview(true); }}>{preview ? 'Confirm decision' : 'Preview decision'}</Button>
  </>}>
    {errorMessage && <div className="mb-4 space-y-2"><p role="alert" className="text-sm text-red-700">{errorMessage}</p><Button variant="outline" size="sm" onClick={onReload} disabled={isSubmitting}>Close and refresh listing</Button></div>}
    {preview ? <div className="space-y-4 text-sm">
      <p><strong>Listing:</strong> {listingName}</p>
      <p><strong>New status:</strong> {status.replaceAll('_', ' ')}</p>
      {requiresReason ? <><p className="font-semibold">Owner-facing response</p><p className="whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-4">{reason.trim()}</p><p>The owner will see this response in the dashboard. An email notification will also be attempted.</p></> : <p>This listing will become publicly visible. For a previously rejected or suspended listing, approval reverses the prior decision.</p>}
      {actionType === 'SUSPEND' && <p>The listing will be unpublished. Its saved content will be retained.</p>}
      {actionType === 'REVISION' && <p>The owner can correct the listing and resubmit for review.</p>}
    </div> : requiresReason ? <div className="space-y-4">
      <p className="text-sm text-slate-600">Select a reusable reason, then edit the response before previewing it. Missing information and documents require a revision request.</p>
      <div className="flex flex-wrap gap-2" aria-label="Reusable review reasons">
        {MODERATION_PRESETS.filter((preset) => (preset.statuses as readonly string[]).includes(status)).map((preset) => <Button key={preset.code} type="button" variant="outline" size="sm" className="h-auto min-h-9 max-w-full whitespace-normal py-2" aria-pressed={reasonCode === preset.code} onClick={() => { setReasonCode(preset.code); setReason(preset.message); }}>{preset.label}</Button>)}
        {actionType === 'REJECT' && onRequestRevision && missingRegistrationPreset && <Button type="button" variant="outline" size="sm" className="h-auto min-h-9 max-w-full whitespace-normal py-2" disabled={isSubmitting} onClick={() => {
          if (busy.current) return;
          setReasonCode(missingRegistrationPreset.code);
          setReason(missingRegistrationPreset.message);
          setPreview(false);
          onRequestRevision();
        }}>{missingRegistrationPreset.label}</Button>}
      </div>
      <label htmlFor="review-owner-response" className="block text-sm font-medium">Owner-facing response (required)</label>
      <Textarea id="review-owner-response" value={reason} onChange={(event) => setReason(event.target.value)} rows={5} maxLength={5000} placeholder="Choose a reason above and describe the decision for the owner." />
    </div> : <p className="text-sm text-slate-600">Review the listing’s eligibility before approving it. Preview the publication action to continue.</p>}
  </Modal>;
}
