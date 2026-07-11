'use client';

import Link from 'next/link';
import BusinessPortalLayout from '@/components/dashboard/BusinessPortalLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import {
  LucideBell,
  LucideLock,
  LucideShield,
  LucideUser,
} from 'lucide-react';

const settingsSections = [
  {
    title: 'Profile Information',
    description: 'Update your name, contact details, and business account address.',
    href: '/profile',
    action: 'Edit Profile',
    icon: LucideUser,
  },
  {
    title: 'Security',
    description: 'Manage email verification and password reset from your account profile.',
    href: '/profile',
    action: 'Manage Security',
    icon: LucideLock,
  },
  {
    title: 'Account Access',
    description: 'Review your account role and status for business listing management.',
    href: '/profile',
    action: 'View Account',
    icon: LucideShield,
  },
  {
    title: 'Listing Updates',
    description: 'Notification preferences are handled through your account email.',
    href: '/business/listings',
    action: 'View Listings',
    icon: LucideBell,
  },
];

export default function BusinessSettingsPage() {
  return (
    <BusinessPortalLayout>
      <PageHeader
        title="Settings"
        description="Manage your business portal account, security, and listing preferences."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {settingsSections.map((section) => {
          const Icon = section.icon;

          return (
            <div
              key={section.title}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mb-2 text-base font-bold text-slate-900">{section.title}</h2>
                <p className="text-sm leading-6 text-slate-500">{section.description}</p>
              </div>

              <Link href={section.href} className="mt-5">
                <Button variant="secondary" className="w-full text-sm font-semibold">
                  {section.action}
                </Button>
              </Link>
            </div>
          );
        })}
      </div>
    </BusinessPortalLayout>
  );
}
