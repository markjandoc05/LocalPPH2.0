'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { logoutUser } from '@/lib/auth/auth-utils';
import { useRouter } from 'next/navigation';
import { canAccessAdmin, isBusiness } from '@/lib/auth/roles';
import { Button, buttonVariants } from '@/components/ui/Button';

export default function Header() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutUser();
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
            <Link href="/categories" className="text-sm font-medium text-slate-600 hover:text-[#0C0C1C] transition-colors">
              Browse Categories
            </Link>
            <Link href="/locations" className="text-sm font-medium text-slate-600 hover:text-[#0C0C1C] transition-colors">
              Browse Locations
            </Link>
            <Link href="/business/listings/new" className="text-sm font-medium text-slate-600 hover:text-[#0C0C1C] transition-colors">
              List Your Business
            </Link>
          </nav>
        </div>

        <nav className="flex items-center gap-4">
          {!loading && (
            <>
              {user ? (
                <>
                  <Link 
                    href={getDashboardLink()} 
                    className={buttonVariants({ variant: 'ghost' })}
                  >
                    Dashboard
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
                    className={buttonVariants({ variant: 'ghost' })}
                  >
                    Log In
                  </Link>
                  <Link 
                    href="/auth/register" 
                    className={buttonVariants({ variant: 'default' })}
                  >
                    Register
                  </Link>
                </>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
