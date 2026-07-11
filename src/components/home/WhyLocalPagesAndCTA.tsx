import { LucideCheckCircle, LucideGlobe, LucideSearch, LucideUserPlus } from 'lucide-react';
import Link from 'next/link';

export default function WhyLocalPagesSection() {
  const features = [
    { title: 'Trusted Local Businesses', description: 'Verified and quality business listings.', icon: LucideCheckCircle },
    { title: 'Nationwide Coverage', description: 'Businesses from all regions of the Philippines.', icon: LucideGlobe },
    { title: 'Easy Business Discovery', description: 'Search by category or location.', icon: LucideSearch },
    { title: 'Free Business Listing', description: 'Business owners can list their business for free.', icon: LucideUserPlus },
  ];

  return (
    <section>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 text-center mb-12">Why LocalPages.ph</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <feature.icon className="w-10 h-10 text-blue-600 mb-6" />
                    <h3 className="font-bold text-lg text-slate-900 mb-2">{feature.title}</h3>
                    <p className="text-slate-600 text-sm">{feature.description}</p>
                </div>
            ))}
        </div>
    </section>
  );
}

export function BusinessOwnerCTA() {
    return (
        <section className="bg-[#0C0C1C] rounded-3xl p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Grow Your Business with LocalPages.ph</h2>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">Create your free business profile and reach more customers across the Philippines.</p>
            <Link href="/auth/register" className="inline-block px-8 py-4 rounded-2xl text-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                Create Free Business Listing
            </Link>
        </section>
    );
}
