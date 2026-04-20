'use client';

import { useState, useRef } from 'react';

export default function Tooltip({ content, children }: { content: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleEnter = () => {
    timeoutRef.current = setTimeout(() => setShow(true), 200);
  };

  const handleLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShow(false);
  };

  return (
    <span className="relative inline-flex items-center" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      {children}
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
          <span className="block bg-gray-900 text-white text-xs rounded-lg px-3 py-2 max-w-xs whitespace-normal shadow-lg leading-relaxed">
            {content}
          </span>
          <span className="block w-2 h-2 bg-gray-900 rotate-45 mx-auto -mt-1" />
        </span>
      )}
    </span>
  );
}

export function InfoIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-[var(--muted)] hover:text-[var(--accent)] cursor-help transition-colors" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 7v4M8 5.5v0" strokeLinecap="round" />
    </svg>
  );
}
