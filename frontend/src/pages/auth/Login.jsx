import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Activity, Lock, Mail, ArrowRight, Sparkles, UserCheck, Shield } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const { toastSuccess, toastError } = useNotification();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toastSuccess(`Welcome back, ${user.name}!`);
      if (user.role === 'ORGANIZER') {
        navigate('/organizer/dashboard');
      } else if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      toastError(err.friendlyMessage || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPw, targetPath) => {
    setLoading(true);
    try {
      const user = await login(demoEmail, demoPw);
      toastSuccess(`Logged in as ${user.role}: ${user.name}`);
      navigate(targetPath);
    } catch (err) {
      toastError(err.friendlyMessage || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-xl shadow-indigo-600/30 mx-auto mb-3">
          <Activity className="w-6 h-6 text-white animate-pulse" />
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Sign In to <span className="text-indigo-400">EvntPulse</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Access your campus event tickets, analytics, and live interactive polls
        </p>
      </div>

      {/* Quick 1-Click Demo Logins Banner */}
      <div className="rounded-2xl glass-card border border-indigo-500/30 p-4 mb-6 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
            One-Click Evaluation Accounts
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin('student@evntpulse.demo', 'Student@123', '/student/dashboard')}
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-indigo-600 hover:text-white border border-slate-700/80 text-center transition-all group"
          >
            <UserCheck className="w-4 h-4 text-indigo-400 group-hover:text-white mx-auto mb-1" />
            <span className="block text-[11px] font-bold text-slate-200 group-hover:text-white">Student</span>
            <span className="block text-[9px] text-slate-400 group-hover:text-indigo-200">Devon</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('organizer@evntpulse.demo', 'Organizer@123', '/organizer/dashboard')}
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-indigo-600 hover:text-white border border-slate-700/80 text-center transition-all group"
          >
            <Activity className="w-4 h-4 text-indigo-400 group-hover:text-white mx-auto mb-1" />
            <span className="block text-[11px] font-bold text-slate-200 group-hover:text-white">Organizer</span>
            <span className="block text-[9px] text-slate-400 group-hover:text-indigo-200">Sarah</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('admin@evntpulse.demo', 'Admin@123', '/admin/dashboard')}
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-indigo-600 hover:text-white border border-slate-700/80 text-center transition-all group"
          >
            <Shield className="w-4 h-4 text-amber-400 group-hover:text-white mx-auto mb-1" />
            <span className="block text-[11px] font-bold text-slate-200 group-hover:text-white">Admin</span>
            <span className="block text-[9px] text-slate-400 group-hover:text-indigo-200">Alex</span>
          </button>
        </div>
      </div>

      {/* Standard Form */}
      <div className="rounded-2xl glass-card border border-slate-800 p-6 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@evntpulse.demo"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6 pt-4 border-t border-slate-800">
          New to EvntPulse?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
