import React, { useState, useEffect } from 'react';
import { clubsApi } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Flag, ArrowRight, Mail, Plus, Building, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminClubs = () => {
  const { toastSuccess, toastError } = useNotification();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Club Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [deletingId, setDeletingId] = useState(null);

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
        owner_email: ownerEmail.trim() || email.trim(),
        description: description.trim(),
        logo_url: logoUrl.trim() || 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=200',
      });
      toastSuccess(`Club "${name}" created successfully!`);
      setModalOpen(false);
      setName('');
      setEmail('');
      setOwnerEmail('');
      setDescription('');
      setLogoUrl('');
      fetchClubs();
    } catch (err) {
      toastError(err.friendlyMessage || 'Failed to create club');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteClub = async (clubId, clubName) => {
    if (!window.confirm(`Are you sure you want to delete "${clubName}"? All its events and records will be removed.`)) return;
    setDeletingId(clubId);
    try {
      await clubsApi.delete(clubId);
      toastSuccess(`Club "${clubName}" deleted successfully`);
      setClubs((prev) => prev.filter((c) => c.id !== clubId));
    } catch (err) {
      toastError(err.friendlyMessage || 'Failed to delete club');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <LoadingSpinner size="lg" message="Loading campus clubs..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Campus Clubs & Societies</h1>
          <p className="text-xs text-slate-400">Total registered clubs: {clubs.length}</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Add New Club
        </button>
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
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">{c.name}</h4>
                  {c.email && (
                    <span className="text-[11px] font-mono text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {c.email}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 max-w-lg line-clamp-1 mt-1">{c.description}</p>
                {c.owner && (
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Manager: {c.owner.name} ({c.owner.email})
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                to={`/clubs/${c.id}`}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5"
              >
                <span>View Club</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                disabled={deletingId === c.id}
                onClick={() => handleDeleteClub(c.id, c.name)}
                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 transition-colors"
                title="Delete Club"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Club Modal */}
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
                  placeholder="e.g. AI & Robotics Club MVJCE"
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
                  placeholder="e.g. robotics@mvjce.edu.in"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Manager / Lead Email (Optional)
                </label>
                <input
                  type="email"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="e.g. lead.robotics@mvjce.edu.in (defaults to club email)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
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
