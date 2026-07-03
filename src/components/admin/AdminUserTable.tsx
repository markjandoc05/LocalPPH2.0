import React from 'react';
import { UserAccount } from '@/types/admin';
import { EmptyState } from '../ui/EmptyState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';
import { Badge } from '../ui/Badge';

interface AdminUserTableProps {
  users: UserAccount[];
}

export default function AdminUserTable({ users }: AdminUserTableProps) {
  if (!users || users.length === 0) {
    return (
      <EmptyState title="No users found" description="There are no users to display." />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Joined Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <div className="font-medium text-slate-900">{user.displayName}</div>
              <div className="text-sm text-slate-500">{user.email}</div>
              <div className="text-xs text-slate-400 mt-0.5">ID: {user.id}</div>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className={`
                ${user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}
                ${user.role === 'MODERATOR' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : ''}
                ${user.role === 'BUSINESS' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                ${user.role === 'CONSUMER' ? 'bg-slate-50 text-slate-700 border-slate-200' : ''}
              `}>
                {user.role}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={user.accountStatus === 'ACTIVE' ? 'success' : 'danger'}>
                {user.accountStatus}
              </Badge>
            </TableCell>
            <TableCell className="text-sm text-slate-500">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
