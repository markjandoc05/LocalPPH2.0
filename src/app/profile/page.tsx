'use client';

import { useCallback, useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { createSupportTicket, createUser, getMySupportTickets, getUserById, updateUser } from '@/lib/data-connect';
import {
  connectGoogleLogin,
  disconnectGoogleLogin,
  getAuthEmailErrorMessage,
  GOOGLE_LINK_EMAIL_MISMATCH_MESSAGE,
  resetPassword,
  sendVerificationEmail,
  setPasswordLogin,
} from '@/lib/auth/auth-utils';
import { getMissingProfileFields, isProfileComplete } from '@/lib/auth/profile-completion';
import { normalizeRole, ROLES } from '@/lib/auth/roles';
import {
  DirectoryCity,
  DirectoryProvince,
  DirectoryRegion,
  getAllRegions,
  getCitiesByProvince,
  getProvincesByRegion,
} from '@/lib/data-connect/directory-service';
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
  LucideArrowLeft,
  LucideBuilding
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
  const { user, role, loading: authLoading, refreshUserProfile } = useAuth();

  // Profile data states
  const [userData, setUserData] = useState<UserData | null>(null);
  const [editData, setEditData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [connectingGoogle, setConnectingGoogle] = useState(false);
  const [disconnectingGoogle, setDisconnectingGoogle] = useState(false);
  const [settingPassword, setSettingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [requiresCompletion, setRequiresCompletion] = useState(false);
  const [regionsList, setRegionsList] = useState<DirectoryRegion[]>([]);
  const [provincesList, setProvincesList] = useState<DirectoryProvince[]>([]);
  const [citiesList, setCitiesList] = useState<DirectoryCity[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const [selectedProvinceId, setSelectedProvinceId] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');
  const [upgradeRequest, setUpgradeRequest] = useState<any | null>(null);
  const [loadingUpgradeRequest, setLoadingUpgradeRequest] = useState(false);
  const [requestingUpgrade, setRequestingUpgrade] = useState(false);

  const buildFallbackUserData = useCallback((): UserData | null => {
    if (!user) return null;

    return {
      id: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      role: role || ROLES.SUBSCRIBER,
      accountStatus: 'ACTIVE',
    };
  }, [role, user]);

  const startProfileCompletion = useCallback((nextUserData: UserData) => {
    setRequiresCompletion(true);
    setEditData(nextUserData);
    setIsEditing(true);
    setActiveTab('personal');
    setMessage({
      type: 'error',
      text: 'Please complete your personal information, mobile number, and address to continue.',
    });
  }, []);

  // Initial data loading
  useEffect(() => {
    async function loadUserData() {
      if (user) {
        try {
          const res = await getUserById({ id: user.uid });
          if (res?.data?.user) {
            setUserData(res.data.user as UserData);
            if (!isProfileComplete(res.data.user)) {
              startProfileCompletion(res.data.user as UserData);
            }
          } else {
            const fallbackUserData = buildFallbackUserData();
            if (!fallbackUserData) return;

            await createUser({
              id: fallbackUserData.id,
              email: fallbackUserData.email,
              displayName: fallbackUserData.displayName || user.displayName || user.email || 'User',
              photoUrl: user.photoURL || undefined,
              role: fallbackUserData.role,
            });

            setUserData(fallbackUserData);
            startProfileCompletion(fallbackUserData);
          }
        } catch (error) {
          console.warn('Failed to load user profile:', error);
          const fallbackUserData = buildFallbackUserData();
          if (fallbackUserData) {
            setUserData(fallbackUserData);
            startProfileCompletion(fallbackUserData);
          }
        } finally {
          setLoading(false);
        }
      } else if (!authLoading) {
        setLoading(false);
      }
    }

    loadUserData();
  }, [authLoading, buildFallbackUserData, startProfileCompletion, user]);

  useEffect(() => {
    let active = true;

    const loadRegions = async () => {
      try {
        const regions = await getAllRegions();
        if (active) setRegionsList(regions);
      } catch (error) {
        console.warn('Failed to load profile address regions:', error);
      }
    };

    loadRegions();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!editData?.region || regionsList.length === 0 || selectedRegionId) return;

    const matchingRegion = regionsList.find((region) => region.name === editData.region);
    if (matchingRegion) {
      setTimeout(() => setSelectedRegionId(matchingRegion.id), 0);
    }
  }, [editData?.region, regionsList, selectedRegionId]);

  useEffect(() => {
    let active = true;

    const loadProvinces = async () => {
      if (!selectedRegionId) {
        await Promise.resolve();
        if (active) {
          setProvincesList([]);
          setCitiesList([]);
          setSelectedProvinceId('');
          setSelectedCityId('');
        }
        return;
      }

      try {
        const provinces = await getProvincesByRegion(selectedRegionId);
        if (active) setProvincesList(provinces);
      } catch (error) {
        console.warn('Failed to load profile address provinces:', error);
      }
    };

    loadProvinces();

    return () => {
      active = false;
    };
  }, [selectedRegionId]);

  useEffect(() => {
    if (!editData?.province || provincesList.length === 0 || selectedProvinceId) return;

    const matchingProvince = provincesList.find((province) => province.name === editData.province);
    if (matchingProvince) {
      setTimeout(() => setSelectedProvinceId(matchingProvince.id), 0);
    }
  }, [editData?.province, provincesList, selectedProvinceId]);

  useEffect(() => {
    let active = true;

    const loadCities = async () => {
      if (!selectedProvinceId) {
        await Promise.resolve();
        if (active) {
          setCitiesList([]);
          setSelectedCityId('');
        }
        return;
      }

      try {
        const cities = await getCitiesByProvince(selectedProvinceId);
        if (active) setCitiesList(cities);
      } catch (error) {
        console.warn('Failed to load profile address cities:', error);
      }
    };

    loadCities();

    return () => {
      active = false;
    };
  }, [selectedProvinceId]);

  useEffect(() => {
    if (!editData?.city || citiesList.length === 0 || selectedCityId) return;

    const matchingCity = citiesList.find((city) => city.name === editData.city);
    if (matchingCity) {
      setTimeout(() => setSelectedCityId(matchingCity.id), 0);
    }
  }, [citiesList, editData?.city, selectedCityId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!userData) return;

    const shouldComplete = new URLSearchParams(window.location.search).get('complete') === '1';
    if (!shouldComplete || isProfileComplete(userData)) return;

    setTimeout(() => {
      setRequiresCompletion(true);
      setEditData(userData);
      setIsEditing(true);
      setActiveTab('personal');
      setMessage({
        type: 'error',
        text: 'Please complete your personal information, mobile number, and address to continue.',
      });
    }, 0);
  }, [userData]);

  useEffect(() => {
    let active = true;

    const loadUpgradeRequest = async () => {
      if (!user) return;

      setLoadingUpgradeRequest(true);
      try {
        const result = await getMySupportTickets({ userId: user.uid });
        const pendingRequest = result.data.supportTickets.find((ticket: any) =>
          ticket.category === 'ACCOUNT_UPGRADE' &&
          !['RESOLVED', 'CLOSED'].includes(ticket.status)
        );

        if (active) {
          setUpgradeRequest(pendingRequest || null);
        }
      } catch (error) {
        console.warn('Failed to load account upgrade request status:', error);
      } finally {
        if (active) setLoadingUpgradeRequest(false);
      }
    };

    loadUpgradeRequest();

    return () => {
      active = false;
    };
  }, [user]);

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

  if (!user) return null;

  const displayUserData = userData || {
    id: user.uid,
    email: user.email || '',
    role: 'SUBSCRIBER',
    accountStatus: 'ACTIVE',
  } as UserData;
  const userDataToUse = displayUserData;
  const providerIds = new Set(user.providerData.map((providerInfo) => providerInfo.providerId));
  const usesPasswordLogin = providerIds.has('password');
  const usesGoogleLogin = providerIds.has('google.com');


  // Helper to get initials
  const getInitials = () => {
    if (userDataToUse.displayName) {
      return userDataToUse.displayName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    }
    if (userDataToUse.firstName && userDataToUse.lastName) {
      return `${userDataToUse.firstName[0]}${userDataToUse.lastName[0]}`.toUpperCase();
    }
    return (userDataToUse.email?.[0] || 'U').toUpperCase();
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
    if (!editData) {
      setMessage({ type: 'error', text: 'Please complete your profile before saving.' });
      return false;
    }

    const missingFields = getMissingProfileFields(editData);

    if (missingFields.length > 0) {
      if (missingFields.includes('Personal Information')) {
        setActiveTab('personal');
      } else if (missingFields.includes('Contact Number')) {
        setActiveTab('contact');
      } else if (missingFields.includes('Address')) {
        setActiveTab('address');
      }

      setMessage({
        type: 'error',
        text: `Please complete: ${missingFields.join(', ')}.`,
      });
      return false;
    }

    if (!/^(09|\+639)\d{9}$/.test(editData.mobileNumber || '')) {
      setMessage({ type: 'error', text: 'Invalid Philippine mobile number format (e.g., 09171234567).' });
      setActiveTab('contact');
      return false;
    }
    return true;
  };

  // Switch to editing state
  const handleStartEdit = () => {
    setEditData({ ...userDataToUse });
    setActiveTab('personal');
    setIsEditing(true);
    setMessage(null);
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    if (requiresCompletion) {
      setMessage({
        type: 'error',
        text: 'Please complete your profile before continuing.',
      });
      return;
    }

    setIsEditing(false);
    setEditData(null);
    setSelectedRegionId('');
    setSelectedProvinceId('');
    setSelectedCityId('');
    setMessage(null);
  };

  const handleRegionChange = (regionId: string) => {
    const selectedRegion = regionsList.find((region) => region.id === regionId);

    setSelectedRegionId(regionId);
    setSelectedProvinceId('');
    setSelectedCityId('');
    setProvincesList([]);
    setCitiesList([]);
    setEditData((current) => current ? {
      ...current,
      region: selectedRegion?.name || '',
      province: '',
      city: '',
    } : current);
  };

  const handleProvinceChange = (provinceId: string) => {
    const selectedProvince = provincesList.find((province) => province.id === provinceId);

    setSelectedProvinceId(provinceId);
    setSelectedCityId('');
    setCitiesList([]);
    setEditData((current) => current ? {
      ...current,
      province: selectedProvince?.name || '',
      city: '',
    } : current);
  };

  const handleCityChange = (cityId: string) => {
    const selectedCity = citiesList.find((city) => city.id === cityId);

    setSelectedCityId(cityId);
    setEditData((current) => current ? {
      ...current,
      city: selectedCity?.name || '',
    } : current);
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
        ...userDataToUse,
        ...updateData
      });
      setRequiresCompletion(false);
      await refreshUserProfile();
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
    setMessage(null);
    try {
      const result = await sendVerificationEmail(user);
      setMessage({
        type: 'success',
        text: result.alreadyVerified
          ? 'Your email is already verified.'
          : `Verification email sent to ${user.email || userDataToUse.email}. Please check your inbox.`,
      });
    } catch (error: any) {
      console.error(error);
      setMessage({
        type: 'error',
        text: getAuthEmailErrorMessage(error, 'Failed to send verification email.'),
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const handlePasswordReset = async () => {
    const email = user.email || userDataToUse.email;

    if (!email) {
      setMessage({ type: 'error', text: 'No registered email address was found for this account.' });
      return;
    }

    setResettingPassword(true);
    setMessage(null);
    try {
      await resetPassword(email);
      setMessage({ type: 'success', text: `Password reset link sent to ${email}. Please check your inbox.` });
    } catch (error: any) {
      console.error(error);
      setMessage({
        type: 'error',
        text: getAuthEmailErrorMessage(error, 'Failed to send password reset email.'),
      });
    } finally {
      setResettingPassword(false);
    }
  };

  const handleConnectGoogleLogin = async () => {
    setConnectingGoogle(true);
    setMessage(null);
    try {
      const result = await connectGoogleLogin();
      await user.reload();
      await refreshUserProfile();
      setMessage({
        type: 'success',
        text: result.alreadyGoogle
          ? 'Google login is already connected.'
          : 'Google login is now connected. You can sign in with either your password or Google.',
      });
    } catch (error: any) {
      let errorMessage = error?.message || 'Failed to connect Google login.';
      const expectedGoogleLinkErrors = new Set([
        'auth/popup-closed-by-user',
        'auth/popup-blocked',
        'auth/requires-recent-login',
        'auth/credential-already-in-use',
        'auth/provider-already-linked',
        'auth/google-link-email-mismatch',
        'auth/cancelled-popup-request',
        'auth/unauthorized-domain',
        'auth/web-storage-unsupported',
      ]);

      if (!expectedGoogleLinkErrors.has(error?.code)) {
        console.warn('Unexpected Google link profile error:', error);
      }

      if (error?.code === 'auth/popup-closed-by-user') {
        errorMessage = 'The Google sign-in window was closed before Google login was connected.';
      } else if (error?.code === 'auth/popup-blocked') {
        errorMessage = 'The Google sign-in popup was blocked by your browser. Please allow popups and try again.';
      } else if (error?.code === 'auth/requires-recent-login') {
        errorMessage = 'For security, please log out, log back in, then try connecting Google again.';
      } else if (error?.code === 'auth/credential-already-in-use') {
        errorMessage = 'That Google account is already connected to another LocalPages account.';
      } else if (error?.code === 'auth/google-link-email-mismatch') {
        errorMessage = GOOGLE_LINK_EMAIL_MISMATCH_MESSAGE;
      }

      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setConnectingGoogle(false);
    }
  };

  const handleDisconnectGoogleLogin = async () => {
    setDisconnectingGoogle(true);
    setMessage(null);
    try {
      const result = await disconnectGoogleLogin();
      await user.reload();
      await refreshUserProfile();
      setMessage({
        type: 'success',
        text: result.alreadyDisconnected
          ? 'Google login is already disconnected.'
          : 'Google login was disconnected. You can continue using your email and password.',
      });
    } catch (error: any) {
      const messageText = error?.code === 'auth/requires-recent-login'
        ? 'For security, please log out, log back in, then try disconnecting Google again.'
        : error?.message || 'Failed to disconnect Google login.';
      setMessage({ type: 'error', text: messageText });
    } finally {
      setDisconnectingGoogle(false);
    }
  };

  const handleSetPasswordLogin = async () => {
    if (newPassword !== confirmNewPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setSettingPassword(true);
    setMessage(null);
    try {
      const result = await setPasswordLogin(newPassword);
      await user.reload();
      await refreshUserProfile();
      setNewPassword('');
      setConfirmNewPassword('');
      setMessage({
        type: 'success',
        text: result.alreadyPassword
          ? 'Password login is already enabled.'
          : 'Password login is now enabled. You can sign in with either Google or your password.',
      });
    } catch (error: any) {
      let messageText = error?.message || 'Failed to set password login.';
      if (error?.code === 'auth/requires-recent-login') {
        messageText = 'For security, please log out, log back in with Google, then try setting a password again.';
      }
      setMessage({ type: 'error', text: messageText });
    } finally {
      setSettingPassword(false);
    }
  };

  const handleBusinessUpgradeRequest = async () => {
    if (!user) return;

    setRequestingUpgrade(true);
    setMessage(null);
    try {
      const messageText = 'I would like to upgrade my LocalPages.ph account from Subscriber to Business so I can create and manage business listings.';
      const result = await createSupportTicket({
        userId: user.uid,
        category: 'ACCOUNT_UPGRADE',
        subject: 'Business account upgrade request',
        message: messageText,
      });

      setUpgradeRequest({
        id: result.data.support_ticket_insert,
        userId: user.uid,
        category: 'ACCOUNT_UPGRADE',
        subject: 'Business account upgrade request',
        message: messageText,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
      });
      setMessage({
        type: 'success',
        text: 'Your business account upgrade request was sent. An administrator will review it in User Management.',
      });
    } catch (error: any) {
      console.error('Business upgrade request error:', error);
      setMessage({
        type: 'error',
        text: error?.message || 'Failed to send business account upgrade request.',
      });
    } finally {
      setRequestingUpgrade(false);
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
                      {userDataToUse.displayName || `${userDataToUse.firstName || ''} ${userDataToUse.lastName || ''}`.trim() || 'User Profile'}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                      <LucideMail className="w-4 h-4 text-slate-400" />
                      {userDataToUse.email}
                    </p>
                    
                    {/* Badge Badges */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                      <Badge variant={getRoleVariant(userDataToUse.role)}>
                        {getRoleLabel(userDataToUse.role)}
                      </Badge>
                      <Badge variant={userDataToUse.accountStatus?.toLowerCase() === 'active' ? 'success' : 'warning'}>
                        {userDataToUse.accountStatus || 'Active'}
                      </Badge>
                      {user.emailVerified ? (
                        <Badge variant="success" className="gap-1">
                          <LucideCheckCircle className="w-3 h-3" />
                          Verified Email
                        </Badge>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendVerification}
                          disabled={sendingEmail}
                          className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {sendingEmail ? 'Sending Verification...' : 'Unverified Email - Verify'}
                        </button>
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

            {normalizeRole(userDataToUse.role) === ROLES.SUBSCRIBER && (
              <Card className="p-5 md:p-6 border border-blue-100 bg-blue-50/40 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm ring-1 ring-blue-100">
                      <LucideBuilding className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Upgrade to a Business Account</h2>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Send a request to unlock business listing tools after administrator approval.
                      </p>
                      {upgradeRequest && (
                        <p className="mt-2 text-xs font-semibold text-blue-700">
                          Request status: {upgradeRequest.status || 'OPEN'}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={handleBusinessUpgradeRequest}
                    isLoading={requestingUpgrade}
                    disabled={requestingUpgrade || loadingUpgradeRequest || Boolean(upgradeRequest)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  >
                    {upgradeRequest ? 'Request Pending' : 'Request Upgrade'}
                  </Button>
                </div>
              </Card>
            )}

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
                    <p className="text-slate-900 font-semibold mt-0.5">{userDataToUse.firstName || <span className="text-slate-400 italic font-normal">Not provided</span>}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Last Name</span>
                    <p className="text-slate-900 font-semibold mt-0.5">{userDataToUse.lastName || <span className="text-slate-400 italic font-normal">Not provided</span>}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Display Name</span>
                    <p className="text-slate-900 font-semibold mt-0.5">{userDataToUse.displayName || <span className="text-slate-400 italic font-normal">Not provided</span>}</p>
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
                    <p className="text-slate-900 font-semibold mt-0.5">{userDataToUse.mobileNumber || <span className="text-slate-400 italic font-normal">Not provided</span>}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Telephone Number</span>
                    <p className="text-slate-900 font-semibold mt-0.5">{userDataToUse.telephoneNumber || <span className="text-slate-400 italic font-normal">Not provided</span>}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Email Address</span>
                    <p className="text-slate-900 font-semibold mt-0.5">{userDataToUse.email}</p>
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
                    <p className="text-slate-900 font-semibold mt-0.5">{userDataToUse.addressLine1 || <span className="text-slate-400 italic font-normal">Not provided</span>}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Address Line 2</span>
                    <p className="text-slate-900 font-semibold mt-0.5">{userDataToUse.addressLine2 || <span className="text-slate-400 italic font-normal">Not provided</span>}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Barangay</span>
                    <p className="text-slate-900 font-semibold mt-0.5">{userDataToUse.barangay || <span className="text-slate-400 italic font-normal">Not provided</span>}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">City</span>
                    <p className="text-slate-900 font-semibold mt-0.5">{userDataToUse.city || <span className="text-slate-400 italic font-normal">Not provided</span>}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Province</span>
                    <p className="text-slate-900 font-semibold mt-0.5">{userDataToUse.province || <span className="text-slate-400 italic font-normal">Not provided</span>}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Region</span>
                    <p className="text-slate-900 font-semibold mt-0.5">{userDataToUse.region || <span className="text-slate-400 italic font-normal">Not provided</span>}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">ZIP Code</span>
                    <p className="text-slate-900 font-semibold mt-0.5">{userDataToUse.zipCode || <span className="text-slate-400 italic font-normal">Not provided</span>}</p>
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
                  disabled={requiresCompletion}
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
                  disabled={requiresCompletion}
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
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Mobile Number <span className="text-rose-500">*</span></label>
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
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Address Line 1 <span className="text-rose-500">*</span></label>
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
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Region <span className="text-rose-500">*</span></label>
                      <select
                        value={selectedRegionId}
                        onChange={(e) => handleRegionChange(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                      >
                        <option value="">Select Region</option>
                        {regionsList.map((region) => (
                          <option key={region.id} value={region.id}>{region.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Province <span className="text-rose-500">*</span></label>
                      <select
                        value={selectedProvinceId}
                        onChange={(e) => handleProvinceChange(e.target.value)}
                        disabled={!selectedRegionId}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        <option value="">Select Province</option>
                        {provincesList.map((province) => (
                          <option key={province.id} value={province.id}>{province.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">City/Municipality <span className="text-rose-500">*</span></label>
                      <select
                        value={selectedCityId}
                        onChange={(e) => handleCityChange(e.target.value)}
                        disabled={!selectedProvinceId}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        <option value="">Select City</option>
                        {citiesList.map((city) => (
                          <option key={city.id} value={city.id}>{city.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Barangay <span className="text-rose-500">*</span></label>
                      <Input
                        value={editData.barangay || ''}
                        onChange={(e) => setEditData({...editData, barangay: e.target.value})}
                        placeholder="Barangay"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">ZIP Code <span className="text-rose-500">*</span></label>
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
                      <p className="text-xs text-slate-500 mb-4">
                        Current login methods:{' '}
                        <span className="font-bold text-slate-800">
                          {usesPasswordLogin && usesGoogleLogin
                            ? 'Email/password and Google'
                            : usesGoogleLogin
                              ? 'Google only'
                              : 'Email and password only'}
                        </span>
                      </p>

                      <div className="space-y-4">
                        {usesPasswordLogin && (
                          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handlePasswordReset}
                              isLoading={resettingPassword}
                              disabled={resettingPassword || !(user.email || userDataToUse.email)}
                              className="bg-white border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold px-4 h-9"
                            >
                              Send Password Reset Email
                            </Button>
                            {!usesGoogleLogin && (
                              <Button
                                type="button"
                                variant="secondary"
                                onClick={handleConnectGoogleLogin}
                                isLoading={connectingGoogle}
                                disabled={connectingGoogle}
                                className="text-xs font-semibold px-4 h-9"
                              >
                                Connect Google Login
                              </Button>
                            )}
                            {usesGoogleLogin && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleDisconnectGoogleLogin}
                                isLoading={disconnectingGoogle}
                                disabled={disconnectingGoogle}
                                className="bg-white border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold px-4 h-9"
                              >
                                Disconnect Google Login
                              </Button>
                            )}
                          </div>
                        )}

                        {usesGoogleLogin && !usesPasswordLogin && (
                          <div className="space-y-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
                            <p className="text-xs font-semibold text-blue-800">
                              This account currently signs in with Google only. Set a password if you want email/password login as a backup.
                            </p>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <Input
                                type="password"
                                value={newPassword}
                                onChange={(event) => setNewPassword(event.target.value)}
                                placeholder="New password"
                                className="bg-white"
                              />
                              <Input
                                type="password"
                                value={confirmNewPassword}
                                onChange={(event) => setConfirmNewPassword(event.target.value)}
                                placeholder="Confirm password"
                                className="bg-white"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={handleSetPasswordLogin}
                              isLoading={settingPassword}
                              disabled={settingPassword || !newPassword || !confirmNewPassword}
                              className="text-xs font-semibold px-4 h-9"
                            >
                              Set Password Login
                            </Button>
                          </div>
                        )}

                        {!usesGoogleLogin && !usesPasswordLogin && (
                          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                            <p className="text-xs font-semibold text-rose-700">
                              No login provider was detected. Please connect a login method.
                            </p>
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={handleConnectGoogleLogin}
                              isLoading={connectingGoogle}
                              disabled={connectingGoogle}
                              className="text-xs font-semibold px-4 h-9"
                            >
                              Connect Google Login
                            </Button>
                          </div>
                        )}
                      </div>
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
                          disabled={sendingEmail}
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
