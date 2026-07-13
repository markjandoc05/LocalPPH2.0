'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { deleteMyBusinessInquiry, getMySentBusinessInquiries, markMyBusinessInquiryRead, replyMyBusinessInquiry } from '@/lib/data-connect';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { formatAppDateTime } from '@/lib/time';
import { LucideInbox, LucideMessageSquare, LucidePhone, LucideRefreshCw, LucideSend, LucideTrash2 } from 'lucide-react';

interface SentInquiry {
  id: string;
  businessName?: string;
  businessSlug?: string;
  subject?: string;
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
  unreadForSender?: boolean;
}

export default function MyInquiriesPage() {
  const { user, loading } = useAuth();
  const [inquiries, setInquiries] = useState<SentInquiry[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState('');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [sendingId, setSendingId] = useState('');
  const [selectedInquiryId, setSelectedInquiryId] = useState('');

  const loadInquiries = useCallback(async () => {
    if (!user) return;

    setDataLoading(true);
    setError('');
    try {
      const result = await getMySentBusinessInquiries({ userId: user.uid });
      const nextInquiries = result.data.inquiries as SentInquiry[];
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
      setError(err?.message || 'Failed to load your inquiries.');
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setTimeout(() => loadInquiries(), 0);
    } else if (!loading) {
      setTimeout(() => setDataLoading(false), 0);
    }
  }, [loadInquiries, loading, user]);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Delete this inquiry from your inbox? The business will keep their copy.');
    if (!confirmed) return;

    setDeletingId(id);
    setError('');
    try {
      await deleteMyBusinessInquiry({ id, userId: user?.uid || '' });
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
  const unreadCount = inquiries.filter((inquiry) => inquiry.unreadForSender).length;

  const getInquiryMessages = (inquiry: SentInquiry) =>
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

  const markSelectedInquiryRead = useCallback(async (inquiry: SentInquiry) => {
    if (!user || !inquiry.unreadForSender) return;

    setInquiries((current) =>
      current.map((item) => (item.id === inquiry.id ? { ...item, unreadForSender: false } : item))
    );

    try {
      await markMyBusinessInquiryRead({ id: inquiry.id, userId: user.uid });
    } catch (err: any) {
      setError(err?.message || 'Failed to update read status.');
      setInquiries((current) =>
        current.map((item) => (item.id === inquiry.id ? { ...item, unreadForSender: true } : item))
      );
    }
  }, [user]);

  useEffect(() => {
    if (selectedInquiry?.unreadForSender) {
      setTimeout(() => markSelectedInquiryRead(selectedInquiry), 0);
    }
  }, [markSelectedInquiryRead, selectedInquiry]);

  const handleReply = async (inquiry: SentInquiry) => {
    const response = replyDrafts[inquiry.id]?.trim();
    if (!response) {
      setError('Please write a message before sending.');
      return;
    }

    setSendingId(inquiry.id);
    setError('');
    try {
      await replyMyBusinessInquiry({ id: inquiry.id, userId: user?.uid || '', response });
      setInquiries((current) =>
        current.map((item) =>
          item.id === inquiry.id
            ? {
                ...item,
                messages: [
                  ...(item.messages || []),
                  {
                    id: `${Date.now()}`,
                    sender: 'user',
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
      setError(err?.message || 'Failed to send message.');
    } finally {
      setSendingId('');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-8 md:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">My Inquiries</h1>
            <p className="mt-2 text-slate-600">Read business replies and manage the messages you sent.</p>
          </div>
          <Button type="button" variant="outline" onClick={loadInquiries} disabled={dataLoading}>
            <LucideRefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {error && <ErrorState title="Inquiry Action Failed" message={error} className="mb-6" />}

        {dataLoading ? (
          <Card className="p-8 text-center text-slate-500">Loading inquiries...</Card>
        ) : inquiries.length === 0 ? (
          <Card className="p-8 text-center">
            <LucideInbox className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <h2 className="text-lg font-bold text-slate-900">No inquiries yet</h2>
            <p className="mt-1 text-sm text-slate-500">Your sent business messages will appear here.</p>
            <Link href="/search" className="mt-5 inline-flex">
              <Button type="button" variant="secondary">Find Businesses</Button>
            </Link>
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
                  const isUnread = Boolean(inquiry.unreadForSender);

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
                            From: {inquiry.businessName || 'Business'}
                          </p>
                        </div>
                        <span className={`shrink-0 text-[11px] ${isUnread ? 'font-bold text-blue-700' : 'text-slate-500'}`}>
                          {formatAppDateTime(inquiry.createdAt)}
                        </span>
                      </div>
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
                            {selectedInquiry.businessName || 'Business'}
                          </p>
                        </div>
                        <h2 className="mt-3 break-words text-xl font-extrabold text-slate-900">
                          {selectedInquiry.subject || 'Business inquiry'}
                        </h2>
                        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                          <span>{formatAppDateTime(selectedInquiry.createdAt)}</span>
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
                        aria-label="Delete inquiry"
                        title="Delete inquiry"
                        className="h-9 w-9 p-0 text-red-700 hover:text-red-800 sm:w-auto sm:px-3"
                      >
                        <LucideTrash2 className="h-3.5 w-3.5 sm:mr-1.5" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1 space-y-3 bg-slate-50 p-4 sm:p-5">
                    {getInquiryMessages(selectedInquiry).map((message) => {
                      const isUser = message.sender === 'user';

                      return (
                        <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                            isUser
                              ? 'bg-blue-600 text-white'
                              : 'border border-slate-200 bg-white text-slate-800'
                          }`}>
                            <p className="whitespace-pre-wrap break-words leading-6">{message.body}</p>
                            {message.createdAt && (
                              <p className={`mt-1 text-[11px] ${isUser ? 'text-blue-100' : 'text-slate-500'}`}>
                                {formatAppDateTime(message.createdAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-200 p-4 sm:p-5">
                    <label className="block text-xs font-semibold text-slate-600">Write message</label>
                    <textarea
                      value={replyDrafts[selectedInquiry.id] || ''}
                      onChange={(event) =>
                        setReplyDrafts((current) => ({ ...current, [selectedInquiry.id]: event.target.value }))
                      }
                      rows={3}
                      placeholder="Reply to the business"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleReply(selectedInquiry)}
                      disabled={sendingId === selectedInquiry.id}
                      className="mt-3 bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <LucideSend className="mr-1.5 h-3.5 w-3.5" />
                      Send Message
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
