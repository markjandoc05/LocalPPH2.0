import Link from 'next/link';
import { Mail } from 'lucide-react';
import CombinedStatsAndCategories from '../home/CombinedStatsAndCategories';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="font-bold text-xl tracking-tight text-[#0C0C1C] mb-4 inline-block">
              LocalPages<span className="text-[#2563EB]">.ph</span>
            </Link>
            <p className="text-sm text-slate-500 mb-4 pr-4">
              The modern Philippine business directory. Find trusted local services, stores, and professionals.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase mb-4">For Users</h3>
            <ul className="space-y-3">
              <li><Link href="/categories" className="text-sm text-slate-500 hover:text-[#0C0C1C] transition-colors">Browse Categories</Link></li>
              <li><Link href="/locations" className="text-sm text-slate-500 hover:text-[#0C0C1C] transition-colors">Browse Locations</Link></li>
              <li><Link href="/search?featuredOnly=true" className="text-sm text-slate-500 hover:text-[#0C0C1C] transition-colors">Featured Businesses</Link></li>
              <li><Link href="/auth/register" className="text-sm text-slate-500 hover:text-[#0C0C1C] transition-colors">Create Account</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase mb-4">For Businesses</h3>
            <ul className="space-y-3">
              <li><Link href="/auth/register" className="text-sm text-slate-500 hover:text-[#0C0C1C] transition-colors">List Your Business</Link></li>
              <li><Link href="/auth/login" className="text-sm text-slate-500 hover:text-[#0C0C1C] transition-colors">Business Login</Link></li>
              <li><Link href="/pricing" className="text-sm text-slate-500 hover:text-[#0C0C1C] transition-colors">Premium Listings</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase mb-4">Support</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-slate-500 hover:text-[#0C0C1C] transition-colors">Help Center</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-[#0C0C1C] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-[#0C0C1C] transition-colors">Terms of Service</a></li>
              <li>
                <a href="mailto:support@localpages.ph" className="text-sm text-slate-500 hover:text-[#0C0C1C] transition-colors flex items-center gap-2">
                  <Mail className="h-4 w-4" /> support@localpages.ph
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-200">
          <CombinedStatsAndCategories />
          <p className="text-sm text-slate-400 text-center">
            &copy; {new Date().getFullYear()} LocalPages.ph. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
