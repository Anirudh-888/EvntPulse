import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eventsApi, registrationsApi, pollsApi, feedbackApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Modal } from '../../components/ui/Modal';
import { QRDisplay } from '../../components/attendance/QRDisplay';
import { PollCard } from '../../components/polls/PollCard';
import { FeedbackCard } from '../../components/feedback/FeedbackCard';
import { FeedbackModal } from '../../components/feedback/FeedbackModal';
import { RatingDistribution } from '../../components/feedback/RatingDistribution';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Building,
  CheckCircle2,
  Ticket as TicketIcon,
  MessageSquare,
  Star,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isOrganizer } = useAuth();
  const { toastSuccess, toastError } = useNotification();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [polls, setPolls] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [ticketData, setTicketData] = useState(null);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      const [evRes, pollsRes, fbRes] = await Promise.all([
        eventsApi.getById(id),
        pollsApi.getEventPolls(id),
        feedbackApi.getStats(id),
      ]);
      setEvent(evRes.data);
      setPolls(pollsRes.data);
      setFeedbackStats(fbRes.data);

      if (evRes.data.my_ticket_id) {
        // Fetch ticket details for QR display
        try {
          const tRes = await registrationsApi.getMyRegistrations();
          const match = tRes.data.find((r) => r.event_id === Number(id));
          if (match?.ticket) {
            setTicketData(match.ticket);
          }
        } catch (e) {}
      }
    } catch (err) {
      console.error('Error fetching event details:', err);
      toastError('Event details could not be loaded');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      toastError('Please sign in or register to RSVP for campus events.');
      navigate('/login');
      return;
    }

    setRegistering(true);
    try {
      const res = await registrationsApi.register(id);
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
      });
      toastSuccess('RSVP Confirmed! Your digital QR ticket is ready.');
      setTicketData(res.data.ticket);
      setTicketModalOpen(true);
      await fetchEventDetails();
    } catch (err) {
      toastError(err.friendlyMessage || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading campus event details..." />;
  }

  if (!event) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-slate-200">Event Not Found</h2>
        <Link to="/events" className="text-indigo-400 text-sm mt-3 inline-block">
          Return to Events Directory
        </Link>
      </div>
    );
  }

  const startDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);
  const deadline = new Date(event.registration_deadline);
  const now = new Date();
  const isDeadlinePassed = now > deadline;
  const isSoldOut = (event.available_slots || 0) <= 0;
  const isCancelled = event.status === 'CANCELLED';
  const isCompleted = event.status === 'COMPLETED';

  // Format dates
  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = `${startDate.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })} - ${endDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Back button */}
      <Link
        to="/events"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Events
      </Link>

      {/* Main Hero Card */}
      <div className="rounded-3xl overflow-hidden glass-card border border-slate-800 shadow-2xl">
        {/* Banner Poster */}
        <div className="relative h-64 sm:h-80 md:h-96 w-full bg-slate-950">
          <img
            src={event.poster_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

          {/* Overlay Tags */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <span className="px-3 py-1 text-xs font-bold rounded-xl bg-slate-950/80 backdrop-blur-md text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
              {event.category}
            </span>
            <StatusBadge status={event.status} size="md" />
          </div>

          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white drop-shadow-md">
              {event.title}
            </h1>
            {event.club && (
              <Link
                to={`/clubs/${event.club_id}`}
                className="inline-flex items-center gap-2 mt-2 text-sm text-indigo-300 hover:text-indigo-200 font-semibold drop-shadow"
              >
                <Building className="w-4 h-4" />
                Hosted by {event.club.name}
              </Link>
            )}
          </div>
        </div>

        {/* Info & Action Bar */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Details & Description */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block">Date</span>
                  <strong className="text-white">{formattedDate}</strong>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block">Time</span>
                  <strong className="text-white">{formattedTime}</strong>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block">Venue</span>
                  <strong className="text-white">{event.venue}</strong>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block">RSVP Deadline</span>
                  <strong className="text-white">{deadline.toLocaleDateString()}</strong>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-white mb-2">About this Event</h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>
          </div>

          {/* Right Col: Registration Card & Dynamic CTA */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Attendance & Capacity
              </span>
              <div className="flex items-baseline justify-between mt-2 mb-2">
                <span className="text-2xl font-extrabold font-mono text-white">
                  {event.available_slots ?? event.capacity}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  / {event.capacity} seats remaining
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-4">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        (((event.capacity - (event.available_slots ?? event.capacity)) /
                          event.capacity) *
                          100)
                      )
                    )}%`,
                  }}
                />
              </div>

              {/* Status Message */}
              {event.is_registered ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>You are registered for this event!</span>
                </div>
              ) : isSoldOut ? (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 mb-4">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Capacity full: Registration is closed.</span>
                </div>
              ) : isDeadlinePassed ? (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2 mb-4">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Registration deadline has passed.</span>
                </div>
              ) : null}
            </div>

            {/* CTA Buttons */}
            <div className="space-y-2.5">
              {event.is_registered ? (
                <>
                  <button
                    onClick={() => setTicketModalOpen(true)}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                  >
                    <TicketIcon className="w-4 h-4" />
                    View My QR Ticket
                  </button>
                  {event.is_attended && (
                    <button
                      onClick={() => setFeedbackModalOpen(true)}
                      className="w-full py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      Submit Event Feedback
                    </button>
                  )}
                </>
              ) : isCancelled ? (
                <button
                  disabled
                  className="w-full py-3 rounded-xl bg-rose-950/50 text-rose-400 font-bold text-xs uppercase tracking-wider border border-rose-800/60 cursor-not-allowed"
                >
                  Event Cancelled
                </button>
              ) : isCompleted ? (
                <button
                  disabled
                  className="w-full py-3 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs uppercase tracking-wider cursor-not-allowed"
                >
                  Event Concluded
                </button>
              ) : isSoldOut ? (
                <button
                  disabled
                  className="w-full py-3 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs uppercase tracking-wider cursor-not-allowed"
                >
                  Registration Full
                </button>
              ) : isDeadlinePassed ? (
                <button
                  disabled
                  className="w-full py-3 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs uppercase tracking-wider cursor-not-allowed"
                >
                  Registration Closed
                </button>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/30"
                >
                  {registering ? 'Securing Spot...' : 'Register Now'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Live Interactive Polls Section */}
      {polls.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Live Audience Polls</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {polls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                isOrganizer={false}
                onVoteSuccess={fetchEventDetails}
              />
            ))}
          </div>
        </section>
      )}

      {/* Feedback & Ratings Section */}
      {feedbackStats && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <h3 className="text-lg font-bold text-white">Attendee Feedback & Ratings</h3>
            </div>
          </div>

          <RatingDistribution
            distribution={feedbackStats.rating_distribution}
            averageRating={feedbackStats.average_rating}
            totalFeedback={feedbackStats.total_feedback}
          />

          {feedbackStats.recent_feedbacks?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {feedbackStats.recent_feedbacks.map((fb) => (
                <FeedbackCard key={fb.id} feedback={fb} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Ticket Modal */}
      <Modal
        isOpen={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        title="Your Digital Campus Ticket"
        maxWidth="max-w-md"
      >
        {ticketData && (
          <div className="space-y-4">
            <QRDisplay
              qrImage={ticketData.qr_code_image}
              ticketCode={ticketData.ticket_code}
            />
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
              <p><strong>Event:</strong> {event.title}</p>
              <p><strong>Venue:</strong> {event.venue}</p>
              <p><strong>Time:</strong> {formattedTime}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Feedback Submission Modal */}
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        eventId={event.id}
        eventTitle={event.title}
        onFeedbackSubmitted={fetchEventDetails}
      />
    </div>
  );
};
