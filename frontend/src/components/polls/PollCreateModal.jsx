import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Plus, Trash2, HelpCircle } from 'lucide-react';
import { pollsApi } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

export const PollCreateModal = ({ isOpen, onClose, eventId, onPollCreated }) => {
  const { toastSuccess, toastError } = useNotification();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [submitting, setSubmitting] = useState(false);

  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (text, index) => {
    const updated = [...options];
    updated[index] = text;
    setOptions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanQuestion = question.trim();
    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);

    if (!cleanQuestion) {
      toastError('Please enter a poll question');
      return;
    }
    if (cleanOptions.length < 2) {
      toastError('Please provide at least 2 valid options');
      return;
    }

    setSubmitting(true);
    try {
      await pollsApi.create(eventId, {
        question: cleanQuestion,
        options: cleanOptions,
      });
      toastSuccess('Live poll launched successfully!');
      setQuestion('');
      setOptions(['', '']);
      if (onPollCreated) onPollCreated();
      onClose();
    } catch (err) {
      toastError(err.friendlyMessage || 'Failed to create poll');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Launch Live Audience Poll">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Poll Question
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. Which project architecture do you prefer?"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Poll Options (2 to 5)
          </label>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => handleOptionChange(e.target.value, i)}
                  placeholder={`Option ${i + 1}`}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(i)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {options.length < 5 && (
            <button
              type="button"
              onClick={handleAddOption}
              className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              Add another option
            </button>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
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
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-all shadow-md shadow-indigo-600/30"
          >
            {submitting ? 'Launching...' : 'Launch Poll Now'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
