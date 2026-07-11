'use client';

import { ProtectedLayout } from '@/components/auth/ProtectedLayout';
import { ROLES } from '@/lib/auth/roles';
import { usePathname } from 'next/navigation';

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isBusinessPortalRoute = pathname === '/business' || pathname.startsWith('/business/listings');

  if (!isBusinessPortalRoute) {
    return <>{children}</>;
  }

  return (
    <ProtectedLayout allowedRoles={[ROLES.BUSINESS, ROLES.ADMIN]}>
      {children}
    </ProtectedLayout>
  );
}
