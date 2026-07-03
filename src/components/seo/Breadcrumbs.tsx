import React from 'react';
import Link from 'next/link';
import { LucideChevronRight, LucideHome } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm text-slate-500">
        <li>
          <Link href="/" className="hover:text-slate-900 transition-colors">
            <LucideHome className="w-4 h-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} className="flex items-center">
              <LucideChevronRight className="w-4 h-4 text-slate-400 mx-1 flex-shrink-0" />
              {isLast || !item.href ? (
                <span className="font-medium text-slate-900 line-clamp-1" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-slate-900 transition-colors line-clamp-1">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
