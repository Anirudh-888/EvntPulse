import React, { useState } from 'react';
import { CheckCircle, BarChart2, Radio, Vote } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';
import { pollsApi } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

export const PollCard = ({ poll, isOrganizer = false, onVoteSuccess, onStatusChange }) => {
  const { toastSuccess, toastError } = useNotification();
  const [selectedOption, setSelectedOption] = useState(poll.user_voted_option_id || null);
  const [submitting, setSubmitting] = useState(false);

  const hasVoted = !!poll.user_voted_option_id;
  const isClosed = poll.status === 'CLOSED';

  const handleVote = async () => {
    if (!selectedOption) return;
    setSubmitting(true);
    try {
      await pollsApi.vote(poll.id, selectedOption);
      toastSuccess('Your vote has been cast!');
      if (onVoteSuccess) onVoteSuccess();
    } catch (err) {
      toastError(err.friendlyMessage || 'Vote could not be recorded');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = isClosed ? 'ACTIVE' : 'CLOSED';
    try {
      await pollsApi.updateStatus(poll.id, newStatus);
      toastSuccess(`Poll is now ${newStatus}`);
      if (onStatusChange) onStatusChange();
    } catch (err) {
      toastError(err.friendlyMessage || 'Status update failed');
    }
  };

  return (
    <div className="rounded-2xl glass-card border border-slate-800 p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <StatusBadge status={poll.status} size="sm" />
          <span className="text-[11px] font-mono text-slate-400">
            {poll.total_votes} {poll.total_votes === 1 ? 'vote' : 'votes'}
          </span>
        </div>

        <h4 className="text-base font-bold text-slate-100 mb-4">{poll.question}</h4>

        {/* Options List */}
        <div className="space-y-2.5 mb-5">
          {poll.options.map((opt) => {
            const isUserChoice = poll.user_voted_option_id === opt.id;
            const isCurrentSelect = selectedOption === opt.id;
            const showPercentages = hasVoted || isOrganizer || isClosed;

            return (
              <div
                key={opt.id}
                onClick={() => {
                  if (!hasVoted && !isClosed) setSelectedOption(opt.id);
                }}
                className={`relative p-3 rounded-xl border transition-all overflow-hidden ${
                  hasVoted || isClosed
                    ? isUserChoice
                      ? 'border-indigo-500/60 bg-indigo-950/20'
                      : 'border-slate-800 bg-slate-900/40'
                    : isCurrentSelect
                    ? 'border-indigo-500 bg-indigo-950/30 cursor-pointer'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 cursor-pointer'
                }`}
              >
                {/* Background Fill Percentage Bar */}
                {showPercentages && (
                  <div
                    className={`absolute inset-0 transition-all duration-700 pointer-events-none opacity-20 ${
                      isUserChoice ? 'bg-indigo-500' : 'bg-slate-600'
                    }`}
                    style={{ width: `${opt.vote_percentage}%` }}
                  />
                )}

                <div className="relative flex items-center justify-between gap-2 z-10">
                  <div className="flex items-center gap-2.5">
                    {!hasVoted && !isClosed && (
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isCurrentSelect
                            ? 'border-indigo-500 bg-indigo-500'
                            : 'border-slate-600'
                        }`}
                      >
                        {isCurrentSelect && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    )}
                    {isUserChoice && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
                    <span className="text-xs font-medium text-slate-200">{opt.option_text}</span>
                  </div>

                  {showPercentages && (
                    <div className="flex items-center gap-2 text-xs font-mono font-semibold shrink-0">
                      <span className="text-slate-400">{opt.vote_count}</span>
                      <span className="text-indigo-300 min-w-[36px] text-right">
                        {opt.vote_percentage}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action footer */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
        {!hasVoted && !isClosed ? (
          <button
            onClick={handleVote}
            disabled={!selectedOption || submitting}
            className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5"
          >
            <Vote className="w-3.5 h-3.5" />
            {submitting ? 'Submitting...' : 'Submit Vote'}
          </button>
        ) : (
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            {hasVoted ? '✓ You voted on this poll' : 'Poll has ended'}
          </span>
        )}

        {isOrganizer && (
          <button
            onClick={handleToggleStatus}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              isClosed
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
            }`}
          >
            {isClosed ? 'Reactivate' : 'Close Poll'}
          </button>
        )}
      </div>
    </div>
  );
};
