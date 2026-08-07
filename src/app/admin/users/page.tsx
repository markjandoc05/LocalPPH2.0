'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { canAccessAdmin } from '@/lib/auth/roles';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminUserTable from '@/components/admin/AdminUserTable';
import { getAllSupportTickets, getAllUsers } from '@/lib/data-connect/admin-service';
import { SupportTicket, UserAccount } from '@/types/admin';
import { PageHeader } from '@/components/ui/PageHeader';
import { ErrorState } from '@/components/ui/ErrorState';
import { parseError, handleAuthRedirect } from '@/lib/utils/error';

export default function AdminUsersPage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && canAccessAdmin(role)) {
      const fetchData = async () => {
        try {
          const [usersData, ticketsData] = await Promise.all([
            getAllUsers(),
            getAllSupportTickets(),
          ]);
          setUsers(usersData);
          setSupportTickets(ticketsData);
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
        description="Manage platform users and roles, ordered by registration date."
      />

      {error ? (
        <ErrorState title="Failed to Load Users" message={error} />
      ) : dataLoading ? (
        <div className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-lg shadow-sm">Loading users...</div>
      ) : (
        <AdminUserTable
          users={users}
          onUserStatusChange={(id, accountStatus) => {
            setUsers((currentUsers) =>
              currentUsers.map((currentUser) =>
                currentUser.id === id
                  ? { ...currentUser, accountStatus }
                  : currentUser
              )
            );
          }}
          onUserDeleted={(id) => {
            setUsers((currentUsers) =>
              currentUsers.filter((currentUser) => currentUser.id !== id)
            );
          }}
          upgradeRequests={supportTickets.filter((ticket) => ticket.category === 'ACCOUNT_UPGRADE')}
          onUserRoleChange={(id, nextRole) => {
            setUsers((currentUsers) =>
              currentUsers.map((currentUser) =>
                currentUser.id === id
                  ? { ...currentUser, role: nextRole }
                  : currentUser
              )
            );
          }}
          onUpgradeRequestResolved={(ticketId) => {
            setSupportTickets((currentTickets) =>
              currentTickets.map((ticket) =>
                ticket.id === ticketId
                  ? { ...ticket, status: 'RESOLVED' }
                  : ticket
              )
            );
          }}
        />
      )}
    </AdminLayout>
  );
}
