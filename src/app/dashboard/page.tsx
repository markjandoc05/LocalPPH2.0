'use client';

import { useAuth } from '@/lib/auth/AuthContext';

export default function DashboardPage() {
  const { user, role, loading } = useAuth();

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-[#0C0C1C] mb-4">Subscriber Dashboard</h1>
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <p className="text-gray-600">Welcome, {user.displayName || user.email}</p>
        <p className="text-sm text-gray-500 mt-2">Role: {role}</p>
        <p className="mt-4 text-gray-800">Your saved businesses and preferences will appear here.</p>
      </div>
    </div>
  );
}
