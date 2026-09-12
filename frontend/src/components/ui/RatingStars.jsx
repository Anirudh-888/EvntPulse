import React from 'react';
import { Star } from 'lucide-react';

export const RatingStars = ({
  rating = 0,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
}) => {
  const sizeMap = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const starSize = sizeMap[size] || sizeMap.md;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= Math.round(rating);

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(starValue)}
            className={`${
              interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'
            } focus:outline-none`}
          >
            <Star
              className={`${starSize} ${
                isFilled
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-600 fill-transparent'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};
