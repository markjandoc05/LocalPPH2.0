import { getAllCategories } from '@/lib/data-connect/directory-service';
import Link from 'next/link';
import { 
  Utensils, 
  Stethoscope, 
  Sparkles, 
  ShoppingBag, 
  Briefcase, 
  Home, 
  Car, 
  Plane 
} from 'lucide-react';

const iconMap: { [key: string]: React.ElementType } = {
  'food-dining': Utensils,
  'health-medical': Stethoscope,
  'beauty-wellness': Sparkles,
  'shopping-retail': ShoppingBag,
  'professional-services': Briefcase,
  'home-services': Home,
  'automotive': Car,
  'travel-tourism': Plane,
};

export default async function CategoriesGrid() {
  const categories = await getAllCategories();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {categories.slice(0, 8).map((category) => {
        const Icon = iconMap[category.slug] || Briefcase;
        return (
          <Link
            key={category.id}
            href={`/search?category=${category.id}`}
            className="flex flex-col items-center p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 text-blue-600">
              <Icon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-900 text-center">{category.name}</h3>
            <p className="text-xs text-slate-500 mt-1">{category.subcategoryCount} subcategories</p>
          </Link>
        );
      })}
    </div>
  );
}
