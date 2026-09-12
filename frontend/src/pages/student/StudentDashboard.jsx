import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { registrationsApi, eventsApi } from '../../services/api';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { StatusBadge } from '../../components/ui/StatusBadge';
import {
  Calendar,
  Ticket,
  Clock,
  MapPin,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const res = await registrationsApi.getMyRegistrations();
        setRegistrations(res.data);
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, []);

  if (loading) return <LoadingSpinner size="lg" message="Loading your student dashboard..." />;

  const now = new Date();
  const upcomingRegs = registrations.filter(
    (r) => r.status === 'REGISTERED' && new Date(r.event_start_time) >= now
  );
  const nextEvent = upcomingRegs[0];
  const attendedRegs = registrations.filter((r) => r.status === 'ATTENDED');

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl glass-card border border-indigo-500/20 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user?.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/50 shadow-xl"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                Hi, {user?.name}
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-wider border border-indigo-500/20">
                {user?.year || 'Student'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {user?.department || 'Engineering'} • {user?.college || 'State Tech University'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/student/tickets"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
          >
            <Ticket className="w-4 h-4" />
            My Tickets ({upcomingRegs.length})
          </Link>
          <Link
            to="/events"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition-colors"
          >
            Browse More Events
          </Link>
        </div>
      </div>

      {/* Next Up Highlight Card */}
      {nextEvent ? (
        <div className="rounded-3xl glass-card border border-indigo-500/40 p-6 sm:p-8 bg-gradient-to-r from-indigo-950/40 to-slate-900/40 relative overflow-hidden">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            Your Next Campus Event
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                {nextEvent.event_title}
              </h3>
              <div className="flex flex-wrap gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  {new Date(nextEvent.event_start_time).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  {new Date(nextEvent.event_start_time).toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                  {nextEvent.event_venue}
                </span>
              </div>
            </div>

            <Link
              to="/student/tickets"
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-indigo-600/30 flex items-center gap-2 shrink-0 self-start md:self-auto"
            >
              <Ticket className="w-4 h-4" />
              Open Digital QR Pass
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl glass-card border border-slate-800 text-center">
          <p className="text-sm font-semibold text-slate-200">No upcoming registered events</p>
          <p className="text-xs text-slate-400 mt-1">Explore campus events and register to receive instant QR tickets.</p>
          <Link
            to="/events"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
          >
            Explore Events <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Active RSVPs and Tickets Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Ticket className="w-4 h-4 text-indigo-400" />
            Registered Events & Passcards
          </h3>
          <Link
            to="/student/tickets"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
            View All Tickets
          </Link>
        </div>

        <div className="rounded-2xl glass-card border border-slate-800 overflow-hidden divide-y divide-slate-800">
          {registrations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              You have not registered for any events yet.
            </div>
          ) : (
            registrations.slice(0, 5).map((reg) => (
              <div
                key={reg.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{reg.event_title}</h4>
                    <StatusBadge status={reg.status} size="sm" />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>{reg.club_name}</span>
                    <span>•</span>
                    <span>{new Date(reg.event_start_time).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="font-mono text-indigo-300">
                      Code: {reg.ticket?.ticket_code || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to={`/events/${reg.event_id}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300"
                  >
                    Event Page
                  </Link>
                  {reg.ticket && (
                    <Link
                      to="/student/tickets"
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      View QR
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
