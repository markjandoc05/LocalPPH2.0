import React from 'react';

export default function RootLoading() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999]">
      <div className="h-1 w-full bg-blue-100 overflow-hidden">
        <div className="h-full bg-blue-600 animate-loading-bar origin-left"></div>
      </div>
    </div>
  );
}
