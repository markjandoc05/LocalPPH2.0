'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { logoutUser } from '@/lib/auth/auth-utils';
import { useRouter, usePathname } from 'next/navigation';
import { canAccessAdmin, isBusiness } from '@/lib/auth/roles';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, role, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutUser();
      setIsMenuOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const getDashboardLink = () => {
    if (canAccessAdmin(role)) return '/admin';
    if (isBusiness(role)) return '/business';
    return '/dashboard';
  };

  return (
    <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex-shrink-0">
            <Link href="/" className="font-bold text-xl tracking-tight text-[#0C0C1C]">
              LocalPages<span className="text-[#2563EB]">.ph</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/search" className="text-sm font-medium text-slate-600 hover:text-[#0C0C1C] transition-colors">
              Listing
            </Link>
            <Link href="/business/listings/new" prefetch={false} className="text-sm font-medium text-slate-600 hover:text-[#0C0C1C] transition-colors">
              List Your Business
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
          
          <nav className="hidden md:flex items-center gap-4">
            {loading ? (
              <span className="text-xs text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-md animate-pulse select-none cursor-not-allowed">
                Checking login...
              </span>
            ) : user ? (
              <>
                <Link 
                  href={getDashboardLink()} 
                  prefetch={false}
                  className={buttonVariants({ variant: 'ghost' })}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/profile" 
                  prefetch={false}
                  className={buttonVariants({ variant: 'ghost' })}
                >
                  My Profile
                </Link>
                <Button 
                  variant="outline"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link 
                  href="/auth/login" 
                  prefetch={false}
                  className={buttonVariants({ variant: 'ghost' })}
                >
                  Log In
                </Link>
                <Link 
                  href="/auth/register" 
                  prefetch={false}
                  className={buttonVariants({ variant: 'default' })}
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 p-4">
          <nav className="flex flex-col gap-4">
            <Link href="/search" className="text-sm font-medium text-slate-600 hover:text-[#0C0C1C]" onClick={() => setIsMenuOpen(false)}>
              Listing
            </Link>
            <Link href="/business/listings/new" prefetch={false} className="text-sm font-medium text-slate-600 hover:text-[#0C0C1C]" onClick={() => setIsMenuOpen(false)}>
              List Your Business
            </Link>
            {loading ? (
              <div className="text-xs text-slate-400 bg-slate-50 border border-slate-100 text-center py-2 rounded-md animate-pulse select-none cursor-not-allowed">
                Checking login...
              </div>
            ) : user ? (
              <>
                <Link 
                  href={getDashboardLink()} 
                  prefetch={false}
                  className="text-sm font-medium text-slate-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/profile" 
                  prefetch={false}
                  className="text-sm font-medium text-slate-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Profile
                </Link>
                <Button 
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link 
                  href="/auth/login" 
                  prefetch={false}
                  className="text-sm font-medium text-slate-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link 
                  href="/auth/register" 
                  prefetch={false}
                  className={buttonVariants({ variant: 'default' })}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
