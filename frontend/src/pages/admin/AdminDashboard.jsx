import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi, usersApi, clubsApi, eventsApi } from '../../services/api';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import {
  Shield,
  Users,
  Flag,
  Calendar,
  UserCheck,
  Star,
  ArrowRight
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await analyticsApi.getPlatformStats();
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load platform stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner size="lg" message="Loading platform overview..." />;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Shield className="w-4 h-4" /> Platform Administration
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Campus Platform Overview</h1>
        <p className="text-xs text-slate-400">
          Global metrics across all student clubs, event registrations, and venue check-ins.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Users"
          value={stats?.total_users || 0}
          subtitle={`${stats?.total_students || 0} students, ${stats?.total_organizers || 0} orgs`}
          icon={Users}
          color="indigo"
        />
        <KpiCard
          title="Campus Clubs"
          value={stats?.total_clubs || 0}
          subtitle="Registered student chapters"
          icon={Flag}
          color="amber"
        />
        <KpiCard
          title="Total Events"
          value={stats?.total_events || 0}
          subtitle={`${stats?.published_events || 0} published`}
          icon={Calendar}
          color="cyan"
        />
        <KpiCard
          title="Campus Turnout Rate"
          value={`${stats?.overall_attendance_rate || 0}%`}
          subtitle={`${stats?.total_attendance || 0} of ${stats?.total_registrations || 0} checked in`}
          icon={UserCheck}
          color="emerald"
        />
      </div>

      {/* Admin Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/admin/users"
          className="p-5 rounded-2xl glass-card border border-slate-800 hover:border-indigo-500/40 transition-all flex items-center justify-between group"
        >
          <div>
            <h4 className="text-sm font-bold text-white group-hover:text-indigo-300">Manage Users</h4>
            <p className="text-xs text-slate-400 mt-1">Review student and organizer accounts</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          to="/admin/clubs"
          className="p-5 rounded-2xl glass-card border border-slate-800 hover:border-amber-500/40 transition-all flex items-center justify-between group"
        >
          <div>
            <h4 className="text-sm font-bold text-white group-hover:text-amber-300">Campus Clubs</h4>
            <p className="text-xs text-slate-400 mt-1">Oversight of registered societies</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          to="/admin/events"
          className="p-5 rounded-2xl glass-card border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center justify-between group"
        >
          <div>
            <h4 className="text-sm font-bold text-white group-hover:text-cyan-300">All Campus Events</h4>
            <p className="text-xs text-slate-400 mt-1">Moderate drafts, published, and fests</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
