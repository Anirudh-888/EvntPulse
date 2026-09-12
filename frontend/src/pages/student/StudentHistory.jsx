import React, { useState, useEffect } from 'react';
import { registrationsApi } from '../../services/api';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { History, Calendar, CheckCircle2, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentHistory = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await registrationsApi.getMyRegistrations();
        setRegistrations(res.data);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <LoadingSpinner size="lg" message="Loading attendance history..." />;

  const attendedEvents = registrations.filter((r) => r.status === 'ATTENDED');
  const pastRegistrations = registrations.filter((r) => new Date(r.event_start_time) < new Date());

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
          <History className="w-4 h-4" />
          Campus Participation Log
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Attendance History</h1>
        <p className="text-xs text-slate-400">
          Track verified workshop participations, hackathons attended, and feedback ratings.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl glass-card border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Total Registered</span>
          <p className="text-2xl font-extrabold text-white font-mono mt-1">{registrations.length}</p>
        </div>
        <div className="p-4 rounded-2xl glass-card border border-slate-800">
          <span className="text-xs text-emerald-400 font-medium">Verified Attended</span>
          <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">{attendedEvents.length}</p>
        </div>
        <div className="p-4 rounded-2xl glass-card border border-slate-800">
          <span className="text-xs text-cyan-400 font-medium">Turnout Reliability</span>
          <p className="text-2xl font-extrabold text-cyan-400 font-mono mt-1">
            {registrations.length > 0
              ? Math.round((attendedEvents.length / registrations.length) * 100)
              : 0}
            %
          </p>
        </div>
      </div>

      {/* History Table */}
      <div className="rounded-2xl glass-card border border-slate-800 overflow-hidden divide-y divide-slate-800">
        {pastRegistrations.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No completed events in your history yet.
          </div>
        ) : (
          pastRegistrations.map((reg) => (
            <div
              key={reg.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-bold text-white">{reg.event_title}</h4>
                  <StatusBadge status={reg.status} size="sm" />
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>{reg.club_name}</span>
                  <span>•</span>
                  <span>{new Date(reg.event_start_time).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{reg.event_venue}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to={`/events/${reg.event_id}`}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                >
                  View Details & Reviews
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
