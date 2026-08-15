'use client';

import { useState } from 'react';
import { LucideAlertCircle, LucideCheckCircle, LucideGlobe, LucideLoader2, LucideSearch, LucideUserPlus, LucideX } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { createSupportTicket } from '@/lib/data-connect';
import { canManageBusiness, normalizeRole, ROLES } from '@/lib/auth/roles';

export default function WhyLocalPagesSection() {
  const features = [
    {
      title: 'Build another online presence',
      description: 'Give your business a dedicated public profile beyond social media.',
      icon: LucideGlobe,
    },
    {
      title: 'Be easier to discover',
      description: 'Help customers searching for local services find accurate information about you.',
      icon: LucideSearch,
    },
    {
      title: 'Keep your information clear',
      description: 'Share your category, location, contact details, hours, and services in one place.',
      icon: LucideCheckCircle,
    },
  ];

  return (
    <section>
        <div className="mx-auto mb-12 max-w-5xl text-center lg:mb-16">
          <div>
            <h2 className="text-4xl font-bold leading-[1.05] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              <span className="block lg:whitespace-nowrap">Help more customers discover</span>
              <span className="block">your business online</span>
            </h2>
            <p className="mx-auto mt-7 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
              Create a public LocalPages.ph profile that gives customers, search engines, and AI-powered search tools another accurate source of information about your business.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {features.map((feature) => (
                <div key={feature.title} className="flex min-h-64 flex-col items-center rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm sm:p-10">
                    <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
                      <feature.icon className="h-11 w-11" />
                    </div>
                    <h3 className="mb-3 text-xl font-bold leading-tight text-slate-900">{feature.title}</h3>
                    <p className="max-w-xs text-sm leading-6 text-slate-600">{feature.description}</p>
                </div>
            ))}
        </div>
    </section>
  );
}

export function BusinessOwnerCTA() {
    const router = useRouter();
    const { user, role, loading } = useAuth();
    const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
    const [requestingUpgrade, setRequestingUpgrade] = useState(false);
    const [upgradeMessage, setUpgradeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const currentRole = normalizeRole(role);
    const isPublicViewer = !loading && !user;
    const canCreateListing = user && canManageBusiness(currentRole);
    const isSubscriber = user && currentRole === ROLES.SUBSCRIBER;

    const handleCtaClick = async () => {
        if (loading) return;

        if (canCreateListing) {
            router.push('/business/listings/new');
            return;
        }

        if (isSubscriber) {
            setUpgradeMessage(null);
            setShowUpgradePrompt(true);
            return;
        }

        router.push('/auth/register');
    };

    const handleRequestUpgrade = async () => {
        if (!user) {
            router.push('/auth/register');
            return;
        }

        setRequestingUpgrade(true);
        setUpgradeMessage(null);

        try {
            await createSupportTicket({
                userId: user.uid,
                category: 'ACCOUNT_UPGRADE',
                subject: 'Business account upgrade request',
                message: 'I would like to upgrade my LocalPages.ph account from Subscriber to Business so I can create and manage business listings.',
            });

            setUpgradeMessage({
                type: 'success',
                text: 'Your upgrade request was sent. An administrator will review it in User Management.',
            });
        } catch (error: any) {
            console.error('Business upgrade request error:', error);
            setUpgradeMessage({
                type: 'error',
                text: error?.message || 'Failed to send upgrade request. Please try again.',
            });
        } finally {
            setRequestingUpgrade(false);
        }
    };

    return (
        <>
            <section className="rounded-3xl bg-[#0C0C1C] p-8 text-white sm:p-10">
                <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:gap-4">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Be Visible. Be Searchable. Be AI-Ready.</h2>
                        <p className="mt-3 max-w-none text-base leading-7 text-slate-100 lg:whitespace-nowrap">Get listed on LocalPages.ph and improve your visibility across Google and AI-powered search.</p>
                    </div>
                    {isPublicViewer ? (
                        <Link href="/auth/register" className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-7 py-4 text-base font-bold text-blue-700 transition-colors hover:bg-blue-50 sm:px-8">
                            Create Free Business Listing
                        </Link>
                    ) : (
                        <button
                            type="button"
                            onClick={handleCtaClick}
                            disabled={loading}
                            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-7 py-4 text-base font-bold text-blue-700 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-70 sm:px-8"
                        >
                            {loading ? 'Checking Account...' : 'Create Free Business Listing'}
                        </button>
                    )}
                </div>
            </section>

            {showUpgradePrompt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
                    <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
                        <div className="mb-4 flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <LucideUserPlus className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Upgrade to list a business</h3>
                                    <p className="mt-1 text-sm leading-6 text-slate-600">
                                        Business listings are available for Business accounts. Send an upgrade request and an administrator will review it.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowUpgradePrompt(false)}
                                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                                aria-label="Close upgrade prompt"
                            >
                                <LucideX className="h-5 w-5" />
                            </button>
                        </div>

                        {upgradeMessage && (
                            <div className={`mb-4 flex items-start gap-2 rounded-xl border p-3 text-sm ${
                                upgradeMessage.type === 'success'
                                    ? 'border-green-200 bg-green-50 text-green-700'
                                    : 'border-red-200 bg-red-50 text-red-700'
                            }`}>
                                <LucideAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>{upgradeMessage.text}</span>
                            </div>
                        )}

                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setShowUpgradePrompt(false)}
                                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                            >
                                Not Now
                            </button>
                            <button
                                type="button"
                                onClick={handleRequestUpgrade}
                                disabled={requestingUpgrade || upgradeMessage?.type === 'success'}
                                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {requestingUpgrade && <LucideLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {upgradeMessage?.type === 'success' ? 'Request Sent' : 'Request Upgrade'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
