'use client';

import { useState } from 'react';
import Link from 'next/link';
import { registerUser, loginWithGoogle } from '@/lib/auth/auth-utils';
import { ROLES } from '@/lib/auth/roles';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { LucideStore, LucideUser, LucideBriefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState<string>(ROLES.SUBSCRIBER);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerUser(email, password, name, accountType);
      trackEvent('signup', { method: 'email', role: accountType, page_type: 'Register' });
      router.push('/profile?complete=1');
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle(accountType);
      trackEvent('signup', { method: 'google', role: accountType, page_type: 'Register' });
      router.push('/profile?complete=1');
    } catch (err: any) {
      console.error("Google register error:", err);
      let userFriendlyMessage = err.message || 'Failed to register with Google';
      
      if (err.code === 'auth/popup-blocked') {
        userFriendlyMessage = 'The Google sign-in popup was blocked by your browser. Please allow popups or click the "Open in new tab" button at the top-right of the window to run the app outside of the preview frame.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        userFriendlyMessage = 'The Google login window was closed before completion. Please try again.';
      } else if (err.code === 'auth/operation-not-allowed') {
        userFriendlyMessage = 'Google Sign-In is not enabled as an Auth provider in your Firebase project. Please enable it in the Firebase Console under Authentication > Sign-in method > Google.';
      } else if (err.code === 'auth/unauthorized-domain') {
        const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
        userFriendlyMessage = `This domain (${currentDomain}) is not authorized for Google Sign-In in your Firebase project. Please add it to the authorized domains list in the Firebase Console (Authentication > Settings > Authorized domains).`;
      } else if (err.code === 'auth/web-storage-unsupported' || err.message?.includes('storage-unsupported') || err.message?.includes('third-party')) {
        userFriendlyMessage = 'Third-party storage/cookies are restricted in this preview frame, which blocks Google Login. Please open this app in a new tab using the button at the top-right of the screen and register there.';
      } else if (typeof window !== 'undefined' && window.self !== window.top) {
        userFriendlyMessage = `${userFriendlyMessage} (Tip: Since this app is running in a preview frame, browsers often block Google authentication popups. Try opening the app in a new tab using the top-right button to register successfully.)`;
      }
      
      setError(userFriendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-12 bg-[#0C0C1C] text-white">
        <div className="max-w-md">
          <LucideStore className="w-12 h-12 text-blue-500 mb-8" />
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Grow Your Business. Get Found Locally.
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Whether you're looking for trusted local businesses or promoting your own, LocalPages.ph helps connect customers with businesses across the Philippines.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold">✓</div>
              <p className="text-slate-300">Free to create your business listing</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold">✓</div>
              <p className="text-slate-300">Increase your business and brand visibility</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold">✓</div>
              <p className="text-slate-300">Trusted and quality business directory</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold">✓</div>
              <p className="text-slate-300">Supporting local Philippine businesses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
            <p className="text-slate-500 mt-2">Join LocalPages to discover or list businesses</p>
          </div>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold">Register</CardTitle>
              <CardDescription>Get started with your free account</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-3">Choose your account type</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setAccountType(ROLES.SUBSCRIBER)}
                      className={cn(
                        "flex flex-col items-center p-4 rounded-xl border-2 transition-all text-center",
                        accountType === ROLES.SUBSCRIBER 
                          ? "border-blue-600 bg-blue-50/50 text-blue-700" 
                          : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                      )}
                    >
                      <LucideUser className={cn("w-6 h-6 mb-2", accountType === ROLES.SUBSCRIBER ? "text-blue-600" : "text-slate-400")} />
                      <span className="text-sm font-semibold">Personal</span>
                      <span className="text-[10px] mt-1 leading-tight text-slate-500">Discover trusted local businesses, save your favorite listings, and manage your profile.</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountType(ROLES.BUSINESS)}
                      className={cn(
                        "flex flex-col items-center p-4 rounded-xl border-2 transition-all text-center",
                        accountType === ROLES.BUSINESS 
                          ? "border-blue-600 bg-blue-50/50 text-blue-700" 
                          : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                      )}
                    >
                      <LucideBriefcase className={cn("w-6 h-6 mb-2", accountType === ROLES.BUSINESS ? "text-blue-600" : "text-slate-400")} />
                      <span className="text-sm font-semibold">Business</span>
                      <span className="text-[10px] mt-1 leading-tight text-slate-500">List and manage your business, reach more customers, and grow your online presence.</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                  <Input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Juan Dela Cruz"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                  <Input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                  <Input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                  />
                  <p className="mt-1.5 text-xs text-slate-500">Must be at least 6 characters long.</p>
                </div>

                <Button type="submit" className="w-full mt-2" size="lg" isLoading={loading}>
                  Create Account
                </Button>
              </form>

              <div className="my-6 flex items-center">
                <div className="flex-1 border-t border-slate-200"></div>
                <span className="px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Or continue with</span>
                <div className="flex-1 border-t border-slate-200"></div>
              </div>

              <Button 
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleGoogleLogin}
                isLoading={loading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Sign up with Google
              </Button>
            </CardContent>
          </Card>

          <p className="mt-8 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-blue-600 hover:text-blue-700">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
