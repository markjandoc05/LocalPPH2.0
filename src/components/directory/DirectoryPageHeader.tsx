import React from "react";

interface DirectoryPageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: React.ReactNode;
}

export default function DirectoryPageHeader({
  title,
  description,
  breadcrumbs,
}: DirectoryPageHeaderProps) {
  return (
    <div className="w-full bg-gradient-to-r from-slate-900 to-slate-950 text-white py-12 md:py-16 mb-8 shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {breadcrumbs && (
          <div className="mb-4 text-xs font-mono tracking-wider text-slate-400">
            {breadcrumbs}
          </div>
        )}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-sans font-bold tracking-tight text-white mb-4">
          {title}
        </h1>
        {description && (
          <p className="text-sm md:text-base lg:text-lg font-light text-slate-300 max-w-3xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
