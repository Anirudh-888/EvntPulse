import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { eventsApi, clubsApi, analyticsApi } from '../../services/api';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { ChartCard } from '../../components/dashboard/ChartCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import {
  Calendar,
  Users,
  UserCheck,
  Star,
  Plus,
  ArrowRight,
  Sparkles,
  BarChart2,
  QrCode
} from 'lucide-react';

export const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganizerData();
  }, []);

  const fetchOrganizerData = async () => {
    setLoading(true);
    try {
      const [eventsRes, clubsRes] = await Promise.all([
        eventsApi.list({ all_statuses: true }),
        clubsApi.list(),
      ]);
      setEvents(eventsRes.data);
      setClubs(clubsRes.data);
    } catch (err) {
      console.error('Failed to load organizer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" message="Loading organizer dashboard..." />;

  const now = new Date();
  const upcomingEvents = events.filter(
    (e) => e.status === 'PUBLISHED' && new Date(e.start_time) >= now
  );

  const totalRegistrations = events.reduce((acc, e) => acc + (e.registered_count || 0), 0);
  const totalCapacity = events.reduce((acc, e) => acc + (e.capacity || 0), 0);

  // Mock aggregated attendance & ratings from completed events
  const completedEvents = events.filter((e) => e.status === 'COMPLETED');

  return (
    <div className="space-y-8">
      {/* Header and Quick CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            Organizer Operations
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-xs text-slate-400">
            Monitor real-time RSVPs, live venue check-ins, and event health scores.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/organizer/events/create"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Event
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Events"
          value={events.length}
          subtitle={`${upcomingEvents.length} upcoming scheduled`}
          icon={Calendar}
          color="indigo"
        />
        <KpiCard
          title="Total Registrations"
          value={totalRegistrations}
          subtitle={`Across ${events.length} campus events`}
          icon={Users}
          color="cyan"
        />
        <KpiCard
          title="Active RSVPs"
          value={upcomingEvents.reduce((acc, e) => acc + (e.registered_count || 0), 0)}
          subtitle="Awaiting attendance check-in"
          icon={UserCheck}
          color="emerald"
        />
        <KpiCard
          title="Campus Clubs"
          value={clubs.length}
          subtitle="Managed societies"
          icon={BarChart2}
          color="amber"
        />
      </div>

      {/* Recent Events Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            Club Events Management
          </h3>
          <Link
            to="/organizer/events"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
            View All ({events.length})
          </Link>
        </div>

        <div className="rounded-2xl glass-card border border-slate-800 overflow-hidden divide-y divide-slate-800">
          {events.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No events found. Click "Create Event" above to publish your first campus event.
            </div>
          ) : (
            events.slice(0, 6).map((ev) => (
              <div
                key={ev.id}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h4 className="text-sm font-bold text-white">{ev.title}</h4>
                    <StatusBadge status={ev.status} size="sm" />
                    <span className="text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 uppercase">
                      {ev.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
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
                    Check In
                  </Link>
                  <Link
                    to={`/organizer/events/${ev.id}`}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
                  >
                    <span>Manage Hub</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
