'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { canAccessAdmin } from '@/lib/auth/roles';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminUserTable from '@/components/admin/AdminUserTable';
import { getAllUsers } from '@/lib/data-connect/admin-service';
import { UserAccount } from '@/types/admin';
import { PageHeader } from '@/components/ui/PageHeader';
import { ErrorState } from '@/components/ui/ErrorState';
import { parseError, handleAuthRedirect } from '@/lib/utils/error';

export default function AdminUsersPage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && canAccessAdmin(role)) {
      const fetchData = async () => {
        try {
          const data = await getAllUsers();
          setUsers(data);
        } catch (err: any) {
          const friendly = parseError(err);
          setError(friendly.message);
          handleAuthRedirect(friendly, router);
        } finally {
          setDataLoading(false);
        }
      };
      fetchData();
    }
  }, [user, role, router]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user || !canAccessAdmin(role)) return null;

  return (
    <AdminLayout>
      <PageHeader
        title="User Management"
        description="Manage platform users and roles."
      />

      {error ? (
        <ErrorState title="Failed to Load Users" message={error} />
      ) : dataLoading ? (
        <div className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-lg shadow-sm">Loading users...</div>
      ) : (
        <AdminUserTable users={users} />
      )}
    </AdminLayout>
  );
}
