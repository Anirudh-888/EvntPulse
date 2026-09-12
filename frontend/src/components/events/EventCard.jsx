import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowUpRight } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';

export const EventCard = ({ event }) => {
  const startDate = new Date(event.start_time);
  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const availableSlots = event.available_slots !== undefined ? event.available_slots : event.capacity;
  const isSoldOut = availableSlots <= 0;
  const fillPercentage = Math.min(
    100,
    Math.round(((event.capacity - availableSlots) / event.capacity) * 100)
  );

  return (
    <div className="group rounded-2xl glass-card border border-slate-800/80 hover:border-indigo-500/40 transition-all duration-300 flex flex-col overflow-hidden glass-card-hover">
      {/* Poster Header */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-950">
        <img
          src={event.poster_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600'}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        
        {/* Category & Status Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-950/80 backdrop-blur-md text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
            {event.category}
          </span>
          <StatusBadge status={event.status} size="sm" />
        </div>

        {/* Club Label */}
        {event.club && (
          <div className="absolute bottom-2.5 left-3 flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-200 drop-shadow-md">
              {event.club.name}
            </span>
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <Link to={`/events/${event.id}`}>
            <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1 mb-2">
              {event.title}
            </h3>
          </Link>

          <div className="space-y-1.5 text-xs text-slate-400 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>{formattedDate} • {formattedTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
          </div>
        </div>

        {/* Capacity Progress and CTA */}
        <div>
          <div className="mb-3">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 text-slate-500" />
                {isSoldOut ? (
                  <span className="text-rose-400 font-semibold">Sold Out</span>
                ) : (
                  <span>{availableSlots} spots left</span>
                )}
              </span>
              <span className="font-mono">{fillPercentage}% filled</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isSoldOut
                    ? 'bg-rose-500'
                    : fillPercentage > 75
                    ? 'bg-amber-500'
                    : 'bg-indigo-500'
                }`}
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
          </div>

          <Link
            to={`/events/${event.id}`}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 hover:text-white text-slate-200 border border-slate-800 hover:border-indigo-500 text-xs font-semibold transition-all group/btn"
          >
            <span>View Event</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
