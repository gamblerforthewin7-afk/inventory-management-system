import React from 'react';

interface BadgeProps {
  variant?: 'danger' | 'warning' | 'success' | 'info' | 'neutral';
  children: React.ReactNode;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', children, size = 'sm' }) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full border transition-colors';
  const sizeStyles = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  const variantStyles = {
    danger: 'bg-red-950/80 text-red-400 border-red-800/60 shadow-[0_0_10px_rgba(239,68,68,0.2)]',
    warning: 'bg-amber-950/80 text-amber-400 border-amber-800/60',
    success: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60',
    info: 'bg-sky-950/80 text-sky-400 border-sky-800/60',
    neutral: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  };

  return (
    <span className={`${baseStyles} ${sizeStyles} ${variantStyles[variant]}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        variant === 'danger' ? 'bg-red-500 animate-pulse' :
        variant === 'warning' ? 'bg-amber-500' :
        variant === 'success' ? 'bg-emerald-500' :
        variant === 'info' ? 'bg-sky-500' : 'bg-zinc-400'
      }`}></span>
      {children}
    </span>
  );
};
