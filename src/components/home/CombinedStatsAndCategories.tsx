import { searchApprovedBusinesses } from '@/lib/data-connect/public-business-service';
import { getAllCategories } from '@/lib/data-connect/directory-service';
import { getAllUsers } from '@/lib/data-connect';

export default async function CombinedStatsAndCategories() {
  let stats: { businessesTotal: number; categoriesCount: number; userCount: number } | null = null;

  try {
    // Fetch data
    const [businesses, categories, usersRes] = await Promise.all([
      searchApprovedBusinesses({}, { page: 1, limit: 0 }),
      getAllCategories(),
      getAllUsers()
    ]);

    stats = {
      businessesTotal: businesses.total,
      categoriesCount: categories.length,
      userCount: usersRes.data?.users?.length || 0
    };
  } catch {
    console.warn("Skipping real stats in footer during build or database connection absence.");
  }

  if (stats) {
    return (
      <div className="text-center text-sm text-slate-500 py-4">
        <p>
          We have <span className="font-semibold">{stats.businessesTotal}</span> trusted businesses across <span className="font-semibold">{stats.categoriesCount}</span> categories, and <span className="font-semibold">{stats.userCount}</span> registered users.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center text-sm text-slate-500 py-4">
      <p>
        Connecting you with trusted local businesses in the Philippines.
      </p>
    </div>
  );
}
