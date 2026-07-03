'use client';

import React, { useCallback, useState } from 'react';
import { LucideImage, LucideUpload, LucideFileText } from 'lucide-react';

interface MediaUploaderProps {
  onFileSelect: (file: File) => void;
  accept: string;
  label: string;
  helperText?: string;
  isUploading?: boolean;
  type?: 'image' | 'document';
}

export default function MediaUploader({ 
  onFileSelect, 
  accept, 
  label, 
  helperText, 
  isUploading = false,
  type = 'image'
}: MediaUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50 bg-white'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="mb-4 text-gray-400">
        {type === 'image' ? <LucideImage className="w-10 h-10 mx-auto" /> : <LucideFileText className="w-10 h-10 mx-auto" />}
      </div>
      <p className="text-sm font-medium text-gray-900 mb-1">{label}</p>
      {helperText && <p className="text-xs text-gray-500 mb-4">{helperText}</p>}
      
      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
        <LucideUpload className="w-4 h-4" />
        {isUploading ? 'Uploading...' : 'Select File'}
        <input 
          type="file" 
          className="sr-only" 
          accept={accept}
          onChange={handleChange}
          disabled={isUploading}
        />
      </label>
    </div>
  );
}
