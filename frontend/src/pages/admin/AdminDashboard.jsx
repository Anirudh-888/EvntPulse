import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi, usersApi, clubsApi, eventsApi } from '../../services/api';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useNotification } from '../../context/NotificationContext';
import {
  Shield,
  Users,
  Flag,
  Calendar,
  UserCheck,
  Star,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

export const AdminDashboard = () => {
  const { toastSuccess, toastError } = useNotification();
  const [stats, setStats] = useState(null);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, eventsRes] = await Promise.all([
        analyticsApi.getPlatformStats(),
        eventsApi.list({ all_statuses: true }),
      ]);
      setStats(statsRes.data);
      const pending = eventsRes.data.filter((e) => e.status === 'PENDING_APPROVAL');
      setPendingEvents(pending);
    } catch (err) {
      console.error('Failed to load platform data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (eventId, eventTitle) => {
    setActionLoading(eventId);
    try {
      await eventsApi.approve(eventId);
      toastSuccess(`Approved "${eventTitle}"! Now live for students.`);
      setPendingEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err) {
      toastError(err.friendlyMessage || 'Failed to approve event');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (eventId, eventTitle) => {
    setActionLoading(eventId);
    try {
      await eventsApi.reject(eventId);
      toastSuccess(`Returned "${eventTitle}" to Draft status.`);
      setPendingEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err) {
      toastError(err.friendlyMessage || 'Failed to reject event');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <LoadingSpinner size="lg" message="Loading platform overview..." />;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Shield className="w-4 h-4" /> Platform Administration
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Campus Platform Overview</h1>
        <p className="text-xs text-slate-400">
          Global metrics across all MVJCE clubs, event approvals, registrations, and venue check-ins.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Campus Clubs"
          value={stats?.total_clubs || 9}
          subtitle="MVJCE Student Chapters"
          icon={Flag}
          color="amber"
        />
        <KpiCard
          title="Total Events"
          value={stats?.total_events || 0}
          subtitle={`${stats?.published_events || 0} published on campus`}
          icon={Calendar}
          color="indigo"
        />
        <KpiCard
          title="Pending Approval"
          value={pendingEvents.length}
          subtitle={pendingEvents.length > 0 ? "Requires Admin Action" : "All events reviewed"}
          icon={AlertCircle}
          color={pendingEvents.length > 0 ? "rose" : "emerald"}
        />
        <KpiCard
          title="Campus Turnout"
          value={`${stats?.overall_attendance_rate || 0}%`}
          subtitle={`${stats?.total_attendance || 0} checked in`}
          icon={UserCheck}
          color="cyan"
        />
      </div>

      {/* Pending Events Approval Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              Event Moderation & Approvals
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {pendingEvents.length} Pending
            </span>
          </div>
          <Link
            to="/admin/events"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
            Manage All Events &rarr;
          </Link>
        </div>

        {pendingEvents.length === 0 ? (
          <div className="p-6 rounded-2xl glass-card border border-slate-800 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            No events currently pending review. All club events are processed!
          </div>
        ) : (
          <div className="rounded-2xl glass-card border border-amber-500/30 overflow-hidden divide-y divide-slate-800">
            {pendingEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-amber-500/5 hover:bg-amber-500/10 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{ev.title}</h4>
                    <StatusBadge status={ev.status} size="sm" />
                    <span className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {ev.club?.name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1 max-w-2xl">{ev.description}</p>
                  <div className="flex items-center gap-4 text-[11px] text-slate-500">
                    <span>Date: {new Date(ev.start_time).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Venue: {ev.venue}</span>
                    <span>•</span>
                    <span>Cap: {ev.capacity} seats</span>
                    {ev.rsvp_email_1 && (
                      <>
                        <span>•</span>
                        <span className="text-indigo-300 font-mono">RSVP 1: {ev.rsvp_email_1}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                  <button
                    disabled={actionLoading === ev.id}
                    onClick={() => handleApprove(ev.id, ev.title)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Approve Event
                  </button>
                  <button
                    disabled={actionLoading === ev.id}
                    onClick={() => handleReject(ev.id, ev.title)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    Return to Draft
                  </button>
                  <Link
                    to={`/events/${ev.id}`}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/admin/users"
          className="p-5 rounded-2xl glass-card border border-slate-800 hover:border-indigo-500/40 transition-all flex items-center justify-between group"
        >
          <div>
            <h4 className="text-sm font-bold text-white group-hover:text-indigo-300">Manage Users</h4>
            <p className="text-xs text-slate-400 mt-1">Review student & organizer accounts</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          to="/admin/clubs"
          className="p-5 rounded-2xl glass-card border border-slate-800 hover:border-amber-500/40 transition-all flex items-center justify-between group"
        >
          <div>
            <h4 className="text-sm font-bold text-white group-hover:text-amber-300">MVJCE Clubs & Societies</h4>
            <p className="text-xs text-slate-400 mt-1">Full control, add clubs & assign leads</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          to="/admin/events"
          className="p-5 rounded-2xl glass-card border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center justify-between group"
        >
          <div>
            <h4 className="text-sm font-bold text-white group-hover:text-cyan-300">All Campus Events</h4>
            <p className="text-xs text-slate-400 mt-1">Approve, moderate, or cancel events</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
