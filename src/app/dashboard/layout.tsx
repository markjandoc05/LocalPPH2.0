import { ProtectedLayout } from '@/components/auth/ProtectedLayout';
import { ROLES } from '@/lib/auth/roles';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedLayout allowedRoles={[ROLES.SUBSCRIBER, ROLES.BUSINESS, ROLES.ADMIN, ROLES.MODERATOR]}>
      {children}
    </ProtectedLayout>
  );
}
