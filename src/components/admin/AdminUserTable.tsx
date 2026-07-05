'use client';

import React, { useState, useEffect } from 'react';
import { UserAccount } from '@/types/admin';
import { EmptyState } from '../ui/EmptyState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useAuth } from '@/lib/auth/AuthContext';
import { isAdmin, normalizeRole } from '@/lib/auth/roles';
import { getUserById, getMyBusinesses } from '@/lib/data-connect';
import { BusinessListing } from '@/types/business';
import { 
  LucideUser, 
  LucidePhone, 
  LucideMapPin, 
  LucideEye,
  LucideBuilding,
  LucideBookmark
} from 'lucide-react';

interface AdminUserTableProps {
  users: UserAccount[];
}

export default function AdminUserTable({ users }: AdminUserTableProps) {
  const { role } = useAuth();
  const isCurrentUserAdmin = isAdmin(role);

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [fullUserData, setFullUserData] = useState<any | null>(null);
  const [userBusinesses, setUserBusinesses] = useState<BusinessListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleOpenDetails = (user: UserAccount) => {
    setSelectedUser(user);
    setFullUserData(null);
    setUserBusinesses([]);
    setIsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsOpen(false);
    setSelectedUser(null);
    setFullUserData(null);
    setUserBusinesses([]);
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

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined Date</TableHead>
              {isCurrentUserAdmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="font-semibold text-slate-900">{user.displayName || 'No Name'}</div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {user.id}</div>
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
                <TableCell className="text-xs text-slate-500">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                </TableCell>
                {isCurrentUserAdmin && (
                  <TableCell className="text-right">
                    <Button 
                      variant="secondary" 
                      onClick={() => handleOpenDetails(user)}
                      className="text-xs font-semibold h-8 py-1 px-3 flex items-center gap-1 ml-auto"
                    >
                      <LucideEye className="w-3.5 h-3.5" />
                      View Details
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {fullUserData.displayName || `${fullUserData.firstName || ''} ${fullUserData.lastName || ''}`.trim() || 'No Display Name'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{fullUserData.email}</p>
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

            {/* Profile Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              {/* Box: General Profile */}
              <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm space-y-3">
                <h4 className="font-bold text-slate-900 border-b pb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider text-blue-600">
                  <LucideUser className="w-4 h-4" />
                  Account Identifiers
                </h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-slate-400 font-medium">User ID:</span>
                    <p className="font-mono text-[10px] text-slate-800 mt-0.5 break-all">{fullUserData.id}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Date Registered:</span>
                    <p className="text-slate-800 mt-0.5">
                      {fullUserData.createdAt ? new Date(fullUserData.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Last Login:</span>
                    <p className="text-slate-800 mt-0.5">
                      {fullUserData.lastLoginAt ? new Date(fullUserData.lastLoginAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Box: Contact Fields */}
              <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm space-y-3">
                <h4 className="font-bold text-slate-900 border-b pb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider text-blue-600">
                  <LucidePhone className="w-4 h-4" />
                  Contact Credentials
                </h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-slate-400 font-medium">Mobile Number:</span>
                    <p className="text-slate-800 mt-0.5">{fullUserData.mobileNumber || <span className="text-slate-400 italic">Not set</span>}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Telephone Number:</span>
                    <p className="text-slate-800 mt-0.5">{fullUserData.telephoneNumber || <span className="text-slate-400 italic">Not set</span>}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Date of Birth:</span>
                    <p className="text-slate-800 mt-0.5">{fullUserData.dateOfBirth || <span className="text-slate-400 italic">Not set</span>}</p>
                  </div>
                </div>
              </div>

              {/* Box: Address (Full Width) */}
              <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm sm:col-span-2 space-y-3">
                <h4 className="font-bold text-slate-900 border-b pb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider text-blue-600">
                  <LucideMapPin className="w-4 h-4" />
                  Location Profile
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-400 font-medium">Address Line 1:</span>
                    <p className="text-slate-800 mt-0.5 break-words">{fullUserData.addressLine1 || <span className="text-slate-400 italic">Not set</span>}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Address Line 2:</span>
                    <p className="text-slate-800 mt-0.5 break-words">{fullUserData.addressLine2 || <span className="text-slate-400 italic">Not set</span>}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Barangay:</span>
                    <p className="text-slate-800 mt-0.5">{fullUserData.barangay || <span className="text-slate-400 italic">Not set</span>}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">City:</span>
                    <p className="text-slate-800 mt-0.5">{fullUserData.city || <span className="text-slate-400 italic">Not set</span>}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Province:</span>
                    <p className="text-slate-800 mt-0.5">{fullUserData.province || <span className="text-slate-400 italic">Not set</span>}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Region:</span>
                    <p className="text-slate-800 mt-0.5">{fullUserData.region || <span className="text-slate-400 italic">Not set</span>}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">ZIP Code:</span>
                    <p className="text-slate-800 mt-0.5">{fullUserData.zipCode || <span className="text-slate-400 italic">Not set</span>}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Country:</span>
                    <p className="text-slate-800 mt-0.5">{fullUserData.country || 'Philippines'}</p>
                  </div>
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
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button onClick={handleCloseDetails} className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 h-9">
                Close Details
              </Button>
            </div>

          </div>
        ) : null}
      </Modal>
    </>
  );
}
