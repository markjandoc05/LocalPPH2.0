import { ProtectedLayout } from '@/components/auth/ProtectedLayout';
import { ROLES } from '@/lib/auth/roles';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedLayout allowedRoles={[ROLES.ADMIN, ROLES.MODERATOR, ROLES.BUSINESS, ROLES.SUBSCRIBER]}>
      {children}
    </ProtectedLayout>
  );
}
