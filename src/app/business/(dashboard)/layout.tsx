import { ProtectedLayout } from '@/components/auth/ProtectedLayout';
import { ROLES } from '@/lib/auth/roles';

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedLayout allowedRoles={[ROLES.BUSINESS, ROLES.ADMIN]}>
      {children}
    </ProtectedLayout>
  );
}
