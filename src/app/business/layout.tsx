"use client";

import { ProtectedLayout } from '@/components/auth/ProtectedLayout';
import { ROLES } from '@/lib/auth/roles';
import { usePathname } from 'next/navigation';

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isProtectedBusinessRoute =
    pathname === '/business' ||
    pathname.startsWith('/business/listings') ||
    pathname.startsWith('/business/settings');

  if (!isProtectedBusinessRoute) {
    return <>{children}</>;
  }

  return (
    <ProtectedLayout allowedRoles={[ROLES.BUSINESS, ROLES.ADMIN]}>
      {children}
    </ProtectedLayout>
  );
}
