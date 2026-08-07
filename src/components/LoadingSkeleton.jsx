import React from 'react';

export default function LoadingSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="glass-card rounded-[24px] overflow-hidden border border-white/10 p-5 space-y-4 animate-pulse"
        >
          <div className="h-40 w-full bg-white/5 rounded-2xl" />
          <div className="h-5 w-2/3 bg-white/10 rounded-md" />
          <div className="h-4 w-full bg-white/5 rounded-md" />
          <div className="h-8 w-full bg-white/10 rounded-xl" />
        </div>
      ))}
    </div>
  );
}
