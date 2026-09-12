import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  eventsApi,
  registrationsApi,
  attendanceApi,
  pollsApi,
  feedbackApi,
  analyticsApi,
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
  Search
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

  // UI Modals
  const [pollModalOpen, setPollModalOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false);
  const [regSearch, setRegSearch] = useState('');

  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  useEffect(() => {
    loadAllEventData();
  }, [id]);

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
    } catch (err) {
      console.error('Failed to load event data:', err);
      toastError('Could not load complete event management hub');
    } finally {
      setLoading(false);
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
                <span className="text-slate-500 block">Host Club</span>
                <strong className="text-white">{event.club?.name}</strong>
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
              Total RSVPs: {registrations.length}
            </span>
          </div>

          <div className="rounded-2xl glass-card border border-slate-800 overflow-hidden divide-y divide-slate-800">
            {registrations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No students have registered for this event yet.
              </div>
            ) : (
              registrations
                .filter(
                  (r) =>
                    !regSearch ||
                    r.user?.name.toLowerCase().includes(regSearch.toLowerCase()) ||
                    r.user?.email.toLowerCase().includes(regSearch.toLowerCase()) ||
                    r.ticket?.ticket_code.toLowerCase().includes(regSearch.toLowerCase())
                )
                .map((r) => (
                  <div
                    key={r.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-900/40 transition-colors"
                  >
                    <div>
                      <h4 className="font-bold text-white text-sm">{r.user?.name || 'Student'}</h4>
                      <p className="text-slate-400">{r.user?.email}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                        <span>RSVP on {new Date(r.registered_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="font-mono text-indigo-400">
                          Ticket: {r.ticket?.ticket_code || 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <StatusBadge status={r.status} size="sm" />
                      {r.ticket?.used && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          CHECKED IN
                        </span>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: ATTENDANCE & SCANNER */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-indigo-400" />
              Live Venue Check-In & Scanner
            </h3>
            <button
              onClick={handleCheckInRefresh}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Stats
            </button>
          </div>

          {/* Turnout Stats Cards */}
          <AttendanceStats stats={attendanceStats} />

          {/* QR Scanner (Camera + Manual Fallback) */}
          <QRScanner eventId={event.id} onCheckInSuccess={handleCheckInRefresh} />

          {/* Recent Scans Table */}
          <div className="rounded-2xl glass-card border border-slate-800 p-5">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Verified Attendee Log ({attendees.length})
            </h4>

            {attendees.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No attendees checked in yet. Scan a student's QR code or type their ticket code above.
              </p>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {attendees.slice(0, 10).map((att) => (
                  <div
                    key={att.id}
                    className="py-2.5 flex items-center justify-between text-xs gap-3"
                  >
                    <div>
                      <p className="font-semibold text-white">{att.student_name}</p>
                      <span className="font-mono text-[11px] text-slate-400">
                        {att.ticket_code}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-medium">Checked In</span>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {new Date(att.checked_in_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: LIVE POLLS */}
      {activeTab === 'polls' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                Live Audience Engagement Polls
              </h3>
              <p className="text-xs text-slate-400">
                Create polls during the event to gather instant student votes.
              </p>
            </div>
            <button
              onClick={() => setPollModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create Poll
            </button>
          </div>

          {polls.length === 0 ? (
            <div className="p-12 text-center rounded-2xl glass-card border border-slate-800 text-slate-400 text-sm">
              No polls created yet. Click "Create Poll" above to engage your audience.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {polls.map((p) => (
                <PollCard
                  key={p.id}
                  poll={p}
                  isOrganizer={true}
                  onStatusChange={loadAllEventData}
                />
              ))}
            </div>
          )}

          <PollCreateModal
            isOpen={pollModalOpen}
            onClose={() => setPollModalOpen(false)}
            eventId={event.id}
            onPollCreated={loadAllEventData}
          />
        </div>
      )}

      {/* Tab 5: FEEDBACK & REVIEWS */}
      {activeTab === 'feedback' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              Verified Attendee Reviews
            </h3>
            <p className="text-xs text-slate-400">
              Post-attendance reviews submitted by checked-in students.
            </p>
          </div>

          {feedbackStats && (
            <RatingDistribution
              distribution={feedbackStats.rating_distribution}
              averageRating={feedbackStats.average_rating}
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
