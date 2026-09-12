import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  eventsApi,
  registrationsApi,
  attendanceApi,
  pollsApi,
  feedbackApi,
  analyticsApi,
  clubsApi,
} from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { QRScanner } from '../../components/attendance/QRScanner';
import { AttendanceStats } from '../../components/attendance/AttendanceStats';
import { PollCard } from '../../components/polls/PollCard';
import { PollCreateModal } from '../../components/polls/PollCreateModal';
import { FeedbackCard } from '../../components/feedback/FeedbackCard';
import { RatingDistribution } from '../../components/feedback/RatingDistribution';
import { HealthScoreCard } from '../../components/dashboard/HealthScoreCard';
import { ChartCard } from '../../components/dashboard/ChartCard';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  QrCode,
  BarChart3,
  MessageSquare,
  Star,
  CheckCircle,
  XCircle,
  Activity,
  Plus,
  ArrowLeft,
  RefreshCw,
  Search,
  ShieldCheck,
  UserPlus,
  Trash2,
  Mail,
} from 'lucide-react';

export const OrganizerEventManage = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const { toastSuccess, toastError } = useNotification();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tab Data States
  const [registrations, setRegistrations] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [polls, setPolls] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  // Team & Club Organizers State
  const [organizers, setOrganizers] = useState([]);
  const [assignEmail, setAssignEmail] = useState('');
  const [assignRole, setAssignRole] = useState('Event Co-Organizer');
  const [assigning, setAssigning] = useState(false);
  const [loadingOrganizers, setLoadingOrganizers] = useState(false);

  // UI Modals
  const [pollModalOpen, setPollModalOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false);
  const [regSearch, setRegSearch] = useState('');

  const filteredRegistrations = registrations.filter((r) => {
    if (!regSearch) return true;
    const q = regSearch.toLowerCase();
    return (
      (r.user?.full_name && r.user.full_name.toLowerCase().includes(q)) ||
      (r.user?.email && r.user.email.toLowerCase().includes(q)) ||
      (r.ticket?.ticket_code && r.ticket.ticket_code.toLowerCase().includes(q))
    );
  });

  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  useEffect(() => {
    loadAllEventData();
  }, [id]);

  const loadClubOrganizers = async (clubId) => {
    setLoadingOrganizers(true);
    try {
      const res = await clubsApi.getOrganizers(clubId);
      setOrganizers(res.data);
    } catch (err) {
      console.error('Failed to load club organizers:', err);
    } finally {
      setLoadingOrganizers(false);
    }
  };

  const loadAllEventData = async () => {
    setLoading(true);
    try {
      const [evRes, regRes, attStatsRes, attListRes, pollsRes, fbRes, anaRes] =
        await Promise.all([
          eventsApi.getById(id),
          registrationsApi.getEventRegistrations(id),
          attendanceApi.getStats(id),
          attendanceApi.getList(id),
          pollsApi.getEventPolls(id),
          feedbackApi.getStats(id),
          analyticsApi.getEventAnalytics(id),
        ]);

      setEvent(evRes.data);
      setRegistrations(regRes.data);
      setAttendanceStats(attStatsRes.data);
      setAttendees(attListRes.data);
      setPolls(pollsRes.data);
      setFeedbackStats(fbRes.data);
      setAnalytics(anaRes.data);

      if (evRes.data?.club_id) {
        loadClubOrganizers(evRes.data.club_id);
      }
    } catch (err) {
      console.error('Failed to load event data:', err);
      toastError('Could not load complete event management hub');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignOrganizer = async (e) => {
    e.preventDefault();
    if (!assignEmail.trim()) return toastError('Please enter a valid user email');
    setAssigning(true);
    try {
      await clubsApi.assignOrganizer(event.club_id, {
        email: assignEmail.trim(),
        role_title: assignRole.trim() || 'Event Co-Organizer',
      });
      toastSuccess(`Assigned ${assignEmail} as ${assignRole}!`);
      setAssignEmail('');
      loadClubOrganizers(event.club_id);
    } catch (err) {
      toastError(err.friendlyMessage || 'Failed to assign organizer');
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveOrganizer = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to remove ${userName || 'this user'} from organizers?`)) return;
    try {
      await clubsApi.removeOrganizer(event.club_id, userId);
      toastSuccess('Organizer removed successfully');
      loadClubOrganizers(event.club_id);
    } catch (err) {
      toastError(err.friendlyMessage || 'Failed to remove organizer');
    }
  };

  const handlePublish = async () => {
    try {
      const res = await eventsApi.publish(id);
      setEvent(res.data);
      toastSuccess('Event published to student directory!');
    } catch (err) {
      toastError(err.friendlyMessage || 'Failed to publish');
    }
  };

  const handleCancel = async () => {
    try {
      const res = await eventsApi.cancel(id);
      setEvent(res.data);
      toastSuccess('Event status updated to Cancelled');
      setConfirmCancelOpen(false);
    } catch (err) {
      toastError(err.friendlyMessage || 'Failed to cancel event');
    }
  };

  const handleComplete = async () => {
    try {
      const res = await eventsApi.complete(id);
      setEvent(res.data);
      toastSuccess('Event marked as Completed! Post-event feedback is now active.');
      setConfirmCompleteOpen(false);
    } catch (err) {
      toastError(err.friendlyMessage || 'Failed to complete event');
    }
  };

  const handleCheckInRefresh = async () => {
    try {
      const [statsRes, listRes, anaRes] = await Promise.all([
        attendanceApi.getStats(id),
        attendanceApi.getList(id),
        analyticsApi.getEventAnalytics(id),
      ]);
      setAttendanceStats(statsRes.data);
      setAttendees(listRes.data);
      setAnalytics(anaRes.data);
    } catch (e) {}
  };

  if (loading) return <LoadingSpinner size="lg" message="Loading management hub..." />;
  if (!event) return <div className="text-center py-12">Event not found</div>;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Calendar },
    { id: 'registrations', label: `Registrations (${registrations.length})`, icon: Users },
    { id: 'attendance', label: 'Check-In & Scanner', icon: QrCode },
    { id: 'polls', label: `Live Polls (${polls.length})`, icon: MessageSquare },
    { id: 'feedback', label: 'Feedback & Reviews', icon: Star },
    { id: 'analytics', label: 'Intelligence & Health', icon: BarChart3 },
    { id: 'team', label: `Team & Organizers (${organizers.length})`, icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Breadcrumb & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/organizer/events"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Events
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-white">{event.title}</h1>
            <StatusBadge status={event.status} size="sm" />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {event.club?.name} • {new Date(event.start_time).toLocaleDateString()} • {event.venue}
          </p>
        </div>

        {/* Quick Lifecycle Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {event.status === 'DRAFT' && (
            <button
              onClick={handlePublish}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Publish Event
            </button>
          )}

          {event.status === 'PUBLISHED' && (
            <>
              <button
                onClick={() => setConfirmCompleteOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Mark Completed
              </button>
              <button
                onClick={() => setConfirmCancelOpen(true)}
                className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold text-xs transition-colors"
              >
                Cancel Event
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl glass-card border border-slate-800">
              <span className="text-xs text-slate-400">Total RSVPs</span>
              <p className="text-2xl font-extrabold text-white font-mono mt-1">
                {registrations.length}
              </p>
              <span className="text-[11px] text-slate-500">of {event.capacity} seats</span>
            </div>

            <div className="p-4 rounded-2xl glass-card border border-slate-800">
              <span className="text-xs text-emerald-400">Checked In</span>
              <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
                {attendanceStats?.checked_in_count || 0}
              </p>
              <span className="text-[11px] text-emerald-500/80">
                {attendanceStats?.attendance_rate || 0}% turnout
              </span>
            </div>

            <div className="p-4 rounded-2xl glass-card border border-slate-800">
              <span className="text-xs text-amber-400">Average Rating</span>
              <p className="text-2xl font-extrabold text-amber-400 font-mono mt-1">
                {feedbackStats?.average_rating ? feedbackStats.average_rating.toFixed(1) : 'N/A'}
              </p>
              <span className="text-[11px] text-amber-500/80">
                {feedbackStats?.total_feedback || 0} reviews
              </span>
            </div>

            <div className="p-4 rounded-2xl glass-card border border-slate-800">
              <span className="text-xs text-cyan-400">Event Health</span>
              <p className="text-2xl font-extrabold text-cyan-400 font-mono mt-1">
                {analytics?.event_health_score || 0} / 100
              </p>
              <span className="text-[11px] text-cyan-500/80">
                {analytics?.health_breakdown?.classification || 'Pending'}
              </span>
            </div>
          </div>

          <div className="rounded-2xl glass-card border border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Event Metadata</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
              <div>
                <span className="text-slate-500 block mb-0.5">Host Club</span>
                <strong className="text-white text-sm">{event.club?.name}</strong>
                {event.club?.email && (
                  <div className="flex items-center gap-1.5 text-indigo-400 font-mono text-[11px] mt-1">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{event.club.email}</span>
                  </div>
                )}
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Capacity & Limits</span>
                <strong className="text-white text-sm font-mono">{event.capacity} seats</strong>
                <span className="text-slate-400 block text-[11px] mt-0.5">
                  {Math.max(0, event.capacity - registrations.length)} seats remaining
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Category</span>
                <strong className="text-white">{event.category}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Date & Time</span>
                <strong className="text-white">
                  {new Date(event.start_time).toLocaleString()}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">Registration Cutoff</span>
                <strong className="text-white">
                  {new Date(event.registration_deadline).toLocaleString()}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">Active Team Members</span>
                <strong className="text-white">{organizers.length} authorized organizers</strong>
              </div>
              <div className="col-span-full">
                <span className="text-slate-500 block">Description</span>
                <p className="text-slate-300 mt-1 whitespace-pre-line leading-relaxed">
                  {event.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: REGISTRATIONS */}
      {activeTab === 'registrations' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:max-w-md relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={regSearch}
                onChange={(e) => setRegSearch(e.target.value)}
                placeholder="Search registered attendee name, email..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {filteredRegistrations.length} of {registrations.length} attendees
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl glass-card border border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-900/50">
                  <th className="p-3.5">Student</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Registered On</th>
                  <th className="p-3.5">Ticket Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500">
                      No registrations found matching search.
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-medium text-white">
                        {reg.user?.full_name || 'Anonymous'}
                      </td>
                      <td className="p-3.5 text-slate-400 font-mono">{reg.user?.email}</td>
                      <td className="p-3.5 text-slate-400">
                        {reg.user?.department || 'General'}
                      </td>
                      <td className="p-3.5 text-slate-400 font-mono">
                        {new Date(reg.registered_at).toLocaleDateString()}
                      </td>
                      <td className="p-3.5">
                        <StatusBadge status={reg.ticket?.status || reg.status} size="sm" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: ATTENDANCE & CHECK-IN */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <AttendanceStats stats={attendanceStats} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
              <QRScanner onCheckInSuccess={handleCheckInRefresh} />
            </div>

            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">
                  Live Checked-In Attendees ({attendees.length})
                </h3>
                <button
                  onClick={handleCheckInRefresh}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto rounded-2xl glass-card border border-slate-800 divide-y divide-slate-800">
                {attendees.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No attendees checked in yet. Use the scanner on the left to verify tickets.
                  </div>
                ) : (
                  attendees.map((att) => (
                    <div
                      key={att.id}
                      className="p-3.5 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
                    >
                      <div>
                        <p className="text-xs font-bold text-white">
                          {att.user?.full_name || 'Student'}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">{att.user?.email}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 block">
                          VERIFIED
                        </span>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">
                          {new Date(att.checked_in_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: LIVE POLLS */}
      {activeTab === 'polls' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Live Audience Polls</h3>
              <p className="text-xs text-slate-400">
                Engage attendees in real-time during your keynote or workshop.
              </p>
            </div>
            <button
              onClick={() => setPollModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30"
            >
              <Plus className="w-3.5 h-3.5" /> Create Poll
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {polls.length === 0 ? (
              <div className="col-span-2 p-8 text-center rounded-2xl glass-card border border-slate-800 text-slate-400 text-xs">
                No polls created yet. Click "Create Poll" to initiate a real-time question.
              </div>
            ) : (
              polls.map((poll) => (
                <PollCard
                  key={poll.id}
                  poll={poll}
                  isOrganizer={true}
                  onStatusToggle={async (pollId, newStatus) => {
                    try {
                      await pollsApi.updateStatus(pollId, newStatus);
                      toastSuccess(`Poll status changed to ${newStatus}`);
                      loadAllEventData();
                    } catch (e) {
                      toastError('Failed to change poll status');
                    }
                  }}
                />
              ))
            )}
          </div>

          <PollCreateModal
            isOpen={pollModalOpen}
            onClose={() => setPollModalOpen(false)}
            eventId={id}
            onCreated={() => {
              setPollModalOpen(false);
              loadAllEventData();
            }}
          />
        </div>
      )}

      {/* Tab 5: FEEDBACK & REVIEWS */}
      {activeTab === 'feedback' && (
        <div className="space-y-6">
          {feedbackStats && (
            <RatingDistribution
              averageRating={feedbackStats.average_rating}
              distribution={feedbackStats.rating_breakdown}
              totalFeedback={feedbackStats.total_feedback}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedbackStats?.recent_feedbacks?.length === 0 ? (
              <div className="col-span-2 p-8 text-center rounded-2xl glass-card border border-slate-800 text-slate-400 text-xs">
                No attendee reviews received yet. Reviews unlock after attendees check in.
              </div>
            ) : (
              feedbackStats?.recent_feedbacks?.map((fb) => (
                <FeedbackCard key={fb.id} feedback={fb} />
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 6: INTELLIGENCE & HEALTH */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          {/* Health Score Intelligence Card */}
          <HealthScoreCard analytics={analytics} />

          {/* Recharts Analytics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartCard
              title="Registration Velocity"
              subtitle="Daily RSVPs leading up to event start"
              data={analytics.registration_timeline}
              type="area"
              color="#6366f1"
              dataKey="count"
              xAxisKey="day"
            />
            <ChartCard
              title="Rating Distribution Breakdown"
              subtitle="Count of reviews per star level"
              data={[
                { star: '5 Stars', count: analytics.rating_distribution[5] || 0 },
                { star: '4 Stars', count: analytics.rating_distribution[4] || 0 },
                { star: '3 Stars', count: analytics.rating_distribution[3] || 0 },
                { star: '2 Stars', count: analytics.rating_distribution[2] || 0 },
                { star: '1 Star', count: analytics.rating_distribution[1] || 0 },
              ]}
              type="bar"
              color="#f59e0b"
              dataKey="count"
              xAxisKey="star"
            />
          </div>
        </div>
      )}

      {/* Tab 7: TEAM & ORGANIZERS */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          {/* Host Club Details Banner */}
          <div className="p-6 rounded-3xl glass-card border border-slate-800 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Host Club Authority
                </span>
                <h2 className="text-xl font-extrabold text-white">{event.club?.name}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                  {event.club?.email && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-indigo-300 font-mono">
                      <Mail className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{event.club.email}</span>
                    </div>
                  )}
                  <span>•</span>
                  <span>{organizers.length} Authorized Organizers</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-medium">Full Event Control Active</span>
                </div>
              </div>

              <div className="text-xs text-slate-400 max-w-sm bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                Authorized organizers can co-manage this event, scan attendee QR tickets, launch live audience polls, and view registration analytics.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Assign Co-Organizer Form */}
            <div className="lg:col-span-5">
              <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-indigo-400" />
                    Assign Co-Organizer
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Grant event management privileges to a student or team member using their email address.
                  </p>
                </div>

                <form onSubmit={handleAssignOrganizer} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      User Email Address
                    </label>
                    <input
                      type="email"
                      value={assignEmail}
                      onChange={(e) => setAssignEmail(e.target.value)}
                      placeholder="e.g. devon.lane@campus.edu or student@evntpulse.demo"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Role / Designation
                    </label>
                    <select
                      value={assignRole}
                      onChange={(e) => setAssignRole(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Event Co-Organizer">Event Co-Organizer</option>
                      <option value="Lead Coordinator">Lead Coordinator</option>
                      <option value="QR Ticket Scanner">QR Ticket Scanner</option>
                      <option value="Stage & Tech Lead">Stage & Tech Lead</option>
                      <option value="Volunteer Manager">Volunteer Manager</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={assigning}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    {assigning ? 'Assigning...' : 'Assign Organizer'}
                  </button>
                </form>

                <div className="text-[10px] text-slate-500 border-t border-slate-800/80 pt-3">
                  Note: If the user currently has a Student role, assigning them will automatically promote their account to Organizer status so they can access the management dashboard.
                </div>
              </div>
            </div>

            {/* Active Organizers List */}
            <div className="lg:col-span-7">
              <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    Authorized Team Members ({organizers.length})
                  </h3>
                  <button
                    onClick={() => event.club_id && loadClubOrganizers(event.club_id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    title="Refresh list"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {loadingOrganizers ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    Loading organizers...
                  </div>
                ) : organizers.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs rounded-xl border border-dashed border-slate-800 p-6">
                    No co-organizers assigned yet. Use the form to add team members who can scan tickets and manage this event.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {organizers.map((org) => (
                      <div
                        key={org.id}
                        className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs uppercase">
                            {org.user?.full_name ? org.user.full_name.slice(0, 2) : 'OR'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">
                                {org.user?.full_name || 'Organizer'}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-semibold">
                                {org.role_title}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                              {org.user?.email}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-slate-500 hidden sm:block">
                            Assigned {new Date(org.assigned_at).toLocaleDateString()}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveOrganizer(org.user_id, org.user?.full_name)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                            title="Revoke organizer permissions"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={confirmCancelOpen}
        onClose={() => setConfirmCancelOpen(false)}
        onConfirm={handleCancel}
        title="Cancel Event"
        message="Are you sure you want to cancel this event? Registered students will be notified."
        confirmText="Cancel Event"
        isDanger={true}
      />

      <ConfirmDialog
        isOpen={confirmCompleteOpen}
        onClose={() => setConfirmCompleteOpen(false)}
        onConfirm={handleComplete}
        title="Mark Event as Completed"
        message="This will conclude the event, finalize attendance, and unlock post-event feedback."
        confirmText="Complete Event"
      />
    </div>
  );
};
