import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function RatingStars({
  rating = 0,
  maxStars = 5,
  interactive = false,
  size = 'md',
  onChange,
  disabled = false,
  className = ''
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const currentSize = starSizes[size] || starSizes.md;

  const displayScore = hoverRating || rating || 0;

  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`} role="group" aria-label={`Rating: ${rating} out of ${maxStars} stars`}>
      {Array.from({ length: maxStars }, (_, index) => {
        const starValue = index + 1;
        const isFilled = displayScore >= starValue;
        const isHalfFilled = !isFilled && displayScore >= starValue - 0.5;

        if (interactive) {
          return (
            <button
              key={starValue}
              type="button"
              disabled={disabled}
              onClick={() => onChange && onChange(starValue)}
              onMouseEnter={() => !disabled && setHoverRating(starValue)}
              onMouseLeave={() => !disabled && setHoverRating(0)}
              className={`p-0.5 rounded transition-transform focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                disabled ? 'cursor-not-allowed opacity-60' : 'hover:scale-110'
              }`}
              title={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
              aria-label={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
            >
              <Star
                className={`${currentSize} transition-colors ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-300 hover:text-amber-300'
                }`}
              />
            </button>
          );
        }

        return (
          <span key={starValue} className="inline-block">
            <Star
              className={`${currentSize} ${
                isFilled
                  ? 'text-amber-400 fill-amber-400'
                  : isHalfFilled
                  ? 'text-amber-400 fill-amber-400/50'
                  : 'text-slate-200 fill-slate-100'
              }`}
            />
          </span>
        );
      })}
    </div>
  );
}
