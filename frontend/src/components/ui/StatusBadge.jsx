import React from 'react';

export const StatusBadge = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs font-semibold';
  
  const statusStyles = {
    PUBLISHED: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    ONGOING: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 animate-pulse',
    COMPLETED: 'bg-slate-500/10 text-slate-400 border border-slate-500/30',
    DRAFT: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    CANCELLED: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
    REGISTERED: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30',
    ATTENDED: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    ACTIVE: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    CLOSED: 'bg-slate-500/10 text-slate-400 border border-slate-500/30',
    VALID: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    USED: 'bg-slate-500/10 text-slate-400 border border-slate-500/30',
  };

  const style = statusStyles[status?.toUpperCase()] || 'bg-slate-800 text-slate-300 border border-slate-700';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${sizeClasses} ${style} tracking-wide uppercase`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
};
