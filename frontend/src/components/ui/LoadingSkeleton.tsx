import React from 'react';
import clsx from 'clsx';

interface LoadingSkeletonProps {
  rows?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ rows = 4, className }) => {
  return (
    <div className={clsx('space-y-3 animate-pulse', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 rounded-xl bg-slate-800/40 border border-slate-800">
          <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-700/50 rounded w-1/3" />
            <div className="h-3 bg-slate-700/30 rounded w-2/3" />
          </div>
          <div className="w-16 h-6 rounded bg-slate-700/40" />
        </div>
      ))}
    </div>
  );
};
