import React from 'react';
import { Star } from 'lucide-react';

export const RatingDistribution = ({ distribution = {}, averageRating = 0, totalFeedback = 0 }) => {
  const stars = [5, 4, 3, 2, 1];

  return (
    <div className="rounded-2xl glass-card border border-slate-800 p-5 flex flex-col md:flex-row items-center gap-6">
      {/* Average Score Badge */}
      <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-900 border border-slate-800 w-full md:w-36 text-center">
        <span className="text-4xl font-extrabold text-amber-400 font-mono">
          {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
        </span>
        <div className="flex items-center gap-1 text-amber-400 my-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${
                i < Math.round(averageRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
              }`}
            />
          ))}
        </div>
        <span className="text-[11px] text-slate-400">
          {totalFeedback} {totalFeedback === 1 ? 'review' : 'reviews'}
        </span>
      </div>

      {/* Distribution Bars */}
      <div className="flex-1 w-full space-y-2">
        {stars.map((starNum) => {
          const count = distribution[starNum] || 0;
          const percentage = totalFeedback > 0 ? Math.round((count / totalFeedback) * 100) : 0;

          return (
            <div key={starNum} className="flex items-center gap-3 text-xs">
              <span className="w-12 text-slate-400 flex items-center gap-1 shrink-0 font-medium">
                {starNum} <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              </span>
              <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-10 text-right font-mono text-slate-400 shrink-0">
                {count} ({percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
