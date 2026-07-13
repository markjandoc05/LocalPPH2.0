'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getAllSupportTickets, updateSupportTicket } from '@/lib/data-connect';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatAppDateTime } from '@/lib/time';
import { LucideInbox, LucideMail, LucideMessageSquare, LucideUser } from 'lucide-react';

const statuses = ['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED'];

const categoryLabels: Record<string, string> = {
  CONTACT_REQUEST: 'Contact Request',
  BUG_REPORT: 'Bug Report',
  FEATURE_REQUEST: 'Feature Request',
  ACCOUNT_HELP: 'Account Help',
  OTHER: 'Other',
};

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadTickets = async () => {
    try {
      const result = await getAllSupportTickets();
      const nextTickets = result.data.supportTickets || [];
      setTickets(nextTickets);
      setResponses(Object.fromEntries(nextTickets.map((ticket: any) => [ticket.id, ticket.adminResponse || ''])));
      setTimeout(() => {
        setSelectedTicketId((current) =>
          nextTickets.some((ticket: any) => ticket.id === current) ? current : nextTickets[0]?.id || ''
        );
      }, 0);
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
    setNotice(null);
    try {
      await updateSupportTicket({
        id: ticketId,
        status,
        adminResponse: responses[ticketId] || '',
      });
      await loadTickets();
      setNotice({ type: 'success', text: 'Support response saved.' });
    } catch (error: any) {
      setNotice({ type: 'error', text: error?.message || 'Failed to save support response.' });
    } finally {
      setSavingId(null);
    }
  };

  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId) || tickets[0] || null;
  const selectedSenderName = selectedTicket
    ? selectedTicket.user?.displayName || [selectedTicket.user?.firstName, selectedTicket.user?.lastName].filter(Boolean).join(' ') || 'Unknown user'
    : '';
  const selectedSenderEmail = selectedTicket?.user?.email || 'No registered email found';

  return (
    <AdminLayout>
      <PageHeader
        title="Support Inbox"
        description="Review account requests, bug reports, and feature requests submitted by users."
      />

      {notice && (
        <div className={`mb-4 rounded-xl border px-4 py-3 text-sm font-semibold ${
          notice.type === 'success'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
            : 'border-rose-200 bg-rose-50 text-rose-800'
        }`}>
          {notice.text}
        </div>
      )}

      {loading ? (
        <Card className="p-8 text-center text-slate-500">Loading support messages...</Card>
      ) : tickets.length === 0 ? (
        <Card className="p-8 text-center text-slate-500">No support messages yet.</Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
          <Card className="overflow-hidden border-slate-200 bg-white p-0 shadow-sm">
            <div className="border-b border-slate-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <LucideInbox className="h-4 w-4 text-blue-600" />
                <p className="text-sm font-bold text-slate-900">Inbox</p>
              </div>
              <p className="mt-1 text-xs text-slate-500">{tickets.length} support ticket{tickets.length === 1 ? '' : 's'}</p>
            </div>
            <div className="max-h-[620px] overflow-y-auto">
              {tickets.map((ticket) => {
                const isSelected = selectedTicket?.id === ticket.id;
                const senderName = ticket.user?.displayName || [ticket.user?.firstName, ticket.user?.lastName].filter(Boolean).join(' ') || 'Unknown user';

                return (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className={`block w-full border-b border-slate-100 px-4 py-3 text-left transition ${
                      isSelected ? 'bg-blue-50' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">
                        {categoryLabels[ticket.category] || ticket.category}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                        {ticket.status}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">{ticket.subject}</p>
                        <p className="mt-1 truncate text-xs font-semibold text-slate-700">From: {senderName}</p>
                      </div>
                      <span className="shrink-0 text-[11px] text-slate-500">{formatAppDateTime(ticket.createdAt, '')}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="border-slate-200 bg-white p-0 shadow-sm">
            {selectedTicket && (
              <div className="flex min-h-[620px] flex-col">
                <div className="border-b border-slate-200 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                          {categoryLabels[selectedTicket.category] || selectedTicket.category}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                          {selectedTicket.status}
                        </span>
                        <span className="text-xs text-slate-400">{formatAppDateTime(selectedTicket.createdAt, '')}</span>
                      </div>
                      <h2 className="mt-3 break-words text-xl font-extrabold text-slate-900">{selectedTicket.subject}</h2>
                    </div>
                    <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                      <LucideMessageSquare className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600 sm:grid-cols-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <LucideUser className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="truncate">
                        <span className="font-semibold text-slate-700">Sender:</span> {selectedSenderName}
                      </span>
                    </div>
                    <div className="flex min-w-0 items-center gap-2">
                      <LucideMail className="h-4 w-4 shrink-0 text-slate-400" />
                      {selectedTicket.user?.email ? (
                        <a href={`mailto:${selectedTicket.user.email}`} className="truncate font-semibold text-blue-600 hover:text-blue-700">
                          {selectedSenderEmail}
                        </a>
                      ) : (
                        <span className="truncate text-slate-500">{selectedSenderEmail}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 bg-slate-50 p-4 sm:p-5">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700 shadow-sm">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">User Message</p>
                    <p className="whitespace-pre-wrap break-words">{selectedTicket.message}</p>
                  </div>
                  {selectedTicket.adminResponse && (
                    <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-slate-800 shadow-sm">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-blue-500">Admin Response</p>
                      <p className="whitespace-pre-wrap break-words">{selectedTicket.adminResponse}</p>
                      {selectedTicket.respondedAt && (
                        <p className="mt-2 text-xs font-medium text-blue-500">
                          Sent {formatAppDateTime(selectedTicket.respondedAt, '')}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-200 p-4 sm:p-5">
                  <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
                    <select
                      value={selectedTicket.status}
                      onChange={(event) => handleUpdate(selectedTicket.id, event.target.value)}
                      disabled={savingId === selectedTicket.id}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>

                    <textarea
                      value={responses[selectedTicket.id] || ''}
                      onChange={(event) => setResponses((current) => ({ ...current, [selectedTicket.id]: event.target.value }))}
                      rows={3}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                      placeholder="Write an admin response..."
                    />
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-3 w-full sm:w-auto"
                    isLoading={savingId === selectedTicket.id}
                    onClick={() => handleUpdate(selectedTicket.id, selectedTicket.status)}
                  >
                    Save Response
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
