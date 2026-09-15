import React from 'react';
import { clsx } from 'clsx';

export function LoadingSkeleton({ className, count = 1 }) {
  const items = Array.from({ length: count });

  return (
    <>
      {items.map((_, i) => (
        <div
          key={i}
          className={clsx(
            'animate-pulse rounded-xl bg-slate-800/60 border border-slate-700/40',
            className
          )}
          aria-hidden="true"
        />
      ))}
    </>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="h-5 w-40 bg-slate-800 rounded-md" />
        <div className="h-4 w-16 bg-slate-800 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-28 bg-slate-800/70 rounded" />
        <div className="h-3 w-36 bg-slate-800/70 rounded" />
      </div>
      <div className="h-9 w-full bg-slate-800/50 rounded-xl pt-2" />
    </div>
  );
}

export default LoadingSkeleton;
