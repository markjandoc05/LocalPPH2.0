import React from 'react';
import { LucideFileText, LucideX, LucideLoader2 } from 'lucide-react';

interface DocumentUploadCardProps {
  fileName: string;
  onRemove: () => void;
  isUploading?: boolean;
  progress?: number;
  error?: string;
}

export default function DocumentUploadCard({ 
  fileName, 
  onRemove, 
  isUploading, 
  progress = 0,
  error
}: DocumentUploadCardProps) {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-md shrink-0">
          <LucideFileText className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
          {isUploading && (
            <div className="flex items-center gap-2 mt-1">
              <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
            </div>
          )}
          {error && (
            <p className="text-xs text-red-600 mt-1">{error}</p>
          )}
        </div>
      </div>
      
      {!isUploading && (
        <button
          onClick={onRemove}
          type="button"
          className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-50 transition-colors shrink-0"
          aria-label="Remove document"
        >
          <LucideX className="w-4 h-4" />
        </button>
      )}
      
      {isUploading && (
        <div className="p-1.5 text-blue-600 shrink-0">
          <LucideLoader2 className="w-4 h-4 animate-spin" />
        </div>
      )}
    </div>
  );
}
