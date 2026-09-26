import React from 'react';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white border-transparent shadow-xs',
  secondary: 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 border-slate-200 shadow-xs',
  outline: 'bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border-slate-300 shadow-xs',
  ghost: 'bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-600 hover:text-slate-900 border-transparent',
  danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white border-transparent shadow-xs',
  success: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white border-transparent shadow-xs',
};

const SIZES = {
  sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-lg',
  md: 'text-xs sm:text-sm px-3.5 py-2 gap-2 rounded-lg',
  lg: 'text-sm sm:text-base px-4 py-2 sm:px-4.5 sm:py-2.5 gap-2 sm:gap-2.5 rounded-xl',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed select-none cursor-pointer';
  const variantClass = VARIANTS[variant] || VARIANTS.primary;
  const sizeClass = SIZES[size] || SIZES.md;

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />
      )}
      <span>{children}</span>
      {!isLoading && Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4 shrink-0" />
      )}
    </button>
  );
}
