import React from 'react';
import Image from 'next/image';
import { LucideX, LucideLoader2 } from 'lucide-react';

interface ImagePreviewCardProps {
  url: string;
  onRemove: () => void;
  isUploading?: boolean;
  progress?: number;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'auto';
  objectFit?: 'cover' | 'contain';
}

export default function ImagePreviewCard({ 
  url, 
  onRemove, 
  isUploading, 
  progress = 0,
  className = '',
  aspectRatio = 'square',
  objectFit = 'cover'
}: ImagePreviewCardProps) {
  const aspectClass = 
    aspectRatio === 'square' ? 'aspect-square' :
    aspectRatio === 'video' ? 'aspect-video' : '';

  return (
    <div className={`relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50 ${aspectClass} ${className}`}>
      {isUploading ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 bg-opacity-80 z-10">
          <LucideLoader2 className="w-6 h-6 animate-spin text-blue-600 mb-2" />
          <div className="text-xs font-medium text-gray-700">{Math.round(progress)}%</div>
          <div className="w-2/3 h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : null}
      
      {url && !isUploading && (
        <>
          <div className="absolute inset-0">
            <Image 
              src={url} 
              alt="Preview" 
              fill 
              className={objectFit === 'contain' ? 'object-contain p-2' : 'object-cover'}
              referrerPolicy="no-referrer"
            />
          </div>
          <button
            onClick={onRemove}
            type="button"
            className="absolute top-2 right-2 p-1.5 bg-white bg-opacity-90 rounded-full text-gray-700 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all shadow-sm z-20"
            aria-label="Remove image"
          >
            <LucideX className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
}
