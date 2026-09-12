import React, { useState, useEffect } from 'react';
import { eventsApi } from '../../services/api';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SearchBar } from '../../components/events/SearchBar';
import { Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await eventsApi.list({ all_statuses: true });
      setEvents(res.data);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" message="Loading all campus events..." />;

  const filtered = events.filter(
    (e) =>
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.venue.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">All Platform Events</h1>
          <p className="text-xs text-slate-400">Moderation and health tracking across all clubs.</p>
        </div>
        <span className="text-xs text-slate-400 font-mono">Total: {events.length}</span>
      </div>

      <div className="max-w-md">
        <SearchBar value={search} onChange={setSearch} placeholder="Search title or venue..." />
      </div>

      <div className="rounded-2xl glass-card border border-slate-800 overflow-hidden divide-y divide-slate-800">
        {filtered.map((ev) => (
          <div key={ev.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-bold text-white">{ev.title}</h4>
                <StatusBadge status={ev.status} size="sm" />
              </div>
              <p className="text-xs text-slate-400">
                {ev.club?.name} • {new Date(ev.start_time).toLocaleDateString()} • {ev.venue} •{' '}
                <span className="text-slate-300 font-mono">
                  {ev.registered_count || 0} / {ev.capacity} RSVPs
                </span>
              </p>
            </div>

            <Link
              to={`/events/${ev.id}`}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5"
            >
              <span>Inspect</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
