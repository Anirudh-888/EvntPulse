import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Navbar } from '../components/ui/Navbar';
import { Shield, LayoutDashboard, Users, Flag, Calendar } from 'lucide-react';

export const AdminLayout = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Clubs', path: '/admin/clubs', icon: Flag },
    { label: 'Events', path: '/admin/events', icon: Calendar },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-slate-100 bg-grid-pattern">
      <Navbar />
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-60 shrink-0">
          <div className="rounded-2xl glass-card border border-slate-800 p-4 sticky top-24">
            <div className="px-3 py-2 mb-3 border-b border-slate-800">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Admin Portal
              </span>
              <p className="text-xs font-semibold text-slate-200 mt-0.5">Platform Oversight</p>
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
                        ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-bold'
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

        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
