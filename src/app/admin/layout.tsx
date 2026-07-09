import { ProtectedLayout } from '@/components/auth/ProtectedLayout';
import { ROLES } from '@/lib/auth/roles';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedLayout allowedRoles={[ROLES.ADMIN, ROLES.MODERATOR]}>
      {children}
    </ProtectedLayout>
  );
}
