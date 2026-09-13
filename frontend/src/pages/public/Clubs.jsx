import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clubsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Building, Mail, Users, ArrowRight, Plus, Search, ShieldCheck } from 'lucide-react';

export const Clubs = () => {
  const { user, isOrganizer, isAdmin } = useAuth();
  const { toastSuccess, toastError } = useNotification();

  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add Club Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  const canAddClub = isOrganizer || isAdmin;

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    setLoading(true);
    try {
      const res = await clubsApi.list();
      setClubs(res.data);
    } catch (err) {
      console.error('Failed to load clubs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClub = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toastError('Club name is required');
    if (!email.trim()) return toastError('Club official email is required');

    setCreating(true);
    try {
      await clubsApi.create({
        name: name.trim(),
        email: email.trim(),
        description: description.trim(),
        logo_url: logoUrl.trim() || 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=200',
      });
      toastSuccess(`Club "${name}" created successfully!`);
      setModalOpen(false);
      setName('');
      setEmail('');
      setDescription('');
      setLogoUrl('');
      fetchClubs();
    } catch (err) {
      toastError(err.friendlyMessage || 'Failed to create club');
    } finally {
      setCreating(false);
    }
  };

  const filteredClubs = clubs.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.description && c.description.toLowerCase().includes(q))
    );
  });

  if (loading) return <LoadingSpinner size="lg" message="Loading campus clubs..." />;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20 mb-2">
            <Building className="w-3.5 h-3.5" /> Campus Organizations
          </div>
          <h1 className="text-3xl font-extrabold text-white">Campus Clubs & Societies</h1>
          <p className="text-sm text-slate-400 mt-1">
            Discover student organizations, contact official club emails, and explore hosted events.
          </p>
        </div>

        {canAddClub && (
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add New Club
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by club name, official email, or keyword..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Clubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClubs.map((club) => (
          <div
            key={club.id}
            className="rounded-2xl glass-card border border-slate-800/80 p-5 flex flex-col justify-between hover:border-slate-700 transition-all group"
          >
            <div className="space-y-3">
              <div className="flex items-start gap-3.5">
                <img
                  src={club.logo_url || 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=100'}
                  alt={club.name}
                  className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                    {club.name}
                  </h3>
                  {club.email && (
                    <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-mono mt-0.5">
                      <Mail className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                      <span className="truncate">{club.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {club.description || 'Active campus student society hosting technical workshops and events.'}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Official Host Organization
              </span>
              <Link
                to={`/clubs/${club.id}`}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-indigo-600 text-slate-300 hover:text-white border border-slate-800 hover:border-indigo-500 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <span>View Events</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Club Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg p-6 rounded-3xl glass-card border border-slate-700 bg-slate-950 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <Building className="w-5 h-5 text-indigo-400" />
                  Add Campus Club
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Register a new campus organization and allocate its official email.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClub} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Club / Society Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. AI & Machine Learning Guild"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Official Club Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. aiml@mvjce.edu.in"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  This official email will appear on event invitations and tickets.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe mission, activities, and membership..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Logo URL (Optional)
                </label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
                >
                  {creating ? 'Creating...' : 'Create Club'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
