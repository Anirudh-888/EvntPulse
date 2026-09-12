import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { clubsApi } from '../../services/api';
import { EventGrid } from '../../components/events/EventGrid';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Building, User, Calendar, ArrowLeft } from 'lucide-react';

export const ClubDetails = () => {
  const { id } = useParams();
  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [clubRes, eventsRes] = await Promise.all([
          clubsApi.getById(id),
          clubsApi.getEvents(id),
        ]);
        setClub(clubRes.data);
        setEvents(eventsRes.data);
      } catch (err) {
        console.error('Failed to load club details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <LoadingSpinner size="lg" message="Loading club details..." />;
  if (!club) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-slate-200">Club Not Found</h2>
        <Link to="/events" className="text-indigo-400 text-sm mt-3 inline-block">
          Explore Events
        </Link>
      </div>
    );
  }

  const now = new Date();
  const upcoming = events.filter((e) => new Date(e.start_time) >= now);
  const past = events.filter((e) => new Date(e.start_time) < now);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <Link
        to="/events"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Events
      </Link>

      {/* Club Hero Card */}
      <div className="rounded-3xl glass-card border border-slate-800 p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img
          src={club.logo_url || 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=200'}
          alt={club.name}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-2 ring-indigo-500/40 shadow-xl shrink-0"
        />
        <div className="space-y-2 text-center sm:text-left flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
            <Building className="w-3 h-3" /> Campus Club
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{club.name}</h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            {club.description}
          </p>
          {club.owner && (
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-2 text-xs text-slate-400 font-medium">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>Organizer: <strong>{club.owner.name}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Club Events */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Upcoming Events ({upcoming.length})</h3>
        </div>
        <EventGrid events={upcoming} />
      </section>

      {/* Past Events */}
      {past.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <h3 className="text-lg font-bold text-white">Past Events ({past.length})</h3>
          </div>
          <EventGrid events={past} />
        </section>
      )}
    </div>
  );
};
