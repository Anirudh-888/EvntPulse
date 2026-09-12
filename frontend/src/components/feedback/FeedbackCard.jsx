import React from 'react';
import { RatingStars } from '../ui/RatingStars';
import { MessageSquareQuote } from 'lucide-react';

export const FeedbackCard = ({ feedback }) => {
  const formattedDate = new Date(feedback.submitted_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="p-4 rounded-2xl glass-card border border-slate-800/80 hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <RatingStars rating={feedback.rating} size="sm" />
        <span className="text-[11px] text-slate-500 font-mono">{formattedDate}</span>
      </div>
      {feedback.comment && (
        <p className="text-xs text-slate-300 leading-relaxed mb-3 italic">
          "{feedback.comment}"
        </p>
      )}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span>Verified Attendee: {feedback.user?.name || 'Student Attendee'}</span>
      </div>
    </div>
  );
};
