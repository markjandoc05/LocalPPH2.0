import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface LocationBreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function LocationBreadcrumbs({ items }: LocationBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs md:text-sm text-slate-500 font-sans py-2 overflow-x-auto whitespace-nowrap">
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-[#2563EB] transition-colors text-slate-400"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="sr-only">Home</span>
      </Link>
      
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} className="flex items-center space-x-2">
            <ChevronRight className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
            {isLast || !item.href ? (
              <span className="font-semibold text-[#0C0C1C] truncate max-w-[200px]" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-[#2563EB] transition-colors text-slate-500 hover:underline"
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
