'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { canManageBusiness } from '@/lib/auth/roles';
import BusinessPortalLayout from '@/components/dashboard/BusinessPortalLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { deleteBusinessInquiry, getMyBusinessInquiries, markBusinessInquiryRead, respondBusinessInquiry } from '@/lib/data-connect/business-service';
import { formatAppDateTime } from '@/lib/time';
import { parseError, handleAuthRedirect } from '@/lib/utils/error';
import { LucideInbox, LucideMail, LucideMessageSquare, LucidePhone, LucideRefreshCw, LucideSend, LucideTrash2 } from 'lucide-react';

interface BusinessInquiry {
  id: string;
  businessName?: string;
  businessSlug?: string;
  subject?: string;
  senderName?: string;
  senderEmail?: string;
  senderContactNumber?: string;
  message?: string;
  response?: string;
  respondedAt?: string;
  createdAt?: string;
  messages?: Array<{
    id: string;
    sender: 'user' | 'owner';
    body: string;
    createdAt?: string | null;
  }>;
  unreadForOwner?: boolean;
}

export default function BusinessInquiriesPage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [inquiries, setInquiries] = useState<BusinessInquiry[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const [deletingId, setDeletingId] = useState('');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [selectedInquiryId, setSelectedInquiryId] = useState('');

  const loadInquiries = useCallback(async () => {
    if (!user) return;

    setDataLoading(true);
    setError('');
    try {
      const data = await getMyBusinessInquiries(user.uid);
      const nextInquiries = data as BusinessInquiry[];
      setInquiries(nextInquiries);
      setReplyDrafts(
        Object.fromEntries(nextInquiries.map((inquiry) => [inquiry.id, '']))
      );
      setTimeout(() => {
        setSelectedInquiryId((current) =>
          nextInquiries.some((inquiry) => inquiry.id === current) ? current : nextInquiries[0]?.id || ''
        );
      }, 0);
    } catch (err: any) {
      const friendly = parseError(err);
      setError(friendly.message);
      handleAuthRedirect(friendly, router);
    } finally {
      setDataLoading(false);
    }
  }, [router, user]);

  useEffect(() => {
    if (user && canManageBusiness(role)) {
      setTimeout(() => loadInquiries(), 0);
    }
  }, [loadInquiries, role, user]);

  const handleReply = async (inquiry: BusinessInquiry) => {
    if (!user) return;

    const response = replyDrafts[inquiry.id]?.trim();
    if (!response) {
      setError('Please write a response before sending.');
      return;
    }

    setUpdatingId(inquiry.id);
    setError('');
    try {
      await respondBusinessInquiry(inquiry.id, user.uid, response);
      setInquiries((current) =>
        current.map((item) =>
          item.id === inquiry.id
            ? {
                ...item,
                response,
                respondedAt: new Date().toISOString(),
                messages: [
                  ...(item.messages || []),
                  {
                    id: `${Date.now()}`,
                    sender: 'owner',
                    body: response,
                    createdAt: new Date().toISOString(),
                  },
                ],
              }
            : item
        )
      );
      setReplyDrafts((current) => ({ ...current, [inquiry.id]: '' }));
    } catch (err: any) {
      setError(err?.message || 'Failed to send response.');
    } finally {
      setUpdatingId('');
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;

    const confirmed = window.confirm('Delete this inquiry from your inbox? The other account will keep their copy.');
    if (!confirmed) return;

    setDeletingId(id);
    setError('');
    try {
      await deleteBusinessInquiry(id, user.uid);
      setInquiries((current) => {
        const nextInquiries = current.filter((inquiry) => inquiry.id !== id);
        setTimeout(() => {
          setSelectedInquiryId((currentId) => (currentId === id ? nextInquiries[0]?.id || '' : currentId));
        }, 0);
        return nextInquiries;
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to delete inquiry.');
    } finally {
      setDeletingId('');
    }
  };

  const selectedInquiry =
    inquiries.find((inquiry) => inquiry.id === selectedInquiryId) || inquiries[0] || null;
  const unreadCount = inquiries.filter((inquiry) => inquiry.unreadForOwner).length;

  const markSelectedInquiryRead = useCallback(async (inquiry: BusinessInquiry) => {
    if (!user || !inquiry.unreadForOwner) return;

    setInquiries((current) =>
      current.map((item) => (item.id === inquiry.id ? { ...item, unreadForOwner: false } : item))
    );

    try {
      await markBusinessInquiryRead(inquiry.id, user.uid);
    } catch (err: any) {
      setError(err?.message || 'Failed to update read status.');
      setInquiries((current) =>
        current.map((item) => (item.id === inquiry.id ? { ...item, unreadForOwner: true } : item))
      );
    }
  }, [user]);

  useEffect(() => {
    if (selectedInquiry?.unreadForOwner) {
      setTimeout(() => markSelectedInquiryRead(selectedInquiry), 0);
    }
  }, [markSelectedInquiryRead, selectedInquiry]);

  const getInquiryMessages = (inquiry: BusinessInquiry) =>
    inquiry.messages?.length
      ? inquiry.messages
      : [
          {
            id: `${inquiry.id}-fallback`,
            sender: 'user' as const,
            body: inquiry.message || '',
            createdAt: inquiry.createdAt,
          },
        ];

  const getInquiryPreview = (inquiry: BusinessInquiry) => {
    const messages = getInquiryMessages(inquiry);
    return messages[messages.length - 1]?.body || 'No message yet';
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user || !canManageBusiness(role)) return null;

  return (
    <BusinessPortalLayout>
      <PageHeader
        title="Inquiry Inbox"
        description="Review and manage messages sent from your business profiles."
        actions={
          <Button type="button" variant="outline" onClick={loadInquiries} disabled={dataLoading}>
            <LucideRefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        }
      />

      {error && <ErrorState title="Inquiry Action Failed" message={error} className="mb-6" />}

      {dataLoading ? (
        <Card className="p-8 text-center text-slate-500">Loading inquiries...</Card>
      ) : inquiries.length === 0 ? (
        <Card className="p-8 text-center">
          <LucideInbox className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <h2 className="text-lg font-bold text-slate-900">No inquiries yet</h2>
          <p className="mt-1 text-sm text-slate-500">Messages from registered users will appear here.</p>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">Inbox</p>
                  <p className="text-xs text-slate-500">{inquiries.length} message thread{inquiries.length === 1 ? '' : 's'}</p>
                </div>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
                    {unreadCount} unread
                  </span>
                )}
              </div>
            </div>
            <div className="max-h-[520px] overflow-y-auto">
              {inquiries.map((inquiry) => {
                const isSelected = selectedInquiry?.id === inquiry.id;
                const isUnread = Boolean(inquiry.unreadForOwner);

                return (
                  <button
                    key={inquiry.id}
                    type="button"
                    onClick={() => {
                      setSelectedInquiryId(inquiry.id);
                      void markSelectedInquiryRead(inquiry);
                    }}
                    className={`block w-full border-b border-slate-100 px-4 py-3 text-left transition ${
                      isSelected ? 'bg-blue-50' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-center gap-2">
                          {isUnread && <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />}
                          <p className={`truncate text-sm text-slate-900 ${isUnread ? 'font-extrabold' : 'font-semibold'}`}>
                            {inquiry.subject || 'Business inquiry'}
                          </p>
                        </div>
                        <p className={`mt-1 truncate text-xs text-slate-700 ${isUnread ? 'font-bold' : 'font-medium'}`}>
                          {inquiry.senderName || 'Registered user'}
                        </p>
                      </div>
                      <span className={`shrink-0 text-[11px] ${isUnread ? 'font-bold text-blue-700' : 'text-slate-500'}`}>
                        {formatAppDateTime(inquiry.createdAt)}
                      </span>
                    </div>
                    <p className={`mt-1 truncate text-xs ${isUnread ? 'font-semibold text-slate-700' : 'text-slate-500'}`}>{inquiry.businessName || 'Business'}</p>
                    {inquiry.senderContactNumber && (
                      <p className="mt-1 truncate text-xs text-slate-500">{inquiry.senderContactNumber}</p>
                    )}
                    <p className={`mt-2 line-clamp-2 text-xs leading-5 ${isUnread ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                      {getInquiryPreview(inquiry)}
                    </p>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="border-slate-200 bg-white p-0 shadow-sm">
            {selectedInquiry && (
              <div className="flex min-h-[520px] flex-col">
                <div className="border-b border-slate-200 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                          <LucideMessageSquare className="h-4 w-4" />
                        </div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {selectedInquiry.businessName || 'Business inquiry'}
                        </p>
                      </div>
                      <h2 className="mt-3 break-words text-xl font-extrabold text-slate-900">
                        {selectedInquiry.subject || 'Business inquiry'}
                      </h2>
                      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                        <span className="font-semibold">{selectedInquiry.senderName || 'Registered user'}</span>
                        {selectedInquiry.senderEmail && (
                          <span className="inline-flex items-center gap-1 break-all">
                            <LucideMail className="h-3.5 w-3.5" />
                            {selectedInquiry.senderEmail}
                          </span>
                        )}
                        {selectedInquiry.senderContactNumber && (
                          <span className="inline-flex items-center gap-1 break-all">
                            <LucidePhone className="h-3.5 w-3.5" />
                            {selectedInquiry.senderContactNumber}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(selectedInquiry.id)}
                      disabled={deletingId === selectedInquiry.id}
                      className="text-red-700 hover:text-red-800"
                    >
                      <LucideTrash2 className="mr-1.5 h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="flex-1 space-y-3 bg-slate-50 p-4 sm:p-5">
                  {getInquiryMessages(selectedInquiry).map((message) => {
                    const isOwner = message.sender === 'owner';

                    return (
                      <div key={message.id} className={`flex ${isOwner ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                          isOwner
                            ? 'bg-blue-600 text-white'
                            : 'border border-slate-200 bg-white text-slate-800'
                        }`}>
                          <p className="whitespace-pre-wrap break-words leading-6">{message.body}</p>
                          {message.createdAt && (
                            <p className={`mt-1 text-[11px] ${isOwner ? 'text-blue-100' : 'text-slate-500'}`}>
                              {formatAppDateTime(message.createdAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-slate-200 p-4 sm:p-5">
                  <label className="block text-xs font-semibold text-slate-600">Write response</label>
                  <textarea
                    value={replyDrafts[selectedInquiry.id] || ''}
                    onChange={(event) =>
                      setReplyDrafts((current) => ({ ...current, [selectedInquiry.id]: event.target.value }))
                    }
                    rows={3}
                    placeholder="Reply to this inquiry"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleReply(selectedInquiry)}
                    disabled={updatingId === selectedInquiry.id}
                    className="mt-3 bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <LucideSend className="mr-1.5 h-3.5 w-3.5" />
                    Send Response
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </BusinessPortalLayout>
  );
}
