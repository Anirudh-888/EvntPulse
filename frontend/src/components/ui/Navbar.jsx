import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { NotificationDropdown } from './NotificationDropdown';
import {
  Activity,
  Calendar,
  Compass,
  Users,
  LayoutDashboard,
  Ticket,
  LogOut,
  ChevronDown,
  User,
  ShieldAlert,
  Sparkles,
  Menu,
  X
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isStudent, isOrganizer, isAdmin, logout, login } = useAuth();
  const { toastSuccess, toastError } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoSwitchOpen, setDemoSwitchOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    toastSuccess('Logged out successfully');
    navigate('/');
  };

  const handleQuickDemoSwitch = async (role) => {
    setDemoSwitchOpen(false);
    try {
      if (role === 'STUDENT') {
        await login('student@evntpulse.demo', 'Student@123');
        toastSuccess('Switched to Demo Student');
        navigate('/student/dashboard');
      } else if (role === 'ORGANIZER') {
        await login('organizer@evntpulse.demo', 'Organizer@123');
        toastSuccess('Switched to Demo Organizer');
        navigate('/organizer/dashboard');
      } else if (role === 'ADMIN') {
        await login('admin@evntpulse.demo', 'Admin@123');
        toastSuccess('Switched to Demo Admin');
        navigate('/admin/dashboard');
      }
    } catch (err) {
      toastError(err.friendlyMessage || 'Quick switch failed');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/evntpulse-logo.png"
              alt="EvntPulse"
              className="h-9 w-auto object-contain rounded-lg drop-shadow-[0_2px_10px_rgba(99,102,241,0.5)] group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5 leading-none">
                Evnt<span className="text-cyan-400">Pulse</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/80 animate-ping" />
              </span>
              <span className="text-[9px] text-slate-400 font-semibold tracking-widest uppercase mt-0.5">
                Campus OS
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              to="/events"
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                isActive('/events')
                  ? 'bg-slate-800 text-indigo-400 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Compass className="w-4 h-4" />
              Explore Events
            </Link>
            {isStudent && (
              <>
                <Link
                  to="/student/dashboard"
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive('/student/dashboard')
                      ? 'bg-slate-800 text-indigo-400 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  to="/student/tickets"
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive('/student/tickets')
                      ? 'bg-slate-800 text-indigo-400 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Ticket className="w-4 h-4" />
                  My Tickets
                </Link>
              </>
            )}
            {isOrganizer && (
              <>
                <Link
                  to="/organizer/dashboard"
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive('/organizer/dashboard')
                      ? 'bg-slate-800 text-indigo-400 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Organizer Hub
                </Link>
                <Link
                  to="/organizer/events"
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive('/organizer/events')
                      ? 'bg-slate-800 text-indigo-400 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Manage Events
                </Link>
              </>
            )}
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  isActive('/admin/dashboard')
                    ? 'bg-slate-800 text-indigo-400 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Admin Panel
              </Link>
            )}
          </nav>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2.5">
          {/* Quick Demo Switcher Dropdown */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setDemoSwitchOpen(!demoSwitchOpen)}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Switch demo persona with one click"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Demo Roles
              <ChevronDown className="w-3 h-3 text-indigo-400" />
            </button>
            {demoSwitchOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl glass-card border border-slate-700 p-1.5 shadow-2xl z-50">
                <p className="px-2.5 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Quick Demo Switch
                </p>
                <button
                  onClick={() => handleQuickDemoSwitch('STUDENT')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-between"
                >
                  <span>Student Persona</span>
                  <span className="text-[10px] text-indigo-300">Devon</span>
                </button>
                <button
                  onClick={() => handleQuickDemoSwitch('ORGANIZER')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-between"
                >
                  <span>Organizer Persona</span>
                  <span className="text-[10px] text-indigo-300">Sarah</span>
                </button>
                <button
                  onClick={() => handleQuickDemoSwitch('ADMIN')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-between"
                >
                  <span>Admin Persona</span>
                  <span className="text-[10px] text-indigo-300">Alex</span>
                </button>
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <>
              {/* In-app Notification Bell */}
              <NotificationDropdown />

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-slate-200"
                >
                  <img
                    src={user?.profile_image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={user?.name}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-indigo-500/50"
                  />
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold text-slate-200 leading-none truncate max-w-[100px]">
                      {user?.name?.split(' ')[0]}
                    </p>
                    <span className="text-[10px] text-indigo-400 font-medium uppercase tracking-wider">
                      {user?.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-card border border-slate-700/80 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-slate-800 mb-1">
                      <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    </div>

                    {isStudent && (
                      <Link
                        to="/student/profile"
                        onClick={() => setProfileOpen(false)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors"
                      >
                        <User className="w-4 h-4 text-indigo-400" />
                        My Profile
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-xl hover:bg-slate-900 border border-slate-800 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 text-xs font-medium text-white rounded-xl bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 p-4 space-y-2">
          <Link
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm text-slate-300 hover:bg-slate-900 rounded-lg"
          >
            Explore Events
          </Link>
          {isStudent && (
            <>
              <Link
                to="/student/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm text-slate-300 hover:bg-slate-900 rounded-lg"
              >
                Student Dashboard
              </Link>
              <Link
                to="/student/tickets"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm text-slate-300 hover:bg-slate-900 rounded-lg"
              >
                My Tickets
              </Link>
            </>
          )}
          {isOrganizer && (
            <>
              <Link
                to="/organizer/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm text-slate-300 hover:bg-slate-900 rounded-lg"
              >
                Organizer Dashboard
              </Link>
              <Link
                to="/organizer/events"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm text-slate-300 hover:bg-slate-900 rounded-lg"
              >
                Manage Events
              </Link>
            </>
          )}
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm text-amber-400 hover:bg-slate-900 rounded-lg"
            >
              Admin Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
