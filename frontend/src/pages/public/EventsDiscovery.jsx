import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { eventsApi } from '../../services/api';
import { EventGrid } from '../../components/events/EventGrid';
import { SearchBar } from '../../components/events/SearchBar';
import { FilterBar } from '../../components/events/FilterBar';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Compass, Calendar } from 'lucide-react';

export const EventsDiscovery = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('date_asc');

  useEffect(() => {
    fetchEvents();
  }, [category]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category) params.category = category;

      const res = await eventsApi.list(params);
      let list = res.data;

      // Local sorting
      if (sortBy === 'date_asc') {
        list.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
      } else if (sortBy === 'date_desc') {
        list.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
      } else if (sortBy === 'capacity') {
        list.sort((a, b) => b.capacity - a.capacity);
      }

      setEvents(list);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    if (!val) {
      // Clear URL param
      searchParams.delete('search');
      setSearchParams(searchParams);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl glass-card border border-slate-800 p-8 relative overflow-hidden">
        <div className="max-w-xl space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            Live Campus Directory
          </div>
          <h1 className="text-3xl font-extrabold text-white">Explore Events</h1>
          <p className="text-xs text-slate-400">
            Browse all verified tech workshops, hackathons, and cultural fests scheduled across campus.
          </p>
        </div>
      </div>

      {/* Controls: Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="w-full sm:max-w-md">
            <SearchBar value={search} onChange={handleSearchChange} />
          </form>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <span className="text-xs text-slate-400 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                const sorted = [...events];
                if (e.target.value === 'date_asc') {
                  sorted.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
                } else if (e.target.value === 'date_desc') {
                  sorted.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
                } else if (e.target.value === 'capacity') {
                  sorted.sort((a, b) => b.capacity - a.capacity);
                }
                setEvents(sorted);
              }}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="date_asc">Earliest First</option>
              <option value="date_desc">Latest First</option>
              <option value="capacity">Largest Capacity</option>
            </select>
          </div>
        </div>

        {/* Category Chips */}
        <FilterBar selectedCategory={category} onSelectCategory={setCategory} />
      </div>

      {/* Grid */}
      {loading ? (
        <LoadingSpinner message="Searching verified campus events..." />
      ) : (
        <EventGrid events={events} />
      )}
    </div>
  );
};
