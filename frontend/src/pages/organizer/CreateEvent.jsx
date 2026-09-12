import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsApi, clubsApi } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Calendar, Clock, MapPin, Users, Image, Building, Plus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  'TECHNOLOGY',
  'WORKSHOP',
  'HACKATHON',
  'CULTURAL',
  'SPORTS',
  'SEMINAR',
  'COMPETITION',
  'SOCIAL',
  'OTHER',
];

export const CreateEvent = () => {
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useNotification();

  const [clubs, setClubs] = useState([]);
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('TECHNOLOGY');
  const [clubId, setClubId] = useState('');
  const [venue, setVenue] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [capacity, setCapacity] = useState(100);
  const [posterUrl, setPosterUrl] = useState('');

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await clubsApi.list();
        setClubs(res.data);
        if (res.data.length > 0) {
          setClubId(res.data[0].id);
        }
      } catch (err) {
        console.error('Failed to load clubs:', err);
      } finally {
        setLoadingClubs(false);
      }
    };
    fetchClubs();

    // Default dates to next week
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    nextWeek.setMinutes(0);
    const startIso = nextWeek.toISOString().slice(0, 16);
    const endIso = new Date(nextWeek.getTime() + 4 * 60 * 60 * 1000).toISOString().slice(0, 16);
    const deadlineIso = new Date(nextWeek.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

    setStartTime(startIso);
    setEndTime(endIso);
    setRegistrationDeadline(deadlineIso);
  }, []);

  const handleCreate = async (statusToSet = 'DRAFT') => {
    if (!title.trim()) return toastError('Event title is required');
    if (!description.trim()) return toastError('Event description is required');
    if (!venue.trim()) return toastError('Venue is required');
    if (!clubId) return toastError('Please select a host club');

    const start = new Date(startTime);
    const end = new Date(endTime);
    const deadline = new Date(registrationDeadline);

    if (end <= start) {
      return toastError('End time must be after start time');
    }
    if (deadline > start) {
      return toastError('Registration deadline must be before or equal to event start');
    }
    if (Number(capacity) <= 0) {
      return toastError('Capacity must be a positive integer');
    }

    setSubmitting(true);
    try {
      const payload = {
        club_id: Number(clubId),
        title: title.trim(),
        description: description.trim(),
        category,
        venue: venue.trim(),
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        registration_deadline: deadline.toISOString(),
        capacity: Number(capacity),
        poster_url:
          posterUrl.trim() ||
          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000',
        status: statusToSet,
      };

      const res = await eventsApi.create(payload);
      toastSuccess(`Event created as ${statusToSet}!`);
      navigate(`/organizer/events/${res.data.id}`);
    } catch (err) {
      toastError(err.friendlyMessage || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/organizer/events"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Events
      </Link>

      <div>
        <h1 className="text-2xl font-extrabold text-white">Create New Event</h1>
        <p className="text-xs text-slate-400">
          Set up schedule, venue capacity, and ticketing for your campus club.
        </p>
      </div>

      <div className="rounded-3xl glass-card border border-slate-800 p-6 sm:p-8">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
          {/* Host Club & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Host Club
              </label>
              <select
                value={clubId}
                onChange={(e) => setClubId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                disabled={loadingClubs}
              >
                {clubs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Event Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AI Innovation Summit 2026"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description & Highlights
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe agenda, keynote speakers, prerequisites, and refreshments provided..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
              required
            />
          </div>

          {/* Venue and Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Venue Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Turing Auditorium, Science Block"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Total Capacity (Seats)
              </label>
              <div className="relative">
                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* Start and End Times */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Start Time
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                End Time
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {/* Registration Deadline */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Registration Deadline (RSVP cutoff)
            </label>
            <input
              type="datetime-local"
              value={registrationDeadline}
              onChange={(e) => setRegistrationDeadline(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Poster Image URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Poster Image URL (Optional)
            </label>
            <div className="relative">
              <Image className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="url"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleCreate('DRAFT')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Save as Draft
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleCreate('PUBLISHED')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
            >
              {submitting ? 'Publishing...' : 'Publish Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
