import { getAllCategories } from '@/lib/data-connect/directory-service';
import Link from 'next/link';
import { 
  Utensils, 
  Wheat,
  Sparkles, 
  Briefcase, 
  Car, 
  Church,
  GraduationCap,
  CalendarDays,
  Scale,
} from 'lucide-react';

const iconMap: { [key: string]: React.ElementType } = {
  'agriculture-local-trade': Wheat,
  'automotive': Car,
  'beauty-wellness': Sparkles,
  'community-religious': Church,
  'education-training': GraduationCap,
  'events-entertainment': CalendarDays,
  'finance-legal': Scale,
  'food-dining': Utensils,
};

export default async function CategoriesGrid() {
  let categories = [];

  try {
    categories = await getAllCategories();
  } catch (error) {
    console.error("Failed to load home categories:", error);
    return null;
  }

  return (
    <section>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Browse by category</h2>
          <p className="mt-2 text-slate-500">Find local businesses by the service you need.</p>
        </div>
        <Link href="/categories" className="inline-flex text-sm font-medium text-blue-600 transition-colors hover:text-blue-700">
          View all categories
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {categories.slice(0, 8).map((category) => {
          const Icon = iconMap[category.slug] || Briefcase;
          return (
            <Link
              key={category.id}
              href={`/search?category=${category.slug}`}
              className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 transition-colors group-hover:text-blue-600">
                {category.name}
              </h3>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
