'use client';

import { useCallback, useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { createUser, getUserById, updateUser } from '@/lib/data-connect';
import { getAuthEmailErrorMessage, sendVerificationEmail, resetPassword } from '@/lib/auth/auth-utils';
import { getMissingProfileFields, isProfileComplete } from '@/lib/auth/profile-completion';
import { ROLES } from '@/lib/auth/roles';
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
  const { user, role, loading: authLoading, refreshUserProfile } = useAuth();

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
  const [requiresCompletion, setRequiresCompletion] = useState(false);
  const [regionsList, setRegionsList] = useState<DirectoryRegion[]>([]);
  const [provincesList, setProvincesList] = useState<DirectoryProvince[]>([]);
  const [citiesList, setCitiesList] = useState<DirectoryCity[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const [selectedProvinceId, setSelectedProvinceId] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');

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
                      <p className="text-xs text-slate-500 mb-4">You can request a password reset email to safely secure or update your current login credentials.</p>
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
