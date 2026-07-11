'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getAllSupportTickets, updateSupportTicket } from '@/lib/data-connect';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LucideMail, LucideUser } from 'lucide-react';

const statuses = ['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED'];

const categoryLabels: Record<string, string> = {
  CONTACT_REQUEST: 'Contact Request',
  BUG_REPORT: 'Bug Report',
  FEATURE_REQUEST: 'Feature Request',
  ACCOUNT_HELP: 'Account Help',
  OTHER: 'Other',
};

const formatDate = (value?: string | Date) => {
  if (!value) return '';
  return new Date(value).toLocaleString('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadTickets = async () => {
    try {
      const result = await getAllSupportTickets();
      const nextTickets = result.data.supportTickets || [];
      setTickets(nextTickets);
      setResponses(Object.fromEntries(nextTickets.map((ticket: any) => [ticket.id, ticket.adminResponse || ''])));
    } catch (error) {
      console.warn('Failed to load support inbox:', error);
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

  const handleUpdate = async (ticketId: string, status?: string) => {
    setSavingId(ticketId);
    try {
      await updateSupportTicket({
        id: ticketId,
        status,
        adminResponse: responses[ticketId] || '',
      });
      await loadTickets();
    } finally {
      setSavingId(null);
    }
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Support Inbox"
        description="Review account requests, bug reports, and feature requests submitted by users."
      />

      {loading ? (
        <Card className="p-8 text-center text-slate-500">Loading support messages...</Card>
      ) : tickets.length === 0 ? (
        <Card className="p-8 text-center text-slate-500">No support messages yet.</Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => {
            const senderName = ticket.user?.displayName || [ticket.user?.firstName, ticket.user?.lastName].filter(Boolean).join(' ') || 'Unknown user';
            const senderEmail = ticket.user?.email || 'No registered email found';

            return (
              <Card key={ticket.id} className="p-5 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                        {categoryLabels[ticket.category] || ticket.category}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                        {ticket.status}
                      </span>
                      <span className="text-xs text-slate-400">{formatDate(ticket.createdAt)}</span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">{ticket.subject}</h2>
                    <div className="mt-3 grid gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600 sm:grid-cols-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <LucideUser className="h-4 w-4 shrink-0 text-slate-400" />
                        <span className="truncate">
                          <span className="font-semibold text-slate-700">Sender:</span> {senderName}
                        </span>
                      </div>
                      <div className="flex min-w-0 items-center gap-2">
                        <LucideMail className="h-4 w-4 shrink-0 text-slate-400" />
                        {ticket.user?.email ? (
                          <a href={`mailto:${ticket.user.email}`} className="truncate font-semibold text-blue-600 hover:text-blue-700">
                            {senderEmail}
                          </a>
                        ) : (
                          <span className="truncate text-slate-500">{senderEmail}</span>
                        )}
                      </div>
                    </div>
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{ticket.message}</p>
                  </div>

                  <div className="w-full space-y-3 lg:w-80">
                    <select
                      value={ticket.status}
                      onChange={(event) => handleUpdate(ticket.id, event.target.value)}
                      disabled={savingId === ticket.id}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>

                    <textarea
                      value={responses[ticket.id] || ''}
                      onChange={(event) => setResponses((current) => ({ ...current, [ticket.id]: event.target.value }))}
                      rows={4}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                      placeholder="Write an admin response..."
                    />

                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full"
                      isLoading={savingId === ticket.id}
                      onClick={() => handleUpdate(ticket.id)}
                    >
                      Save Response
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
