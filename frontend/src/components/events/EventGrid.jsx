import React from 'react';
import { EventCard } from './EventCard';
import { EmptyState } from '../ui/EmptyState';
import { CalendarX } from 'lucide-react';

export const EventGrid = ({ events = [], loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl glass-card border border-slate-800 p-4 h-80 animate-pulse flex flex-col justify-between"
          >
            <div className="h-40 bg-slate-800/60 rounded-xl w-full" />
            <div className="space-y-2 mt-4">
              <div className="h-4 bg-slate-800/60 rounded w-3/4" />
              <div className="h-3 bg-slate-800/40 rounded w-1/2" />
            </div>
            <div className="h-8 bg-slate-800/60 rounded-xl w-full mt-4" />
          </div>
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <EmptyState
        icon={CalendarX}
        title="No events found"
        description="No events matched your current search filters or category criteria."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};
