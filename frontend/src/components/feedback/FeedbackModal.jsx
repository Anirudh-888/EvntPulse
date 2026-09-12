import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { RatingStars } from '../ui/RatingStars';
import { feedbackApi } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import confetti from 'canvas-confetti';

export const FeedbackModal = ({ isOpen, onClose, eventId, eventTitle, onFeedbackSubmitted }) => {
  const { toastSuccess, toastError } = useNotification();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      toastError('Please select a star rating');
      return;
    }

    setSubmitting(true);
    try {
      await feedbackApi.submit(eventId, {
        rating: Number(rating),
        comment: comment.trim() || undefined,
      });
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
      toastSuccess('Thank you! Your feedback has been recorded.');
      if (onFeedbackSubmitted) onFeedbackSubmitted();
      onClose();
    } catch (err) {
      toastError(err.friendlyMessage || 'Feedback submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Event Feedback & Rating" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-slate-300">
          How was your experience attending <strong className="text-white">{eventTitle}</strong>?
        </p>

        {/* Interactive Star Rating */}
        <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
            Select Your Rating
          </span>
          <RatingStars rating={rating} size="lg" interactive={true} onChange={setRating} />
          <span className="text-xs text-amber-400 font-bold mt-2 font-mono">
            {rating} of 5 Stars
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Attendee Comments (Optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="What went well? Any suggestions for the organizers?"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold transition-all shadow-md shadow-indigo-600/30"
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
