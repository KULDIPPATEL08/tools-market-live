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
}) => {
  return (
    <div
      className={clsx(
        'rounded-lg p-4 border border-zinc-800 bg-[#121215] shadow-subtle',
        className
      )}
    >
      {(title || subtitle || headerAction) && (
        <div className="flex items-start justify-between mb-3 pb-2.5 border-b border-zinc-800/80">
          <div>
            {title && <h3 className="text-sm font-semibold text-zinc-100 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
