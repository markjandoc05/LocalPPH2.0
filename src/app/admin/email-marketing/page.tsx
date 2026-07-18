'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useAuth } from '@/lib/auth/AuthContext';
import { auth } from '@/lib/firebase/config';
import { isAdmin } from '@/lib/auth/roles';
import { LucideImage, LucideMail, LucideSearch, LucideSend, LucideUpload, LucideX } from 'lucide-react';

const roleOptions = [
  { value: 'SUBSCRIBER', label: 'Subscribers' },
  { value: 'BUSINESS', label: 'Business users' },
  { value: 'MODERATOR', label: 'Moderators' },
  { value: 'ADMIN', label: 'Administrators' },
];

const defaultSubject = 'Help more customers discover your business';
const defaultFromName = 'LocalPages.ph Team';

const defaultBody = `Hi {{first_name}},

Welcome to LocalPages.ph!

List your business to showcase your services, share important details, and improve your visibility across local and AI-powered search experiences.

Create Your Business Listing:
{{create_listing_url}}

It only takes a few minutes to get started.

Best,
The LocalPages.ph Team`;

const templateVariables = [
  '{{first_name}}',
  '{{last_name}}',
  '{{name}}',
  '{{email}}',
  '{{role}}',
  '{{create_listing_url}}',
];

type MarketingUser = {
  id: string;
  email: string;
  displayName: string;
  role: string;
};

type CampaignReport = {
  id: string;
  subject: string;
  status: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  openedCount: number;
  createdAt: string;
  recipients: Array<{
    id: string;
    email: string;
    name?: string | null;
    role?: string | null;
    status: string;
    sentAt?: string | null;
    firstOpenedAt?: string | null;
    lastOpenedAt?: string | null;
    openCount: number;
    errorMessage?: string | null;
  }>;
};

export default function EmailMarketingPage() {
  const { user, role, loading } = useAuth();
  const [recipientMode, setRecipientMode] = useState<'roles' | 'users'>('roles');
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['SUBSCRIBER']);
  const [users, setUsers] = useState<MarketingUser[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignReport[]>([]);
  const [reportsReady, setReportsReady] = useState(true);
  const [reportsMessage, setReportsMessage] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [fromName, setFromName] = useState(defaultFromName);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('LocalPages.ph email campaign');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [intervalSeconds, setIntervalSeconds] = useState('2');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadMarketingData = async () => {
    setLoadingUsers(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const res = await fetch('/api/admin/email-marketing', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load email marketing data.');
      }

      setUsers(Array.isArray(data.users) ? data.users : []);
      setCampaigns(Array.isArray(data.campaigns) ? data.campaigns : []);
      setReportsReady(data.reportsReady !== false);
      setReportsMessage(data.reportsMessage || '');
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'Failed to load email marketing data.' });
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (!user || !isAdmin(role)) return;
    const timer = window.setTimeout(() => {
      void loadMarketingData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [role, user]);

  const toggleRole = (nextRole: string) => {
    setSelectedRoles((current) =>
      current.includes(nextRole)
        ? current.filter((roleValue) => roleValue !== nextRole)
        : [...current, nextRole],
    );
  };

  const toggleUser = (userId: string) => {
    setSelectedUserIds((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId],
    );
  };

  const filteredUsers = useMemo(() => {
    const normalizedSearch = userSearch.trim().toLowerCase();
    if (!normalizedSearch) return users;

    return users.filter((registeredUser) =>
      [
        registeredUser.displayName,
        registeredUser.email,
        registeredUser.role,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedSearch)),
    );
  }, [userSearch, users]);

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setStatus(null);
    setUploadingImage(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error('You must be authenticated to upload a campaign image.');
      }

      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/admin/email-marketing/upload-image', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload campaign image.');
      }

      setImageUrl(data.url);
      setImageAlt(file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '));
      setStatus({ type: 'success', message: 'Campaign image uploaded. It will appear at the top of this email.' });
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'Failed to upload campaign image.' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus(null);

    if (recipientMode === 'roles' && selectedRoles.length === 0) {
      setStatus({ type: 'error', message: 'Select at least one user role.' });
      return;
    }

    if (recipientMode === 'users' && selectedUserIds.length === 0) {
      setStatus({ type: 'error', message: 'Select at least one registered user.' });
      return;
    }

    setSending(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error('You must be authenticated to send email marketing messages.');
      }

      const res = await fetch('/api/admin/email-marketing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roles: recipientMode === 'roles' ? selectedRoles : [],
          userIds: recipientMode === 'users' ? selectedUserIds : [],
          subject,
          body,
          fromName,
          imageUrl,
          imageAlt,
          intervalSeconds,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || 'Email marketing campaign was not sent.');
      }

      setStatus({
        type: data.failed > 0 ? 'error' : 'success',
        message: `Campaign finished. Sent: ${data.sent}. Failed: ${data.failed}. Opens will appear in the campaign report when recipients load images.`,
      });
      await loadMarketingData();
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'Failed to send email marketing campaign.' });
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user || !isAdmin(role)) return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Email Marketing"
          description="Send role-filtered or user-specific email messages to platform users."
        />

        {status && (
          <div className={`rounded-xl border p-4 text-sm font-semibold ${
            status.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}>
            {status.message}
          </div>
        )}

        {!reportsReady && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
            {reportsMessage || 'Campaign reports are not set up yet. Apply the email marketing report migration before sending campaigns.'}
          </div>
        )}

        <Card className="p-5 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <LucideMail className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Campaign Message</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Emails are sent one by one from <span className="font-semibold">support@localpages.ph</span> with the same reply-to address.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-sm font-semibold text-slate-900">Recipients</span>
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setRecipientMode('roles')}
                  className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                    recipientMode === 'roles'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  By role
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientMode('users')}
                  className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                    recipientMode === 'users'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Specific users
                </button>
              </div>
            </div>

            {recipientMode === 'roles' && (
              <div className="space-y-2">
                <span className="text-sm font-semibold text-slate-900">Recipients by role</span>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {roleOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm font-semibold transition-colors ${
                      selectedRoles.includes(option.value)
                        ? 'border-blue-200 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(option.value)}
                      onChange={() => toggleRole(option.value)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
              </div>
            )}

            {recipientMode === 'users' && (
              <div className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <label className="w-full space-y-1 sm:max-w-md">
                    <span className="text-sm font-semibold text-slate-900">Select registered users</span>
                    <div className="relative">
                      <LucideSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <Input
                        value={userSearch}
                        onChange={(event) => setUserSearch(event.target.value)}
                        placeholder="Search name, email, or role"
                        className="pl-9"
                      />
                    </div>
                  </label>
                  <p className="text-xs font-semibold text-slate-600">
                    {selectedUserIds.length} selected
                  </p>
                </div>

                <div className="max-h-72 overflow-auto rounded-xl border border-slate-200 bg-white">
                  {loadingUsers ? (
                    <div className="p-4 text-sm text-slate-600">Loading registered users...</div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="p-4 text-sm text-slate-600">No users match your search.</div>
                  ) : (
                    filteredUsers.map((registeredUser) => (
                      <label
                        key={registeredUser.id}
                        className="flex cursor-pointer items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(registeredUser.id)}
                          onChange={() => toggleUser(registeredUser.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-slate-900">
                            {registeredUser.displayName || registeredUser.email}
                          </span>
                          <span className="block truncate text-xs text-slate-600">
                            {registeredUser.email}
                          </span>
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700">
                          {registeredUser.role}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(220px,280px)_1fr_180px]">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-900">Sender display name</span>
                <Input
                  value={fromName}
                  onChange={(event) => setFromName(event.target.value)}
                  placeholder="LocalPages.ph Team"
                  required
                />
                <span className="block text-xs text-slate-500">Shows before support@localpages.ph in inboxes</span>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-900">Email subject</span>
                <Input
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="Enter a clear subject line"
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-900">Interval</span>
                <Input
                  type="number"
                  min="0"
                  max="60"
                  value={intervalSeconds}
                  onChange={(event) => setIntervalSeconds(event.target.value)}
                  required
                />
                <span className="block text-xs text-slate-500">Seconds between emails</span>
              </label>
            </div>

            <label className="space-y-2 block">
              <span className="text-sm font-semibold text-slate-900">Email body</span>
              <Textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Write your message to users..."
                rows={12}
                required
              />
              <span className="block text-xs italic text-slate-500">
                Available fields: {templateVariables.join(', ')}
              </span>
            </label>

            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <LucideImage className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-bold text-slate-900">Visual image</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    Add one JPG, PNG, or WEBP image. Keep it under 2MB so inboxes load it quickly.
                  </p>

                  {imageUrl && (
                    <label className="mt-3 block space-y-2">
                      <span className="text-xs font-semibold text-slate-700">Image alt text</span>
                      <Input
                        value={imageAlt}
                        onChange={(event) => setImageAlt(event.target.value)}
                        placeholder="Describe the image"
                      />
                    </label>
                  )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-100">
                    <LucideUpload className="mr-2 h-4 w-4" />
                    {uploadingImage ? 'Uploading...' : imageUrl ? 'Replace image' : 'Upload image'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="sr-only"
                    />
                  </label>
                  {imageUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setImageUrl('');
                        setImageAlt('LocalPages.ph email campaign');
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <LucideX className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>

              {imageUrl && (
                <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={imageAlt || 'Campaign image preview'}
                    className="h-auto max-h-80 w-full object-contain"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-600">
                Active users with matching roles or selected user accounts will receive this message individually.
              </p>
              <Button
                type="submit"
                disabled={sending || !reportsReady}
                isLoading={sending}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                <LucideSend className="mr-2 h-4 w-4" />
                Send Campaign
              </Button>
            </div>
          </form>
        </Card>

        <Card className="p-5 md:p-6">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Campaign Reports</h2>
              <p className="mt-1 text-sm text-slate-600">
                Track SMTP send results and email opens from the tracking pixel.
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={loadMarketingData} disabled={loadingUsers}>
              Refresh
            </Button>
          </div>

          {campaigns.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              {reportsReady ? 'No campaigns yet.' : 'Campaign reports will appear here after the email marketing report migration is applied.'}
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => {
                const openRate = campaign.sentCount > 0
                  ? Math.round((campaign.openedCount / campaign.sentCount) * 100)
                  : 0;

                return (
                  <details key={campaign.id} className="rounded-xl border border-slate-200 bg-white">
                    <summary className="cursor-pointer list-none p-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold text-slate-900">{campaign.subject}</h3>
                          <p className="mt-1 text-xs text-slate-500">
                            {campaign.createdAt ? new Date(campaign.createdAt).toLocaleString() : 'Date not set'} · {campaign.status}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                          <span className="rounded-lg bg-slate-50 px-3 py-2 font-semibold text-slate-700">Total: {campaign.totalRecipients}</span>
                          <span className="rounded-lg bg-emerald-50 px-3 py-2 font-semibold text-emerald-700">Sent: {campaign.sentCount}</span>
                          <span className="rounded-lg bg-red-50 px-3 py-2 font-semibold text-red-700">Failed: {campaign.failedCount}</span>
                          <span className="rounded-lg bg-blue-50 px-3 py-2 font-semibold text-blue-700">Opened: {campaign.openedCount} ({openRate}%)</span>
                        </div>
                      </div>
                    </summary>
                    <div className="border-t border-slate-100 p-4">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-100 text-slate-500">
                              <th className="py-2 pr-3 font-bold">Recipient</th>
                              <th className="py-2 pr-3 font-bold">Role</th>
                              <th className="py-2 pr-3 font-bold">Status</th>
                              <th className="py-2 pr-3 font-bold">Sent</th>
                              <th className="py-2 pr-3 font-bold">Opens</th>
                              <th className="py-2 pr-3 font-bold">Last opened</th>
                            </tr>
                          </thead>
                          <tbody>
                            {campaign.recipients.map((recipient) => (
                              <tr key={recipient.id} className="border-b border-slate-50 last:border-b-0">
                                <td className="py-2 pr-3">
                                  <span className="block font-semibold text-slate-900">{recipient.name || recipient.email}</span>
                                  <span className="block text-slate-500">{recipient.email}</span>
                                  {recipient.errorMessage && <span className="mt-1 block text-red-600">{recipient.errorMessage}</span>}
                                </td>
                                <td className="py-2 pr-3 font-semibold text-slate-700">{recipient.role || 'N/A'}</td>
                                <td className="py-2 pr-3 font-semibold text-slate-700">{recipient.status}</td>
                                <td className="py-2 pr-3 text-slate-600">{recipient.sentAt ? new Date(recipient.sentAt).toLocaleString() : 'Not sent'}</td>
                                <td className="py-2 pr-3 font-semibold text-slate-700">{recipient.openCount}</td>
                                <td className="py-2 pr-3 text-slate-600">{recipient.lastOpenedAt ? new Date(recipient.lastOpenedAt).toLocaleString() : 'Not opened'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
