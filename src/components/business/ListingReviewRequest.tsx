'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { provider } from '@/lib/data-connect/provider';

export default function ListingReviewRequest({ id, approved = false }: { id: string; approved?: boolean }) {
  const [message, setMessage] = useState('');
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const busy = useRef(false);
  const [sent, setSent] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy.current || sent || !message.trim()) return;
    busy.current = true; setSaving(true); setError('');
    try {
      await provider.requestListingReview({ id, requestId, message });
      setSent(true);
      setNotice(approved ? 'Your change request is in the support inbox. Your current approved listing remains published.' : 'Your review request is in the support inbox. The listing stays unpublished until a reviewer changes the decision.');
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to save your request. Please retry.'); }
    finally { busy.current = false; setSaving(false); }
  };
  return <section className="rounded-xl border border-slate-200 bg-white p-6">
    <h2 className="text-lg font-semibold">{approved ? 'Request listing changes' : 'Request a review'}</h2>
    <p className="mt-2 text-sm text-slate-600">{approved ? 'Explain the exact changes you need. Published content is protected while your request is reviewed.' : 'Explain why you believe the decision is incorrect and describe the business’s actual services. This asks a reviewer to reconsider; it does not resubmit or republish the listing.'}</p>
    {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    {notice && <p role="status" className="mt-3 text-sm text-green-800">{notice}</p>}
    {!sent && <form onSubmit={submit} className="mt-4 space-y-3">
      <label htmlFor="listing-review-explanation" className="block text-sm font-medium">{approved ? 'Requested changes' : 'Review explanation'}</label>
      <textarea id="listing-review-explanation" value={message} onChange={(event) => { setMessage(event.target.value); setRequestId(crypto.randomUUID()); }} required maxLength={5000} rows={5} disabled={saving} className="w-full rounded-lg border border-slate-300 p-3 text-sm" />
      <button type="submit" disabled={saving || !message.trim()} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{saving ? 'Sending…' : approved ? 'Send change request' : 'Send review request'}</button>
    </form>}
    <Link href="/support" className="mt-4 inline-block text-sm font-semibold text-blue-700 underline">View support responses</Link>
  </section>;
}
