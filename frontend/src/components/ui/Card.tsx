import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  isFloating?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  title,
  subtitle,
  headerAction,
  isFloating = false,
}) => {
  return (
    <div
      className={clsx(
        'rounded-xl p-5 border',
        isFloating
          ? 'antigravity-card'
          : 'bg-space-800/80 border-slate-800/80 shadow-md backdrop-blur-sm',
        className
      )}
    >
      {(title || subtitle || headerAction) && (
        <div className="flex items-start justify-between mb-4 pb-3 border-b border-slate-800/60">
          <div>
            {title && <h3 className="text-base font-semibold text-slate-100">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

