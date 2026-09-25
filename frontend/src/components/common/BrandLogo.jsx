import React from 'react';
import { Link } from 'react-router-dom';

/**
 * BrandLogo — Official Campus Notes Academic Identity
 * Features the signature fusion of the Academic Graduation Cap, Open Knowledge Pages, and Golden Beacon.
 */
export default function BrandLogo({
  size = 'md',
  showText = true,
  showSubtitle = true,
  subtitle = 'KNIT Sultanpur',
  className = '',
  linkTo = '/',
  isClickable = true
}) {
  const sizeMap = {
    sm: {
      box: 'w-8 h-8 rounded-xl',
      icon: 'w-8 h-8',
      title: 'text-base',
      sub: 'text-[9px]'
    },
    md: {
      box: 'w-10 h-10 rounded-xl',
      icon: 'w-10 h-10',
      title: 'text-lg',
      sub: 'text-[10px]'
    },
    lg: {
      box: 'w-12 h-12 rounded-2xl',
      icon: 'w-12 h-12',
      title: 'text-2xl',
      sub: 'text-xs'
    },
    xl: {
      box: 'w-16 h-16 rounded-3xl',
      icon: 'w-16 h-16',
      title: 'text-3xl',
      sub: 'text-sm'
    }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const logoGraphic = (
    <div
      className={`relative shrink-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 shadow-md ring-1 ring-blue-500/20 group-hover:shadow-lg group-hover:scale-[1.03] transition-all duration-300 ${currentSize.box}`}
    >
      <img
        src="/logo.png"
        alt="Campus Notes Logo"
        className="w-full h-full object-cover select-none"
        onError={(e) => {
          // Fallback to favicon SVG if png fails to load
          e.currentTarget.src = '/favicon.svg';
        }}
      />
    </div>
  );

  const textContent = showText && (
    <div className="flex flex-col text-left">
      <div className={`font-extrabold text-slate-900 tracking-tight leading-none ${currentSize.title}`}>
        <span>Campus</span>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600">
          Notes
        </span>
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 ml-0.5 mb-0.5 animate-pulse" />
      </div>

      {showSubtitle && (
        <span className={`font-semibold text-slate-400 uppercase tracking-widest mt-0.5 ${currentSize.sub}`}>
          {subtitle}
        </span>
      )}
    </div>
  );

  const containerClasses = `inline-flex items-center gap-2.5 group select-none ${className}`;

  if (isClickable && linkTo) {
    return (
      <Link to={linkTo} className={containerClasses} title="Campus Notes — Home">
        {logoGraphic}
        {textContent}
      </Link>
    );
  }

  return (
    <div className={containerClasses}>
      {logoGraphic}
      {textContent}
    </div>
  );
}
