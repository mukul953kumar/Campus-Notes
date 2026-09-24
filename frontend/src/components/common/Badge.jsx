import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const VARIANTS = {
  verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  primary: 'bg-blue-50 text-blue-700 border-blue-200',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  notes: 'bg-blue-50 text-blue-700 border-blue-200',
  pyq: 'bg-purple-50 text-purple-700 border-purple-200',
  assignment: 'bg-teal-50 text-teal-700 border-teal-200',
  practical: 'bg-sky-50 text-sky-700 border-sky-200',
  syllabus: 'bg-indigo-50 text-indigo-700 border-indigo-200',
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
