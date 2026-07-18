'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { SupportTicket, UserAccount } from '@/types/admin';
import { EmptyState } from '../ui/EmptyState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { useAuth } from '@/lib/auth/AuthContext';
import { isAdmin, normalizeRole } from '@/lib/auth/roles';
import { getUserById, getMyBusinesses, updateSupportTicket } from '@/lib/data-connect';
import { deleteUserAccount, updateUserAccountStatus, updateUserRole } from '@/lib/data-connect/admin-service';
import { formatAppDate, formatAppDateTime } from '@/lib/time';
import { BusinessListing } from '@/types/business';
import { 
  LucideBan,
  LucideUser, 
  LucidePhone, 
  LucideMapPin, 
  LucideEye,
  LucideBuilding,
  LucideBookmark,
  LucideChevronLeft,
  LucideChevronRight,
  LucideDownload,
  LucideFilter,
  LucideRotateCcw,
  LucideSearch,
  LucideSlidersHorizontal,
  LucideTrash2,
  LucideUserCheck,
  LucideArrowUpCircle
} from 'lucide-react';

interface AdminUserTableProps {
  users: UserAccount[];
  upgradeRequests?: SupportTicket[];
  onUserStatusChange?: (id: string, accountStatus: string) => void;
  onUserRoleChange?: (id: string, nextRole: string) => void;
  onUserDeleted?: (id: string) => void;
  onUpgradeRequestResolved?: (ticketId: string) => void;
}

type AccountAction = 'BAN' | 'DELETE' | 'UNBAN';

type RoleFilter = 'ALL' | 'ADMIN' | 'MODERATOR' | 'BUSINESS' | 'SUBSCRIBER';
type StatusFilter = 'ALL' | string;
type UserSortOption = 'created_desc' | 'created_asc' | 'name_asc' | 'name_desc' | 'email_asc' | 'role_asc' | 'status_asc';

const roleOptions: { value: RoleFilter; label: string }[] = [
  { value: 'ALL', label: 'All roles' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'MODERATOR', label: 'Moderator' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'SUBSCRIBER', label: 'Subscriber' },
];

const sortOptions: { value: UserSortOption; label: string }[] = [
  { value: 'created_desc', label: 'Newest joined' },
  { value: 'created_asc', label: 'Oldest joined' },
  { value: 'name_asc', label: 'Name A-Z' },
  { value: 'name_desc', label: 'Name Z-A' },
  { value: 'email_asc', label: 'Email A-Z' },
  { value: 'role_asc', label: 'Role A-Z' },
  { value: 'status_asc', label: 'Status A-Z' },
];

const getDateValue = (value?: string) => value ? new Date(value).getTime() || 0 : 0;
const USERS_PER_PAGE = 10;

const displayValue = (value?: string | null) => value?.trim() || 'Not set';

const escapeCsvValue = (value?: string | null) => {
  const text = String(value || '').replace(/\r?\n|\r/g, ' ').trim();
  return `"${text.replace(/"/g, '""')}"`;
};

export default function AdminUserTable({
  users,
  upgradeRequests = [],
  onUserStatusChange,
  onUserRoleChange,
  onUserDeleted,
  onUpgradeRequestResolved,
}: AdminUserTableProps) {
  const { user: currentUser, role } = useAuth();
  const isCurrentUserAdmin = isAdmin(role);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [joinedFrom, setJoinedFrom] = useState('');
  const [joinedTo, setJoinedTo] = useState('');
  const [sortBy, setSortBy] = useState<UserSortOption>('created_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [fullUserData, setFullUserData] = useState<any | null>(null);
  const [userBusinesses, setUserBusinesses] = useState<BusinessListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accountAction, setAccountAction] = useState<AccountAction | null>(null);
  const [actionUser, setActionUser] = useState<UserAccount | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [roleActionLoading, setRoleActionLoading] = useState(false);
  const [roleActionError, setRoleActionError] = useState('');
  const [roleActionNotice, setRoleActionNotice] = useState<{ type: 'success' | 'warning'; message: string } | null>(null);
  const [resolvedUpgradeRequestIds, setResolvedUpgradeRequestIds] = useState<Set<string>>(() => new Set());

  // Fetch full details when a user is selected
  useEffect(() => {
    if (!selectedUser || !isOpen) return;

    const fetchDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const userRes = await getUserById({ id: selectedUser.id });
        if (userRes?.data?.user) {
          setFullUserData(userRes.data.user);
        } else {
          setFullUserData(selectedUser); // fallback
        }

        if (normalizeRole(selectedUser.role) === 'BUSINESS') {
          const businessRes = await getMyBusinesses({ ownerId: selectedUser.id });
          if (businessRes?.data?.businesses) {
            setUserBusinesses(businessRes.data.businesses);
          }
        }
      } catch (err: any) {
        console.error("Error loading user details:", err);
        setError("Failed to fetch full user details or unauthorized.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [selectedUser, isOpen]);

  const pendingUpgradeByUserId = useMemo(() => {
    const pending = new Map<string, SupportTicket>();

    upgradeRequests.forEach((request) => {
      if (!request.userId || request.category !== 'ACCOUNT_UPGRADE') return;
      if (resolvedUpgradeRequestIds.has(request.id)) return;
      if (['RESOLVED', 'CLOSED'].includes(request.status)) return;

      const existing = pending.get(request.userId);
      if (!existing || getDateValue(request.createdAt) > getDateValue(existing.createdAt)) {
        pending.set(request.userId, request);
      }
    });

    return pending;
  }, [upgradeRequests, resolvedUpgradeRequestIds]);

  const selectedUpgradeRequest = selectedUser ? pendingUpgradeByUserId.get(selectedUser.id) : null;

  const handleOpenDetails = (user: UserAccount) => {
    setSelectedUser(user);
    setFullUserData(null);
    setUserBusinesses([]);
    setRoleActionError('');
    setRoleActionNotice(null);
    setIsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsOpen(false);
    setSelectedUser(null);
    setFullUserData(null);
    setUserBusinesses([]);
    setRoleActionError('');
    setRoleActionNotice(null);
  };

  const handleApproveBusinessUpgrade = async () => {
    if (!selectedUser || !selectedUpgradeRequest) return;

    try {
      setRoleActionLoading(true);
      setRoleActionError('');
      setRoleActionNotice(null);
      const result = await updateUserRole(selectedUser.id, 'BUSINESS');
      await updateSupportTicket({
        id: selectedUpgradeRequest.id,
        status: 'RESOLVED',
        adminResponse: 'Approved. Account upgraded from Subscriber to Business.',
      });

      setSelectedUser((previous) => previous ? { ...previous, role: 'BUSINESS' } : previous);
      setFullUserData((previous: any) => previous ? { ...previous, role: 'BUSINESS' } : previous);
      setUserBusinesses([]);
      setResolvedUpgradeRequestIds((previous) => new Set(previous).add(selectedUpgradeRequest.id));
      onUserRoleChange?.(selectedUser.id, 'BUSINESS');
      onUpgradeRequestResolved?.(selectedUpgradeRequest.id);
      const emailResult = result?.upgradeEmailNotification;
      if (emailResult?.sent) {
        setRoleActionNotice({
          type: 'success',
          message: `Account upgraded to Business. Email notification was accepted by SMTP${emailResult.messageId ? ` (${emailResult.messageId})` : ''}.`,
        });
      } else {
        setRoleActionNotice({
          type: 'warning',
          message: `Account upgraded to Business, but email was not sent${emailResult?.message ? `: ${emailResult.message}` : emailResult?.reason ? `: ${emailResult.reason}` : '.'}`,
        });
      }
    } catch (err: any) {
      setRoleActionError(err?.message || 'Failed to approve account upgrade request.');
    } finally {
      setRoleActionLoading(false);
    }
  };

  const openAccountAction = (action: AccountAction, targetUser: UserAccount) => {
    setAccountAction(action);
    setActionUser(targetUser);
    setActionError('');
  };

  const closeAccountAction = () => {
    if (actionLoading) return;
    setAccountAction(null);
    setActionUser(null);
    setActionError('');
  };

  const confirmAccountAction = async () => {
    if (!accountAction || !actionUser) return;

    try {
      setActionLoading(true);
      setActionError('');

      if (accountAction === 'DELETE') {
        await deleteUserAccount(actionUser.id);
        onUserDeleted?.(actionUser.id);
        if (selectedUser?.id === actionUser.id) {
          handleCloseDetails();
        }
        setAccountAction(null);
        setActionUser(null);
        return;
      }

      const nextStatus = accountAction === 'BAN' ? 'BANNED' : 'ACTIVE';
      await updateUserAccountStatus(actionUser.id, nextStatus);
      onUserStatusChange?.(actionUser.id, nextStatus);
      if (selectedUser?.id === actionUser.id) {
        setSelectedUser((previous) => previous ? { ...previous, accountStatus: nextStatus } : previous);
        setFullUserData((previous: any) => previous ? { ...previous, accountStatus: nextStatus } : previous);
      }
      setAccountAction(null);
      setActionUser(null);
    } catch (err: any) {
      setActionError(err?.message || 'Failed to update user account status.');
    } finally {
      setActionLoading(false);
    }
  };

  const statusOptions = useMemo(() => {
    const statuses = Array.from(new Set(users.map((user) => user.accountStatus).filter(Boolean))).sort();
    return [
      { value: 'ALL', label: 'All statuses' },
      ...statuses.map((status) => ({ value: status, label: status })),
    ];
  }, [users]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const fromDate = joinedFrom ? new Date(`${joinedFrom}T00:00:00`).getTime() : null;
    const toDate = joinedTo ? new Date(`${joinedTo}T23:59:59`).getTime() : null;

    return users
      .filter((user) => {
        if (roleFilter !== 'ALL' && normalizeRole(user.role) !== roleFilter) return false;
        if (statusFilter !== 'ALL' && user.accountStatus !== statusFilter) return false;

        const joinedAt = getDateValue(user.createdAt);
        if (fromDate && joinedAt < fromDate) return false;
        if (toDate && joinedAt > toDate) return false;

        if (!normalizedSearch) return true;

        return [
          user.displayName,
          user.email,
          user.id,
          user.role,
          user.accountStatus,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedSearch));
      })
      .sort((a, b) => {
        const aName = a.displayName || 'No Name';
        const bName = b.displayName || 'No Name';

        switch (sortBy) {
          case 'created_asc':
            return getDateValue(a.createdAt) - getDateValue(b.createdAt);
          case 'name_asc':
            return aName.localeCompare(bName);
          case 'name_desc':
            return bName.localeCompare(aName);
          case 'email_asc':
            return a.email.localeCompare(b.email);
          case 'role_asc':
            return normalizeRole(a.role).localeCompare(normalizeRole(b.role));
          case 'status_asc':
            return a.accountStatus.localeCompare(b.accountStatus);
          case 'created_desc':
          default:
            return getDateValue(b.createdAt) - getDateValue(a.createdAt);
        }
      });
  }, [joinedFrom, joinedTo, roleFilter, searchTerm, sortBy, statusFilter, users]);

  const hasActiveFilters = searchTerm || roleFilter !== 'ALL' || statusFilter !== 'ALL' || joinedFrom || joinedTo || sortBy !== 'created_desc';
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  const visiblePage = Math.min(currentPage, totalPages);
  const pageStart = (visiblePage - 1) * USERS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(pageStart, pageStart + USERS_PER_PAGE);
  const pageEnd = Math.min(pageStart + USERS_PER_PAGE, filteredUsers.length);

  const resetFilters = () => {
    setSearchTerm('');
    setRoleFilter('ALL');
    setStatusFilter('ALL');
    setJoinedFrom('');
    setJoinedTo('');
    setSortBy('created_desc');
    setCurrentPage(1);
  };

  const exportFilteredUsersCsv = () => {
    const rows = [
      ['Name', 'Email', 'User Role'],
      ...filteredUsers.map((user) => [
        user.displayName || 'No Name',
        user.email || '',
        normalizeRole(user.role),
      ]),
    ];
    const csv = rows
      .map((row) => row.map((value) => escapeCsvValue(value)).join(','))
      .join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const roleSuffix = roleFilter === 'ALL' ? 'all-users' : roleFilter.toLowerCase();

    link.href = url;
    link.download = `localpages-${roleSuffix}-contacts.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  if (!users || users.length === 0) {
    return (
      <EmptyState title="No users found" description="There are no users to display." />
    );
  }

  // Business metrics helper
  const getBusinessStatusCounts = () => {
    const counts = {
      total: userBusinesses.length,
      draft: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      revision: 0,
    };

    userBusinesses.forEach(b => {
      switch (b.status) {
        case 'DRAFT':
          counts.draft++;
          break;
        case 'PENDING':
          counts.pending++;
          break;
        case 'APPROVED':
          counts.approved++;
          break;
        case 'REJECTED':
          counts.rejected++;
          break;
        case 'REVISION_REQUESTED':
          counts.revision++;
          break;
      }
    });

    return counts;
  };

  const statusCounts = getBusinessStatusCounts();
  const detailFieldClass = "text-slate-700 font-medium";
  const detailValueClass = "text-slate-900 mt-0.5 break-words";

  const renderDetailField = (label: string, value?: string | null, options?: { mono?: boolean; breakAll?: boolean }) => (
    <div>
      <span className={detailFieldClass}>{label}</span>
      <p className={`${detailValueClass} ${options?.mono ? 'font-mono text-[10px]' : ''} ${options?.breakAll ? 'break-all' : ''}`}>
        {displayValue(value)}
      </p>
    </div>
  );

  const profileCompletionFields = fullUserData ? [
    fullUserData.firstName,
    fullUserData.lastName,
    fullUserData.mobileNumber,
    fullUserData.addressLine1,
    fullUserData.region,
    fullUserData.province,
    fullUserData.city,
    fullUserData.barangay,
    fullUserData.zipCode,
  ] : [];
  const completedProfileFields = profileCompletionFields.filter((value) => Boolean(String(value || '').trim())).length;
  const profileCompletionText = `${completedProfileFields}/${profileCompletionFields.length} required profile fields`;

  return (
    <>
      <div className="space-y-4">
	        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
	          <div className="space-y-3">
	            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
	              <div>
	                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
	                  <LucideFilter className="h-4 w-4 text-blue-600" />
	                  Filter users
                </div>
                <p className="mt-1 text-xs text-slate-600">
	                  {filteredUsers.length} of {users.length} users
	                </p>
	              </div>
	              <Button
	                type="button"
	                variant="secondary"
	                onClick={exportFilteredUsersCsv}
	                disabled={filteredUsers.length === 0}
	                size="sm"
	                className="h-8 w-full px-3 text-xs font-semibold sm:w-auto"
	              >
	                <LucideDownload className="mr-1.5 h-3.5 w-3.5" />
	                Export CSV
	              </Button>
	            </div>

	            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(260px,1fr)_150px_190px_auto_auto] lg:items-end">

	              <label className="space-y-1 sm:col-span-2 lg:col-span-1">
	                <span className="text-xs font-medium text-slate-600">Search</span>
                <div className="relative">
                  <LucideSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    value={searchTerm}
                    onChange={(event) => {
                      setSearchTerm(event.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Name, email, or ID"
                    className="pl-9"
                  />
                </div>
              </label>

              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600">Role</span>
                <Select
                  value={roleFilter}
                  onChange={(event) => {
                    setRoleFilter(event.target.value as RoleFilter);
                    setCurrentPage(1);
                  }}
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Select>
              </label>

              <label className="space-y-1 sm:col-span-2 lg:col-span-1">
                <span className="text-xs font-medium text-slate-600">Sort by</span>
                <Select
                  value={sortBy}
                  onChange={(event) => {
                    setSortBy(event.target.value as UserSortOption);
                    setCurrentPage(1);
                  }}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Select>
              </label>

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAdvancedFilters((value) => !value)}
                size="sm"
                className="h-10 w-full"
              >
                <LucideSlidersHorizontal className="mr-2 h-4 w-4" />
                {showAdvancedFilters ? 'Hide' : 'Advanced'}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={resetFilters}
                disabled={!hasActiveFilters}
                size="sm"
                className="h-10 w-full"
              >
	                <LucideRotateCcw className="mr-2 h-4 w-4" />
	                Reset
	              </Button>
	            </div>

            {showAdvancedFilters && (
              <div className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3 sm:grid-cols-3">
                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-600">Status</span>
                  <Select
                    value={statusFilter}
                    onChange={(event) => {
                      setStatusFilter(event.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </Select>
                </label>

                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-600">Joined from</span>
                  <input
                    type="date"
                    value={joinedFrom}
                    onChange={(event) => {
                      setJoinedFrom(event.target.value);
                      setCurrentPage(1);
                    }}
                    className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-black placeholder:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-600">Joined to</span>
                  <input
                    type="date"
                    value={joinedTo}
                    onChange={(event) => {
                      setJoinedTo(event.target.value);
                      setCurrentPage(1);
                    }}
                    className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-black placeholder:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  />
                </label>
              </div>
            )}
          </div>
        </div>
        {filteredUsers.length === 0 ? (
          <EmptyState
            title="No users match these filters"
            description="Try adjusting the search, role, status, joined date range, or sorting option."
          />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Request</TableHead>
                  <TableHead>Joined Date</TableHead>
                  {isCurrentUserAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => {
                  const upgradeRequest = pendingUpgradeByUserId.get(user.id);

                  return (
                  <TableRow key={user.id} className={upgradeRequest ? 'bg-blue-50/40 hover:bg-blue-50' : 'hover:bg-blue-50/50'}>
                    <TableCell>
                      <div className="font-semibold text-slate-900">{user.displayName || 'No Name'}</div>
                      <div className="text-xs text-slate-600">{user.email}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">ID: {user.id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`
                        text-xs font-semibold
                        ${normalizeRole(user.role) === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}
                        ${normalizeRole(user.role) === 'MODERATOR' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : ''}
                        ${normalizeRole(user.role) === 'BUSINESS' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                        ${normalizeRole(user.role) === 'SUBSCRIBER' ? 'bg-slate-50 text-slate-700 border-slate-200' : ''}
                      `}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.accountStatus === 'ACTIVE' ? 'success' : 'danger'} className="text-xs">
                        {user.accountStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.emailVerified ? 'success' : 'warning'} className="text-xs">
                        {user.emailVerified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {upgradeRequest ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleOpenDetails(user)}
                          className="h-8 border-blue-200 bg-white px-2.5 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                        >
                          <LucideArrowUpCircle className="mr-1.5 h-3.5 w-3.5" />
                          Upgrade
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-500">None</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-700">
                      {formatAppDate(user.createdAt, 'N/A')}
                    </TableCell>
                    {isCurrentUserAdmin && (
                      <TableCell className="text-right">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            onClick={() => handleOpenDetails(user)}
                            className="text-xs font-semibold h-8 py-1 px-3 flex items-center gap-1"
                          >
                            <LucideEye className="w-3.5 h-3.5" />
                            View
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-700">
                Showing <span className="font-semibold">{pageStart + 1}</span> to{' '}
                <span className="font-semibold">{pageEnd}</span> of{' '}
                <span className="font-semibold">{filteredUsers.length}</span> users
              </p>
              <div className="flex items-center justify-between gap-2 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={visiblePage === 1}
                  className="min-w-24"
                >
                  <LucideChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>
                <span className="whitespace-nowrap rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                  Page {visiblePage} of {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={visiblePage === totalPages}
                  className="min-w-24"
                >
                  Next
                  <LucideChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* USER DETAILS MODAL */}
      <Modal
        isOpen={isOpen}
        onClose={handleCloseDetails}
        title="User Account Details"
        description={selectedUser ? `Inspect and moderate account for ${selectedUser.displayName || selectedUser.email}` : ''}
        className="max-w-2xl"
      >
        {loading ? (
          <div className="py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-slate-500 text-sm">Loading user data...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            {error}
          </div>
        ) : fullUserData ? (
          <div className="space-y-6">
            
            {/* Header section inside drawer */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                {fullUserData.photoUrl ? (
                  <div
                    aria-label={fullUserData.displayName || fullUserData.email || 'User profile photo'}
                    role="img"
                    className="h-12 w-12 rounded-full border border-slate-200 bg-white object-cover"
                    style={{ backgroundImage: `url(${fullUserData.photoUrl})`, backgroundPosition: 'center', backgroundSize: 'cover' }}
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-bold text-slate-700">
                    {(fullUserData.displayName || fullUserData.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {fullUserData.displayName || `${fullUserData.firstName || ''} ${fullUserData.lastName || ''}`.trim() || 'No Display Name'}
                  </h3>
                  <p className="text-xs text-slate-700 mt-0.5">{fullUserData.email}</p>
                  <p className="text-[11px] text-slate-600 mt-1">{profileCompletionText}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={normalizeRole(fullUserData.role) === 'ADMIN' ? 'danger' : normalizeRole(fullUserData.role) === 'MODERATOR' ? 'warning' : normalizeRole(fullUserData.role) === 'BUSINESS' ? 'info' : 'default'}>
                  {fullUserData.role}
                </Badge>
                <Badge variant={fullUserData.accountStatus === 'ACTIVE' ? 'success' : 'danger'}>
                  {fullUserData.accountStatus || 'ACTIVE'}
                </Badge>
                <Badge variant={fullUserData.emailVerified ? 'success' : 'warning'}>
                  {fullUserData.emailVerified ? 'Email Verified' : 'Unverified'}
                </Badge>
	              </div>
	            </div>

	            {roleActionNotice && (
	              <div className={`rounded-xl border p-3 text-xs font-semibold ${
	                roleActionNotice.type === 'success'
	                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
	                  : 'border-amber-200 bg-amber-50 text-amber-800'
	              }`}>
	                {roleActionNotice.message}
	              </div>
	            )}

	            {selectedUpgradeRequest && (
	              <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                      <LucideArrowUpCircle className="h-4 w-4 text-blue-600" />
                      Business Account Upgrade Request
                    </h4>
                    <p className="mt-1 text-xs leading-5 text-slate-700">
                      {selectedUpgradeRequest.message}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-600">
                      <span>Status: {selectedUpgradeRequest.status}</span>
                      <span>Requested: {formatAppDateTime(selectedUpgradeRequest.createdAt)}</span>
                    </div>
                    {roleActionError && (
                      <p className="mt-3 rounded-lg border border-red-200 bg-white p-3 text-xs font-semibold text-red-700">
                        {roleActionError}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    onClick={handleApproveBusinessUpgrade}
                    isLoading={roleActionLoading}
                    disabled={roleActionLoading || normalizeRole(fullUserData.role) === 'BUSINESS'}
                    className="bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Upgrade to Business
                  </Button>
                </div>
              </div>
            )}

            {/* Profile Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              {/* Box: Personal Profile */}
              <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm space-y-3">
                <h4 className="font-bold text-slate-900 border-b pb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider text-blue-600">
                  <LucideUser className="w-4 h-4" />
                  Personal Information
                </h4>
                <div className="space-y-2">
                  {renderDetailField('First Name:', fullUserData.firstName)}
                  {renderDetailField('Last Name:', fullUserData.lastName)}
                  {renderDetailField('Display Name:', fullUserData.displayName)}
                  {renderDetailField('Gender:', fullUserData.gender)}
                  {renderDetailField('Date of Birth:', fullUserData.dateOfBirth)}
                </div>
              </div>

              {/* Box: Account Fields */}
              <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm space-y-3">
                <h4 className="font-bold text-slate-900 border-b pb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider text-blue-600">
                  <LucideUser className="w-4 h-4" />
                  Account Information
                </h4>
                <div className="space-y-2">
                  {renderDetailField('User ID:', fullUserData.id, { mono: true, breakAll: true })}
                  {renderDetailField('Email Address:', fullUserData.email, { breakAll: true })}
                  {renderDetailField('Role:', fullUserData.role)}
                  {renderDetailField('Account Status:', fullUserData.accountStatus || 'ACTIVE')}
                  {renderDetailField('Email Verified:', fullUserData.emailVerified ? 'Yes' : 'No')}
                  {renderDetailField('Photo URL:', fullUserData.photoUrl, { breakAll: true })}
                  {renderDetailField('Date Registered:', formatAppDateTime(fullUserData.createdAt))}
                  {renderDetailField('Last Updated:', formatAppDateTime(fullUserData.updatedAt))}
                  {renderDetailField('Last Login:', formatAppDateTime(fullUserData.lastLoginAt))}
                </div>
              </div>

              {/* Box: Contact Fields */}
              <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm sm:col-span-2 space-y-3">
                <h4 className="font-bold text-slate-900 border-b pb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider text-blue-600">
                  <LucidePhone className="w-4 h-4" />
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {renderDetailField('Mobile Number:', fullUserData.mobileNumber)}
                  {renderDetailField('Telephone Number:', fullUserData.telephoneNumber)}
                </div>
              </div>

              {/* Box: Address (Full Width) */}
              <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm sm:col-span-2 space-y-3">
                <h4 className="font-bold text-slate-900 border-b pb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider text-blue-600">
                  <LucideMapPin className="w-4 h-4" />
                  Location Profile
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {renderDetailField('Address Line 1:', fullUserData.addressLine1)}
                  {renderDetailField('Address Line 2:', fullUserData.addressLine2)}
                  {renderDetailField('Barangay:', fullUserData.barangay)}
                  {renderDetailField('City/Municipality:', fullUserData.city)}
                  {renderDetailField('Province:', fullUserData.province)}
                  {renderDetailField('Region:', fullUserData.region)}
                  {renderDetailField('ZIP Code:', fullUserData.zipCode)}
                  {renderDetailField('Country:', fullUserData.country || 'Philippines')}
                </div>
              </div>

              {/* Role Specific Section */}
              {normalizeRole(fullUserData.role) === 'BUSINESS' ? (
                <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm sm:col-span-2 space-y-3">
                  <h4 className="font-bold text-slate-900 border-b pb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider text-blue-600">
                    <LucideBuilding className="w-4 h-4" />
                    Directory Listing Metrics
                  </h4>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Total</span>
                      <span className="text-slate-900 text-lg font-extrabold mt-1 block">{statusCounts.total}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider text-slate-500">Drafts</span>
                      <span className="text-slate-700 text-lg font-extrabold mt-1 block">{statusCounts.draft}</span>
                    </div>
                    <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 text-center">
                      <span className="text-blue-500 block text-[10px] uppercase font-bold tracking-wider">Pending</span>
                      <span className="text-blue-600 text-lg font-extrabold mt-1 block">{statusCounts.pending}</span>
                    </div>
                    <div className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100 text-center">
                      <span className="text-emerald-500 block text-[10px] uppercase font-bold tracking-wider">Approved</span>
                      <span className="text-emerald-600 text-lg font-extrabold mt-1 block">{statusCounts.approved}</span>
                    </div>
                    <div className="bg-rose-50/50 p-2.5 rounded-lg border border-rose-100 text-center">
                      <span className="text-rose-500 block text-[10px] uppercase font-bold tracking-wider">Rejected</span>
                      <span className="text-rose-600 text-lg font-extrabold mt-1 block">{statusCounts.rejected}</span>
                    </div>
                    <div className="bg-amber-50/50 p-2.5 rounded-lg border border-amber-100 text-center">
                      <span className="text-amber-500 block text-[10px] uppercase font-bold tracking-wider">Revision</span>
                      <span className="text-amber-600 text-lg font-extrabold mt-1 block">{statusCounts.revision}</span>
                    </div>
                  </div>

                  {userBusinesses.length > 0 ? (
                    <div className="mt-3 border border-slate-100 rounded-lg overflow-hidden text-[11px]">
                      <div className="bg-slate-50 px-3 py-1.5 font-bold border-b text-slate-700 flex justify-between">
                        <span>Listing Name</span>
                        <span>Status</span>
                      </div>
                      <div className="max-h-[140px] overflow-y-auto divide-y divide-slate-50">
                        {userBusinesses.map(b => (
                          <div key={b.id} className="px-3 py-2 flex justify-between items-center bg-white hover:bg-slate-50/50">
                            <span className="font-semibold text-slate-800 truncate max-w-[340px]">{b.name}</span>
                            <Badge variant={
                              b.status === 'APPROVED' ? 'success' :
                              b.status === 'PENDING' ? 'info' :
                              b.status === 'REVISION_REQUESTED' ? 'warning' : 'default'
                            } className="text-[10px] px-1.5 py-0.5">
                              {b.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">This merchant has not added any business listings yet.</p>
                  )}
                </div>
              ) : normalizeRole(fullUserData.role) === 'SUBSCRIBER' ? (
                <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm sm:col-span-2 space-y-3">
                  <h4 className="font-bold text-slate-900 border-b pb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider text-blue-600">
                    <LucideBookmark className="w-4 h-4" />
                    Local Activity & Favorites
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <h5 className="font-semibold text-slate-800 text-xs mb-1">Bookmarked Directories</h5>
                      <p className="text-slate-500 text-[11px] leading-relaxed">Bookmarked locations and saved businesses are locally stored in the subscriber's physical browser device cookies/localStorage.</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <h5 className="font-semibold text-slate-800 text-xs mb-1">Recent Local Searches</h5>
                      <p className="text-slate-500 text-[11px] leading-relaxed">Search history metrics and directory query analytics are handled privately and processed directly on user devices.</p>
                    </div>
                  </div>
                </div>
              ) : null}

            </div>

            {/* Footer Buttons inside Modal */}
            <div className="flex flex-col gap-3 pt-4 border-t border-slate-100 sm:flex-row sm:items-center sm:justify-between">
              {isCurrentUserAdmin && selectedUser && (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => openAccountAction('BAN', selectedUser)}
                    disabled={selectedUser.id === currentUser?.uid || selectedUser.accountStatus !== 'ACTIVE'}
                    className="text-xs font-semibold h-9 px-3 text-amber-700 hover:text-amber-800"
                  >
                    <LucideBan className="mr-1.5 h-3.5 w-3.5" />
                    Banned
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => openAccountAction('UNBAN', selectedUser)}
                    disabled={selectedUser.id === currentUser?.uid || selectedUser.accountStatus !== 'BANNED'}
                    className="text-xs font-semibold h-9 px-3 text-emerald-700 hover:text-emerald-800"
                  >
                    <LucideUserCheck className="mr-1.5 h-3.5 w-3.5" />
                    Unbanned
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => openAccountAction('DELETE', selectedUser)}
                    disabled={selectedUser.id === currentUser?.uid}
                    className="text-xs font-semibold h-9 px-3 text-red-700 hover:text-red-800"
                  >
                    <LucideTrash2 className="mr-1.5 h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              )}
              <div className="flex justify-end">
                <Button onClick={handleCloseDetails} className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 h-9">
                  Close Details
                </Button>
              </div>
            </div>

          </div>
        ) : null}
      </Modal>

      <Modal
        isOpen={Boolean(accountAction && actionUser)}
        onClose={closeAccountAction}
        title={accountAction === 'BAN' ? 'Ban User Account' : accountAction === 'UNBAN' ? 'Unban User Account' : 'Delete User Account'}
        description={actionUser ? `Confirm this action for ${actionUser.displayName || actionUser.email}.` : ''}
        footer={
          <>
            <Button variant="outline" onClick={closeAccountAction} disabled={actionLoading}>
              Cancel
            </Button>
            <Button
              onClick={confirmAccountAction}
              isLoading={actionLoading}
              className={
                accountAction === 'BAN'
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : accountAction === 'UNBAN'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
              }
            >
              {accountAction === 'BAN' ? 'Confirm Banned' : accountAction === 'UNBAN' ? 'Confirm Unbanned' : 'Confirm Delete'}
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm text-slate-700">
          {accountAction === 'BAN' ? (
            <p>
              This will mark the user as <strong>BANNED</strong>. They will no longer be allowed to use protected platform features.
            </p>
          ) : accountAction === 'UNBAN' ? (
            <p>
              This will restore the user to <strong>ACTIVE</strong>. They will be allowed to log in and use the platform again.
            </p>
          ) : (
            <p>
              This will permanently delete the LocalPages user account, all business listings created under this account, support messages, and related platform data. The person can use the platform again by registering or signing in again, which creates a new LocalPages profile.
            </p>
          )}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="font-semibold text-slate-900">{actionUser?.displayName || 'No Name'}</p>
            <p className="text-xs text-slate-700">{actionUser?.email}</p>
            <p className="mt-1 text-[11px] font-mono text-slate-600">ID: {actionUser?.id}</p>
          </div>
          {actionError && (
            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
              {actionError}
            </p>
          )}
        </div>
      </Modal>
    </>
  );
}
