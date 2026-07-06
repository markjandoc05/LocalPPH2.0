import { searchApprovedBusinesses } from '@/lib/data-connect/public-business-service';
import { getAllCategories } from '@/lib/data-connect/directory-service';
import { getAllUsers } from '@/lib/data-connect';

export default async function CombinedStatsAndCategories() {
  // Fetch data
  const [businesses, categories, usersRes] = await Promise.all([
    searchApprovedBusinesses({}, { page: 1, limit: 0 }),
    getAllCategories(),
    getAllUsers()
  ]);

  const userCount = usersRes.data?.users?.length || 0;

  return (
    <div className="text-center text-sm text-slate-500 py-4">
      <p>
        We have <span className="font-semibold">{businesses.total}</span> trusted businesses across <span className="font-semibold">{categories.length}</span> categories, and <span className="font-semibold">{userCount}</span> registered users.
      </p>
    </div>
  );
}
