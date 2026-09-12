import React from 'react';

export const KpiCard = ({ title, value, subtitle, icon: Icon, color = 'indigo' }) => {
  const colorMap = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  const style = colorMap[color] || colorMap.indigo;

  return (
    <div className="rounded-2xl glass-card border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${style}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};
