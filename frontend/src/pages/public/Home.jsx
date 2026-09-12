import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eventsApi, clubsApi } from '../../services/api';
import { EventGrid } from '../../components/events/EventGrid';
import { SearchBar } from '../../components/events/SearchBar';
import { FilterBar } from '../../components/events/FilterBar';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import {
  Activity,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Calendar,
  ShieldCheck,
  Zap,
  Users,
  Award
} from 'lucide-react';

export const Home = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, clubsRes] = await Promise.all([
          eventsApi.list({ limit: 12 }),
          clubsApi.list(),
        ]);
        setEvents(eventsRes.data);
        setClubs(clubsRes.data);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const trendingEvents = events.slice(0, 3);
  const upcomingEvents = events.slice(0, 6);

  return (
    <div className="space-y-14">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden glass-card border border-indigo-500/20 p-8 sm:p-12 lg:p-16 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/40 via-transparent to-slate-950/80 pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wide uppercase shadow-inner">
            <Sparkles className="w-3.5 h-3.5" />
            Smart Campus Event Operating System
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
            Your Campus. Your Events. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400">
              One Pulse.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Discover hackathons, workshops, and cultural fests with cryptographic QR ticketing,
            live interactive polls, and transparent event health intelligence.
          </p>

          {/* Quick Hero Search Input */}
          <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto pt-2">
            <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-700 shadow-2xl">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search AI Summit, CodeSprint, Valorant..."
                className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/30 shrink-0"
              >
                Find Events
              </button>
            </div>
          </form>

          {/* Quick Pillars */}
          <div className="pt-6 grid grid-cols-3 gap-4 max-w-md mx-auto border-t border-slate-800/80 text-center">
            <div>
              <p className="text-xl font-extrabold font-mono text-white">100%</p>
              <p className="text-[11px] text-slate-400">Verified QR Tickets</p>
            </div>
            <div>
              <p className="text-xl font-extrabold font-mono text-cyan-400">Real-time</p>
              <p className="text-[11px] text-slate-400">Live Audience Polls</p>
            </div>
            <div>
              <p className="text-xl font-extrabold font-mono text-indigo-400">Explainable</p>
              <p className="text-[11px] text-slate-400">Health Intelligence</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured / Trending Events */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Trending on Campus</h2>
              <p className="text-xs text-slate-400">Most registered events this week</p>
            </div>
          </div>
          <Link
            to="/events"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading trending events..." />
        ) : (
          <EventGrid events={trendingEvents} />
        )}
      </section>

      {/* Popular Campus Clubs */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Active Student Clubs</h2>
              <p className="text-xs text-slate-400">Student societies driving campus culture</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.slice(0, 6).map((club) => (
            <Link
              key={club.id}
              to={`/clubs/${club.id}`}
              className="p-4 rounded-2xl glass-card border border-slate-800 hover:border-indigo-500/40 transition-all flex items-center gap-4 group"
            >
              <img
                src={club.logo_url || 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=100'}
                alt={club.name}
                className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-700 group-hover:scale-105 transition-transform shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-200 group-hover:text-indigo-300 transition-colors truncate">
                  {club.name}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{club.description}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          ))}
        </div>
      </section>

      {/* Upcoming Events Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Upcoming Events</h2>
              <p className="text-xs text-slate-400">RSVP now before registration reaches capacity</p>
            </div>
          </div>
          <Link
            to="/events"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading upcoming events..." />
        ) : (
          <EventGrid events={upcomingEvents} />
        )}
      </section>
    </div>
  );
};
