import React from 'react';

interface BusinessLogoProps {
  url?: string | null;
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function BusinessLogo({ url, name, className, size = 'md' }: BusinessLogoProps) {
  const sizeClasses = {
    sm: 'w-12 h-12 rounded-lg',
    md: 'w-16 h-16 rounded-xl',
    lg: 'w-32 h-32 rounded-2xl',
  };

  const logoSize = sizeClasses[size];

  return (
    <div className={`bg-white border border-slate-200 flex items-center justify-center overflow-hidden ${logoSize} ${className}`}>
      {url ? (
        <img 
          src={url} 
          alt={`${name} Logo`} 
          className="w-full h-full object-contain p-2"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold uppercase">
          {name.slice(0, 2)}
        </div>
      )}
    </div>
  );
}
