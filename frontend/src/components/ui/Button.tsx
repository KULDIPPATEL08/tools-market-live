import React from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'sm',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}) => {
  const sizeStyles = {
    xs: 'px-2 py-1 text-[11px] gap-1.5 h-6',
    sm: 'px-2.5 py-1 text-xs gap-1.5 h-7',
    md: 'px-3 py-1.5 text-xs gap-2 h-8',
    lg: 'px-4 py-2 text-sm gap-2 h-9',
  };

  const variantStyles = {
    primary:
      'bg-zinc-100 hover:bg-white text-zinc-950 font-medium shadow-sm border border-white/20 active:translate-y-px',
    secondary:
      'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700 active:bg-zinc-850',
    outline:
      'bg-transparent hover:bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-zinc-700 active:bg-zinc-900',
    danger:
      'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 hover:border-rose-500/40 active:bg-rose-500/25',
    ghost:
      'bg-transparent hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-100 border-transparent',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={clsx(
        'inline-flex items-center justify-center rounded-md font-sans font-medium transition-all duration-100 outline-none select-none cursor-pointer tracking-tight focus:ring-1 focus:ring-zinc-500 disabled:opacity-40 disabled:cursor-not-allowed',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
