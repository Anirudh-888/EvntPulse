import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Navbar } from '../components/ui/Navbar';
import {
  LayoutDashboard,
  Calendar,
  PlusCircle,
  BarChart3,
  Users,
  CheckSquare,
  MessageSquare,
  Star,
  Bell,
  User,
} from 'lucide-react';

export const OrganizerLayout = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/organizer/dashboard', icon: LayoutDashboard },
    { label: 'My Events', path: '/organizer/events', icon: Calendar },
    { label: 'Create Event', path: '/organizer/events/create', icon: PlusCircle },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-slate-100 bg-grid-pattern">
      <Navbar />
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        {/* Organizer Sidebar */}
        <aside className="w-full md:w-60 shrink-0">
          <div className="rounded-2xl glass-card border border-slate-800 p-4 sticky top-24">
            <div className="px-3 py-2 mb-3 border-b border-slate-800">
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
                Organizer Hub
              </span>
              <p className="text-xs font-semibold text-slate-200 mt-0.5">Club Management</p>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
