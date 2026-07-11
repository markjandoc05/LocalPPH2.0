'use client';

import { useEffect, useState } from 'react';
import { createSupportTicket, getMySupportTickets } from '@/lib/data-connect';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatAppDateTime } from '@/lib/time';
import { LucideLifeBuoy, LucideMessageSquare } from 'lucide-react';

const supportCategories = [
  { value: 'CONTACT_REQUEST', label: 'Contact Request' },
  { value: 'BUG_REPORT', label: 'Report a Bug' },
  { value: 'FEATURE_REQUEST', label: 'Request a Feature' },
  { value: 'ACCOUNT_HELP', label: 'Account Help' },
  { value: 'OTHER', label: 'Other' },
];

const getCategoryLabel = (value: string) =>
  supportCategories.find((category) => category.value === value)?.label || value;

export default function SupportPage() {
  const [category, setCategory] = useState('CONTACT_REQUEST');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadTickets = async () => {
    try {
      const result = await getMySupportTickets({ userId: '' });
      setTickets(result.data.supportTickets || []);
    } catch (error) {
      console.warn('Failed to load support tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTickets();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!subject.trim() || !message.trim()) {
      setNotice({ type: 'error', text: 'Please add a subject and message.' });
      return;
    }

    setSaving(true);
    setNotice(null);

    try {
      await createSupportTicket({
        userId: '',
        category,
        subject,
        message,
      });
      setCategory('CONTACT_REQUEST');
      setSubject('');
      setMessage('');
      setNotice({ type: 'success', text: 'Your message has been sent to the administrator.' });
      await loadTickets();
    } catch (error: any) {
      setNotice({ type: 'error', text: error?.message || 'Failed to send your message.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Contact Administrator"
        description="Send account requests, bug reports, feature requests, or other support messages to the LocalPages.ph team."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="p-5 sm:p-6 lg:col-span-3">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <LucideLifeBuoy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Send a Message</h2>
              <p className="text-sm text-slate-500">An administrator or moderator can review your request.</p>
            </div>
          </div>

          {notice && (
            <div className={`mb-5 rounded-lg border p-3 text-sm font-medium ${
              notice.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-rose-200 bg-rose-50 text-rose-800'
            }`}>
              {notice.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="support_category" className="mb-1.5 block text-sm font-bold text-slate-700">
                Request Type
              </label>
              <select
                id="support_category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              >
                {supportCategories.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="support_subject" className="mb-1.5 block text-sm font-bold text-slate-700">
                Subject
              </label>
              <input
                id="support_subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                maxLength={140}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                placeholder="Short summary of your request"
              />
            </div>

            <div>
              <label htmlFor="support_message" className="mb-1.5 block text-sm font-bold text-slate-700">
                Message
              </label>
              <textarea
                id="support_message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={6}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                placeholder="Describe the issue, request, or feature you need."
              />
            </div>

            <Button type="submit" variant="secondary" isLoading={saving}>
              Send Message
            </Button>
          </form>
        </Card>

        <Card className="p-5 sm:p-6 lg:col-span-2">
          <div className="mb-5 flex items-center gap-3">
            <LucideMessageSquare className="h-5 w-5 text-blue-600" />
            <h2 className="font-bold text-slate-900">My Messages</h2>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">Loading messages...</p>
          ) : tickets.length === 0 ? (
            <p className="text-sm text-slate-500">No support messages yet.</p>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-700">
                      {getCategoryLabel(ticket.category)}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">
                      {ticket.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{ticket.subject}</h3>
                  <p className="mt-1 text-xs text-slate-500">{formatAppDateTime(ticket.createdAt, '')}</p>
                  {ticket.adminResponse && (
                    <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                      <p className="mb-1 text-xs font-bold uppercase text-slate-400">Admin Response</p>
                      {ticket.adminResponse}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
