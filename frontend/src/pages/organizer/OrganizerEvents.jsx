import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsApi } from '../../services/api';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { SearchBar } from '../../components/events/SearchBar';
import {
  Calendar,
  Plus,
  ArrowRight,
  QrCode,
  BarChart3,
  Users
} from 'lucide-react';

export const OrganizerEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await eventsApi.list({ all_statuses: true });
      setEvents(res.data);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((e) => {
    const matchSearch =
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.venue.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Manage Events</h1>
          <p className="text-xs text-slate-400">
            Publish drafts, configure capacity, scan attendee QR passes, and run live polls.
          </p>
        </div>

        <Link
          to="/organizer/events/create"
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Event
        </Link>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:max-w-md">
          <SearchBar value={search} onChange={setSearch} placeholder="Filter by title, venue..." />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'PUBLISHED', 'PENDING_APPROVAL', 'DRAFT', 'COMPLETED', 'CANCELLED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === s
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s === 'PENDING_APPROVAL' ? 'Pending Approval' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner message="Loading events..." />
      ) : filteredEvents.length === 0 ? (
        <div className="p-12 text-center rounded-2xl glass-card border border-slate-800 text-slate-400 text-sm">
          No events found matching your filter criteria.
        </div>
      ) : (
        <div className="rounded-2xl glass-card border border-slate-800 overflow-hidden divide-y divide-slate-800">
          {filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-bold text-white">{ev.title}</h3>
                  <StatusBadge status={ev.status} size="sm" />
                  <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 uppercase">
                    {ev.category}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                  <span>{new Date(ev.start_time).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{ev.venue}</span>
                  <span>•</span>
                  <span className="font-mono text-slate-300">
                    {ev.registered_count || 0} / {ev.capacity} RSVPs
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto">
                <Link
                  to={`/organizer/events/${ev.id}?tab=attendance`}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  Scanner
                </Link>
                <Link
                  to={`/organizer/events/${ev.id}?tab=analytics`}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                  Analytics
                </Link>
                <Link
                  to={`/organizer/events/${ev.id}`}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <span>Manage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
