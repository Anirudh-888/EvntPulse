import React, { useState, useEffect } from 'react';
import { eventsApi } from '../../services/api';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SearchBar } from '../../components/events/SearchBar';
import { useNotification } from '../../context/NotificationContext';
import { Calendar, ArrowRight, CheckCircle, XCircle, Trash2, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminEvents = () => {
  const { toastSuccess, toastError } = useNotification();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionLoading, setActionLoading] = useState(null);

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

  const handleApprove = async (eventId, title) => {
    setActionLoading(eventId);
    try {
      await eventsApi.approve(eventId);
      toastSuccess(`Approved event "${title}"!`);
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, status: 'PUBLISHED' } : e))
      );
    } catch (err) {
      toastError(err.friendlyMessage || 'Failed to approve event');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (eventId, title) => {
    setActionLoading(eventId);
    try {
      await eventsApi.reject(eventId);
      toastSuccess(`Event "${title}" moved back to Draft.`);
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, status: 'DRAFT' } : e))
      );
    } catch (err) {
      toastError(err.friendlyMessage || 'Failed to reject event');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (eventId, title) => {
    if (!window.confirm(`Are you sure you want to delete event "${title}"?`)) return;
    setActionLoading(eventId);
    try {
      await eventsApi.delete(eventId);
      toastSuccess(`Deleted event "${title}"`);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err) {
      toastError(err.friendlyMessage || 'Failed to delete event');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <LoadingSpinner size="lg" message="Loading all campus events..." />;

  const filtered = events.filter((e) => {
    const matchSearch =
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.venue.toLowerCase().includes(search.toLowerCase()) ||
      e.club?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Campus Events Oversight</h1>
          <p className="text-xs text-slate-400">
            Ultimate platform control: approve submissions, inspect RSVPs, and moderate all 9 MVJCE clubs.
          </p>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Total: {events.length} ({events.filter((e) => e.status === 'PENDING_APPROVAL').length} Pending)
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:max-w-md">
          <SearchBar value={search} onChange={setSearch} placeholder="Search title, venue, or club..." />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'PENDING_APPROVAL', 'PUBLISHED', 'DRAFT', 'COMPLETED', 'CANCELLED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === s
                  ? s === 'PENDING_APPROVAL'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s === 'PENDING_APPROVAL' ? 'Pending Approval' : s}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl glass-card border border-slate-800 overflow-hidden divide-y divide-slate-800">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No events found matching your criteria.
          </div>
        ) : (
          filtered.map((ev) => (
            <div key={ev.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-900/30 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-bold text-white">{ev.title}</h4>
                  <StatusBadge status={ev.status} size="sm" />
                  <span className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    {ev.club?.name}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {new Date(ev.start_time).toLocaleDateString()} • {ev.venue} •{' '}
                  <span className="text-slate-300 font-mono">
                    {ev.registered_count || 0} / {ev.capacity} RSVPs
                  </span>
                </p>
                {(ev.rsvp_email_1 || ev.rsvp_email_2) && (
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-1">
                    <Mail className="w-3 h-3 text-indigo-400" />
                    <span>RSVP Handlers:</span>
                    {ev.rsvp_email_1 && <span className="text-indigo-300">{ev.rsvp_email_1}</span>}
                    {ev.rsvp_email_2 && <span>• <span className="text-indigo-300">{ev.rsvp_email_2}</span></span>}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                {ev.status === 'PENDING_APPROVAL' && (
                  <>
                    <button
                      disabled={actionLoading === ev.id}
                      onClick={() => handleApprove(ev.id, ev.title)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      disabled={actionLoading === ev.id}
                      onClick={() => handleReject(ev.id, ev.title)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      Reject
                    </button>
                  </>
                )}

                <Link
                  to={`/events/${ev.id}`}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5"
                >
                  <span>Inspect</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  disabled={actionLoading === ev.id}
                  onClick={() => handleDelete(ev.id, ev.title)}
                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 transition-colors"
                  title="Delete event"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
