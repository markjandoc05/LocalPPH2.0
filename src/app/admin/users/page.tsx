'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { canAccessAdmin } from '@/lib/auth/roles';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminUserTable from '@/components/admin/AdminUserTable';
import { getAllUsers } from '@/lib/data-connect/admin-service';
import { UserAccount } from '@/types/admin';
import { PageHeader } from '@/components/ui/PageHeader';

export default function AdminUsersPage() {
  const { user, role, loading } = useAuth();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (user && canAccessAdmin(role)) {
      const fetchData = async () => {
        try {
          const data = await getAllUsers();
          setUsers(data);
        } catch (error) {
          console.error("Failed to fetch users", error);
        } finally {
          setDataLoading(false);
        }
      };
      fetchData();
    }
  }, [user, role]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user || !canAccessAdmin(role)) return null;

  return (
    <AdminLayout>
      <PageHeader
        title="User Management"
        description="Manage platform users and roles."
      />

      {dataLoading ? (
        <div className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-lg shadow-sm">Loading users...</div>
      ) : (
        <AdminUserTable users={users} />
      )}
    </AdminLayout>
  );
}
