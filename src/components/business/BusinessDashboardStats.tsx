import React from 'react';
import { BusinessStats } from '@/types/business';
import { LucideFileText, LucideClock, LucideCheckCircle, LucideEdit } from 'lucide-react';
import { StatCard } from '../ui/StatCard';

export default function BusinessDashboardStats({ stats }: { stats: BusinessStats }) {
  const cards = [
    { title: 'My Listings', value: stats.total, icon: LucideFileText },
    { title: 'Drafts', value: stats.draft, icon: LucideEdit },
    { title: 'Pending Approval', value: stats.pending, icon: LucideClock },
    { title: 'Approved', value: stats.approved, icon: LucideCheckCircle },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, i) => (
        <StatCard key={i} title={card.title} value={card.value} icon={card.icon} />
      ))}
    </div>
  );
}
