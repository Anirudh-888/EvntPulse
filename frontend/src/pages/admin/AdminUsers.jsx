import React, { useState, useEffect } from 'react';
import { usersApi } from '../../services/api';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { SearchBar } from '../../components/events/SearchBar';
import { Users, Shield } from 'lucide-react';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await usersApi.list();
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" message="Loading users directory..." />;

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Registered Users</h1>
        <p className="text-xs text-slate-400">Total accounts registered on EvntPulse: {users.length}</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:max-w-md">
          <SearchBar value={search} onChange={setSearch} placeholder="Search user name or email..." />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          {['ALL', 'STUDENT', 'ORGANIZER', 'ADMIN'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                roleFilter === r
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl glass-card border border-slate-800 overflow-hidden divide-y divide-slate-800">
        {filteredUsers.map((u) => (
          <div key={u.id} className="p-4 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <img
                src={u.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={u.name}
                className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
              />
              <div>
                <h4 className="font-bold text-white text-sm">{u.name}</h4>
                <p className="text-slate-400">{u.email}</p>
                <span className="text-[10px] text-slate-500">
                  {u.college} {u.department ? `• ${u.department}` : ''}
                </span>
              </div>
            </div>

            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                u.role === 'ADMIN'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : u.role === 'ORGANIZER'
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                  : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
              }`}
            >
              {u.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
