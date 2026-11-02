import React from 'react';
import clsx from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'blue' | 'emerald' | 'amber' | 'rose' | 'purple' | 'slate' | 'neutral';
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'sm',
  className,
  dot = false,
}) => {
  const variantStyles = {
    cyan: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
    blue: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
    purple: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
    slate: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60',
    neutral: 'bg-zinc-900 text-zinc-400 border-zinc-800',
  };

  const dotColors = {
    cyan: 'bg-sky-400',
    blue: 'bg-blue-400',
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    rose: 'bg-rose-400',
    purple: 'bg-indigo-400',
    slate: 'bg-zinc-400',
    neutral: 'bg-zinc-500',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center font-mono font-medium rounded border tracking-tight',
        size === 'xs' ? 'px-1.5 py-0.2 text-[10px]' : size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className={clsx('w-1.5 h-1.5 rounded-full mr-1.5', dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
};
