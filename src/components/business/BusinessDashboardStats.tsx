import React from 'react';
import { BusinessStats } from '@/types/business';
import { LucideFileText, LucideClock, LucideCheckCircle, LucideAlertCircle } from 'lucide-react';
import { StatCard } from '../ui/StatCard';

export default function BusinessDashboardStats({ stats }: { stats: BusinessStats }) {
  const cards = [
    { title: 'Total Listings', value: stats.total, icon: LucideFileText },
    { title: 'Approved', value: stats.approved, icon: LucideCheckCircle },
    { title: 'Pending Approval', value: stats.pending, icon: LucideClock },
    { title: 'Needs Revision', value: stats.needsRevision, icon: LucideAlertCircle },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, i) => (
        <StatCard key={i} title={card.title} value={card.value} icon={card.icon} />
      ))}
    </div>
  );
}
