import React, { useState, useEffect } from 'react';
import { clubsApi } from '../../services/api';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Flag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminClubs = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await clubsApi.list();
        setClubs(res.data);
      } catch (err) {
        console.error('Failed to load clubs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClubs();
  }, []);

  if (loading) return <LoadingSpinner size="lg" message="Loading campus clubs..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Campus Clubs & Societies</h1>
        <p className="text-xs text-slate-400">Total registered clubs: {clubs.length}</p>
      </div>

      <div className="rounded-2xl glass-card border border-slate-800 overflow-hidden divide-y divide-slate-800">
        {clubs.map((c) => (
          <div key={c.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={c.logo_url || 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=100'}
                alt={c.name}
                className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
              />
              <div>
                <h4 className="text-sm font-bold text-white">{c.name}</h4>
                <p className="text-xs text-slate-400 max-w-lg line-clamp-1 mt-0.5">{c.description}</p>
                {c.owner && (
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Manager: {c.owner.name} ({c.owner.email})
                  </span>
                )}
              </div>
            </div>

            <Link
              to={`/clubs/${c.id}`}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 shrink-0"
            >
              <span>View Club</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
