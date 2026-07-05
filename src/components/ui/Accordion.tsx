'use client';

import React, { useState } from 'react';
import { LucideChevronDown, LucideChevronUp } from 'lucide-react';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const Accordion: React.FC<AccordionProps> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-slate-200 rounded-lg shadow-sm overflow-hidden bg-white mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full p-4 text-left font-bold text-slate-900 hover:bg-slate-50 transition-colors"
      >
        <span>{title}</span>
        {isOpen ? <LucideChevronUp className="w-5 h-5 text-slate-500" /> : <LucideChevronDown className="w-5 h-5 text-slate-500" />}
      </button>
      {isOpen && (
        <div className="p-4 border-t border-slate-100">
          {children}
        </div>
      )}
    </div>
  );
};
