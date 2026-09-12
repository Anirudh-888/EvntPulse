import React from 'react';
import { Users, UserCheck, UserMinus, Percent } from 'lucide-react';

export const AttendanceStats = ({ stats }) => {
  if (!stats) return null;

  const {
    total_registrations = 0,
    checked_in_count = 0,
    remaining_count = 0,
    attendance_rate = 0,
  } = stats;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* Total Registrations */}
      <div className="rounded-2xl glass-card border border-slate-800 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total RSVPs
          </span>
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-extrabold text-white">{total_registrations}</p>
        <span className="text-[11px] text-slate-500">Confirmed registrations</span>
      </div>

      {/* Checked-in Attendees */}
      <div className="rounded-2xl glass-card border border-slate-800 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Checked In
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-extrabold text-emerald-400">{checked_in_count}</p>
        <span className="text-[11px] text-emerald-500/80">Turned up at venue</span>
      </div>

      {/* Remaining Attendees */}
      <div className="rounded-2xl glass-card border border-slate-800 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Remaining
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <UserMinus className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-extrabold text-amber-400">{remaining_count}</p>
        <span className="text-[11px] text-amber-500/80">Pending arrival</span>
      </div>

      {/* Attendance Rate */}
      <div className="rounded-2xl glass-card border border-slate-800 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Turnout Rate
          </span>
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-extrabold text-cyan-400">{attendance_rate}%</p>
        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1.5">
          <div
            className="h-full rounded-full bg-cyan-400 transition-all duration-500"
            style={{ width: `${Math.min(100, attendance_rate)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
