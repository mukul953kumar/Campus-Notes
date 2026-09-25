import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const VARIANTS = {
  verified: 'bg-emerald-50 text-emerald-800 border-emerald-200/90 font-semibold',
  pending: 'bg-amber-50 text-amber-800 border-amber-200/90 font-medium',
  rejected: 'bg-rose-50 text-rose-800 border-rose-200/90 font-medium',
  primary: 'bg-blue-50 text-blue-800 border-blue-200/90 font-semibold',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200 font-medium',
  notes: 'bg-blue-50 text-blue-800 border-blue-200/90 font-semibold',
  pyq: 'bg-purple-50 text-purple-800 border-purple-200/90 font-semibold',
  assignment: 'bg-emerald-50 text-emerald-800 border-emerald-200/90 font-semibold',
  practical: 'bg-amber-50 text-amber-800 border-amber-200/90 font-semibold',
  syllabus: 'bg-indigo-50 text-indigo-800 border-indigo-200/90 font-semibold',
};

export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  showIcon = false,
  className = '',
}) {
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';
  const variantClass = VARIANTS[variant] || VARIANTS.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full border ${variantClass} ${sizeClasses} ${className}`}
    >
      {showIcon && variant === 'verified' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
      {showIcon && variant === 'pending' && <Clock className="w-3 h-3 text-amber-600" />}
      {showIcon && variant === 'rejected' && <AlertCircle className="w-3 h-3 text-rose-600" />}
      {children}
    </span>
  );
}
