'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { getUserById, updateUser } from '@/lib/data-connect';
import { sendVerificationEmail, resetPassword } from '@/lib/auth/auth-utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { 
  LucideUser, 
  LucideMail, 
  LucidePhone, 
  LucideMapPin, 
  LucideShield, 
  LucideCheckCircle, 
  LucideAlertTriangle, 
  LucideEdit, 
  LucideSave,
  LucideArrowLeft
} from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  role: string;
  accountStatus: string;
  mobileNumber?: string;
  telephoneNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  barangay?: string;
  city?: string;
  province?: string;
  region?: string;
  zipCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Profile data states
  const [userData, setUserData] = useState<UserData | null>(null);
  const [editData, setEditData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Initial data loading
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    async function loadUserData() {
      if (user) {
        try {
          const res = await getUserById({ id: user.uid });
          if (res?.data?.user) {
            setUserData(res.data.user as UserData);
          }
        } catch (error) {
          console.error('Failed to load user profile:', error);
        } finally {
          setLoading(false);
        }
      }
    }

    loadUserData();
  }, [user, authLoading, router]);

  // Clean messaging after timer
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (authLoading || loading) {
    return (
      <div className="flex-1 bg-slate-50 flex items-center justify-center p-8 min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user || !userData) return null;

  // Helper to get initials
  const getInitials = () => {
    if (userData.displayName) {
      return userData.displayName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    }
    if (userData.firstName && userData.lastName) {
      return `${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase();
    }
    return (userData.email?.[0] || 'U').toUpperCase();
  };

  const getRoleLabel = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'Administrator';
      case 'moderator':
        return 'Moderator';
      case 'business':
        return 'Business Account';
      case 'subscriber':
        return 'Subscriber';
      default:
        return role || 'Subscriber';
    }
  };

  const getRoleVariant = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'danger';
      case 'moderator':
        return 'warning';
      case 'business':
        return 'info';
      default:
        return 'default';
    }
  };

  // Validation before submission
  const validate = () => {
    if (!editData?.firstName || !editData?.lastName) {
      setMessage({ type: 'error', text: 'First Name and Last Name are required.' });
      return false;
    }
    if (editData?.mobileNumber && !/^(09|\+639)\d{9}$/.test(editData.mobileNumber)) {
      setMessage({ type: 'error', text: 'Invalid Philippine mobile number format (e.g., 09171234567).' });
      return false;
    }
    return true;
  };

  // Switch to editing state
  const handleStartEdit = () => {
    setEditData({ ...userData });
    setActiveTab('personal');
    setIsEditing(true);
    setMessage(null);
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData(null);
    setMessage(null);
  };

  // Submit profile edits
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editData || !validate()) return;

    setSaving(true);
    setMessage(null);

    try {
      // Exclude read-only fields
      const { 
        id: _id, 
        email: _email, 
        role: _role, 
        accountStatus: _accountStatus, 
        createdAt: _createdAt, 
        updatedAt: _updatedAt, 
        ...updateData 
      } = editData;
      await updateUser({ id: user.uid, data: updateData });
      
      // Update local state and exit edit mode
      setUserData({
        ...userData,
        ...updateData
      });
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSendVerification = async () => {
    setSendingEmail(true);
    try {
      await sendVerificationEmail();
      setMessage({ type: 'success', text: 'Verification email sent! Please check your inbox.' });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to send verification email.' });
    } finally {
      setSendingEmail(false);
    }
  };

  const handlePasswordReset = async () => {
    if (user.email) {
      setResettingPassword(true);
      try {
        await resetPassword(user.email);
        setMessage({ type: 'success', text: 'Password reset link sent to your email.' });
      } catch (error) {
        console.error(error);
        setMessage({ type: 'error', text: 'Failed to send password reset email.' });
      } finally {
        setResettingPassword(false);
      }
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Information', icon: LucideUser },
    { id: 'contact', label: 'Contact Details', icon: LucidePhone },
    { id: 'address', label: 'Address Information', icon: LucideMapPin },
    { id: 'security', label: 'Security & Access', icon: LucideShield },
  ];

  return (
    <div className="flex-1 bg-slate-50 min-h-screen py-8 md:py-12 text-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Global Action Message Toast */}
        {message && (
          <div className={`p-4 mb-6 rounded-xl border flex items-center gap-3 transition-all ${
            message.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            {message.type === 'success' ? (
              <LucideCheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <LucideAlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <p className="text-sm font-semibold">{message.text}</p>
          </div>
        )}

        {/* PROFILE VIEW MODE */}
        {!isEditing ? (
          <div className="space-y-8">
            {/* Header / Avatar Card */}
            <Card className="p-6 md:p-8 border-slate-200 shadow-sm bg-white overflow-hidden relative">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                  {/* Initials Avatar */}
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-2xl md:text-3xl font-extrabold shadow-md border-4 border-white">
                    {getInitials()}
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                      {userData.displayName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'User Profile'}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                      <LucideMail className="w-4 h-4 text-slate-400" />
                      {userData.email}
                    </p>
                    
                    {/* Badge Badges */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                      <Badge variant={getRoleVariant(userData.role)}>
                        {getRoleLabel(userData.role)}
                      </Badge>
                      <Badge variant={userData.accountStatus?.toLowerCase() === 'active' ? 'success' : 'warning'}>
                        {userData.accountStatus || 'Active'}
                      </Badge>
                      {user.emailVerified ? (
                        <Badge variant="success" className="gap-1">
                          <LucideCheckCircle className="w-3 h-3" />
                          Verified Email
                        </Badge>
                      ) : (
                        <Badge variant="warning">
                          Unverified Email
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center md:justify-end">
                  <Button 
                    type="button" 
                    onClick={handleStartEdit} 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm flex items-center gap-2 px-5 py-2.5 h-auto rounded-lg transition-all"
                  >
                    <LucideEdit className="w-4 h-4" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            </Card>

            {/* Profile Grid Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Card: Personal Details */}
              <Card className="p-6 border border-slate-200 shadow-sm bg-white">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <LucideUser className="w-5 h-5 text-blue-600" />
                  Personal Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">First Name</span>
                    <p className="text-slate-900 font-semibold mt-0.5">{userData.firstName || <span className="text-slate-400 italic font-normal">Not provided</span>}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Last Name</span>
                    <p className="text-slate-900 font-semibold mt-0.5">{userData.lastName || <span className="text-slate-400 italic font-normal">Not provided</span>}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Display Name</span>
                    <p className="text-slate-900 font-semibold mt-0.5">{userData.displayName || <span className="text-slate-400 italic font-normal">Not provided</span>}</p>
                  </div>
                </div>
              </Card>

              {/* Card: Contact Details */}
              <Card className="p-6 border border-slate-200 shadow-sm bg-white">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <LucidePhone className="w-5 h-5 text-blue-600" />
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Mobile Number</span>
                    <p className="text-slate-900 font-semibold mt-0.5">{userData.mobileNumber || <span className="text-slate-400 italic font-normal">Not provided</span>}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Telephone Number</span>
                    <p className="text-slate-900 font-semibold mt-0.5">{userData.telephoneNumber || <span className="text-slate-400 italic font-normal">Not provided</span>}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Email Address</span>
                    <p className="text-slate-900 font-semibold mt-0.5">{userData.email}</p>
                  </div>
                </div>
              </Card>

              {/* Card: Address details (Full Width) */}
              <Card className="md:col-span-2 p-6 border border-slate-200 shadow-sm bg-white">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <LucideMapPin className="w-5 h-5 text-blue-600" />
                  Address Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Address Line 1</span>
                    <p className="text-slate-900 font-semibold mt-0.5">{userData.addressLine1 || <span className="text-slate-400 italic font-normal">Not provided</span>}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Address Line 2</span>
                    <p className="text-slate-900 font-semibold mt-0.5">{userData.addressLine2 || <span className="text-slate-400 italic font-normal">Not provided</span>}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Barangay</span>
                    <p className="text-slate-900 font-semibold mt-0.5">{userData.barangay || <span className="text-slate-400 italic font-normal">Not provided</span>}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">City</span>
                    <p className="text-slate-900 font-semibold mt-0.5">{userData.city || <span className="text-slate-400 italic font-normal">Not provided</span>}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Province</span>
                    <p className="text-slate-900 font-semibold mt-0.5">{userData.province || <span className="text-slate-400 italic font-normal">Not provided</span>}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">ZIP Code</span>
                    <p className="text-slate-900 font-semibold mt-0.5">{userData.zipCode || <span className="text-slate-400 italic font-normal">Not provided</span>}</p>
                  </div>
                </div>
              </Card>

            </div>
          </div>
        ) : (
          /* PROFILE EDIT MODE */
          <div className="space-y-6">
            
            {/* Header Title with Back button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleCancelEdit} 
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <LucideArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Profile</h1>
                  <p className="text-xs text-slate-500">Modify your information across different categories.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancelEdit} 
                  className="border-slate-200 text-slate-700 hover:bg-slate-50 h-9 text-xs"
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={handleSaveProfile} 
                  disabled={saving || activeTab === 'security'}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-9 text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <LucideSave className="w-3.5 h-3.5" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>

            {/* Editing Navigation Tabs */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-1 flex overflow-x-auto gap-1">
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <TabIcon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Editable Form container */}
            <Card className="p-6 md:p-8 bg-white border border-slate-200 shadow-sm">
              <form onSubmit={handleSaveProfile} className="space-y-6">
                
                {activeTab === 'personal' && editData && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">First Name <span className="text-rose-500">*</span></label>
                      <Input 
                        value={editData.firstName || ''} 
                        onChange={(e) => setEditData({...editData, firstName: e.target.value})} 
                        placeholder="Enter first name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Last Name <span className="text-rose-500">*</span></label>
                      <Input 
                        value={editData.lastName || ''} 
                        onChange={(e) => setEditData({...editData, lastName: e.target.value})} 
                        placeholder="Enter last name"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Display Name</label>
                      <Input 
                        value={editData.displayName || ''} 
                        onChange={(e) => setEditData({...editData, displayName: e.target.value})} 
                        placeholder="Enter display name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address (Read-only)</label>
                      <Input value={editData.email} disabled className="bg-slate-50 text-slate-500 cursor-not-allowed" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Role (Read-only)</label>
                      <Input value={getRoleLabel(editData.role)} disabled className="bg-slate-50 text-slate-500 cursor-not-allowed" />
                    </div>
                  </div>
                )}

                {activeTab === 'contact' && editData && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Mobile Number</label>
                      <Input 
                        value={editData.mobileNumber || ''} 
                        onChange={(e) => setEditData({...editData, mobileNumber: e.target.value})} 
                        placeholder="e.g., 09171234567"
                      />
                      <p className="text-[11px] text-slate-400 mt-0.5">Philippine mobile number starting with 09 or +639 followed by 9 digits.</p>
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Telephone Number</label>
                      <Input 
                        value={editData.telephoneNumber || ''} 
                        onChange={(e) => setEditData({...editData, telephoneNumber: e.target.value})} 
                        placeholder="e.g., (02) 8123-4567"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'address' && editData && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Address Line 1</label>
                      <Input 
                        value={editData.addressLine1 || ''} 
                        onChange={(e) => setEditData({...editData, addressLine1: e.target.value})} 
                        placeholder="Street Name, Building, House No."
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Address Line 2 (Optional)</label>
                      <Input 
                        value={editData.addressLine2 || ''} 
                        onChange={(e) => setEditData({...editData, addressLine2: e.target.value})} 
                        placeholder="Unit/Floor, Suite, Sub-division"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Barangay</label>
                      <Input 
                        value={editData.barangay || ''} 
                        onChange={(e) => setEditData({...editData, barangay: e.target.value})} 
                        placeholder="Barangay"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">City</label>
                      <Input 
                        value={editData.city || ''} 
                        onChange={(e) => setEditData({...editData, city: e.target.value})} 
                        placeholder="City"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Province</label>
                      <Input 
                        value={editData.province || ''} 
                        onChange={(e) => setEditData({...editData, province: e.target.value})} 
                        placeholder="Province"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">ZIP Code</label>
                      <Input 
                        value={editData.zipCode || ''} 
                        onChange={(e) => setEditData({...editData, zipCode: e.target.value})} 
                        placeholder="e.g., 1000"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
                      <h3 className="font-bold text-slate-900 mb-1 text-sm flex items-center gap-2">
                        <LucideShield className="w-4 h-4 text-slate-700" />
                        Account Security & Password
                      </h3>
                      <p className="text-xs text-slate-500 mb-4">You can request a password reset email to safely secure or update your current login credentials.</p>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handlePasswordReset}
                        isLoading={resettingPassword}
                        className="bg-white border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold px-4 h-9"
                      >
                        Send Password Reset Email
                      </Button>
                    </div>

                    {!user.emailVerified && (
                      <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/40">
                        <h3 className="font-bold text-amber-900 mb-1 text-sm flex items-center gap-2">
                          <LucideAlertTriangle className="w-4 h-4 text-amber-600" />
                          Email Verification Required
                        </h3>
                        <p className="text-xs text-amber-700 mb-4">Verify your email address to unlock advanced operations and keep your listings and reviews trusted.</p>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleSendVerification}
                          isLoading={sendingEmail}
                          className="bg-white border-amber-200 hover:bg-amber-100/40 text-amber-800 text-xs font-semibold px-4 h-9"
                        >
                          Send Verification Email
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Edit Form Actions (Personal, Contact, Address) */}
                {activeTab !== 'security' && (
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCancelEdit}
                      className="border-slate-200 text-slate-700 hover:bg-slate-50 px-4 h-10 text-xs font-semibold"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 h-10 text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <LucideSave className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                )}

              </form>
            </Card>

          </div>
        )}

      </div>
    </div>
  );
}
