import Link from "next/link";
import { Tag } from "lucide-react";
import { DirectorySubcategory } from "@/lib/data-connect/directory-service";

interface SubcategoryListProps {
  subcategories: DirectorySubcategory[];
  mainCategoryName: string;
}

export default function SubcategoryList({ subcategories, mainCategoryName }: SubcategoryListProps) {
  if (subcategories.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm mb-8">
      <h2 className="text-lg font-sans font-semibold text-[#0C0C1C] mb-4 flex items-center gap-2">
        <Tag className="h-5 w-5 text-[#2563EB]" />
        <span>Subcategories under {mainCategoryName}</span>
      </h2>
      <div className="flex flex-wrap gap-2">
        {subcategories.map((sub) => (
          <Link
            key={sub.id}
            href={`/search?category=${encodeURIComponent(sub.slug)}`}
            className="px-3 py-1.5 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-[#2563EB] rounded-full text-xs font-medium transition-colors border border-slate-100 hover:border-blue-100"
          >
            {sub.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
