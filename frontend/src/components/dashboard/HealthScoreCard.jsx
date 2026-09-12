import React from 'react';
import { Activity, CheckCircle2, AlertCircle, Info, ShieldCheck } from 'lucide-react';

export const HealthScoreCard = ({ analytics }) => {
  if (!analytics || !analytics.health_breakdown) return null;

  const {
    event_health_score = 0,
    health_breakdown,
    insights = [],
  } = analytics;

  const {
    attendance_score = 0,
    engagement_score = 0,
    rating_score = 0,
    feedback_participation_score = 0,
    classification = 'Standard',
    description = '',
  } = health_breakdown;

  // Determine badge color
  const getBadgeStyle = (cls) => {
    switch (cls) {
      case 'Excellent':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Strong':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'Needs Improvement':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
  };

  return (
    <div className="rounded-2xl glass-card border border-indigo-500/30 p-6 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-white">Event Health Score</h3>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider border border-indigo-500/20">
                Rule-Based Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Deterministic composite index based on turnout, interaction, ratings, and feedback.
            </p>
          </div>
        </div>

        {/* Big Score Display */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-baseline justify-end gap-1">
              <span className="text-4xl font-extrabold font-mono text-white tracking-tight">
                {event_health_score}
              </span>
              <span className="text-xs font-mono text-slate-400">/ 100</span>
            </div>
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${getBadgeStyle(
                classification
              )}`}
            >
              {classification}
            </span>
          </div>
        </div>
      </div>

      {/* Formula Component Breakdown Bars */}
      <div className="py-6 border-b border-slate-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
          Score Components Breakdown
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Attendance Weight (30%) */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Turnout (30%)</span>
              <span className="font-mono text-indigo-400 font-bold">{attendance_score}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: `${Math.min(100, attendance_score)}%` }}
              />
            </div>
          </div>

          {/* Engagement Weight (25%) */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Engagement (25%)</span>
              <span className="font-mono text-cyan-400 font-bold">{engagement_score}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-cyan-400 rounded-full"
                style={{ width: `${Math.min(100, engagement_score)}%` }}
              />
            </div>
          </div>

          {/* Feedback Rating Weight (25%) */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Rating (25%)</span>
              <span className="font-mono text-amber-400 font-bold">{rating_score}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full"
                style={{ width: `${Math.min(100, rating_score)}%` }}
              />
            </div>
          </div>

          {/* Feedback Participation Weight (20%) */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Feedback Rate (20%)</span>
              <span className="font-mono text-emerald-400 font-bold">
                {feedback_participation_score}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full"
                style={{ width: `${Math.min(100, feedback_participation_score)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Rule-based Event Insights */}
      <div className="pt-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          Automated Event Insights
        </h4>
        <div className="space-y-2">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`p-3 rounded-xl flex items-start gap-3 text-xs border ${
                insight.type === 'positive'
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-200'
                  : insight.type === 'warning'
                  ? 'bg-amber-500/5 border-amber-500/20 text-amber-200'
                  : 'bg-indigo-500/5 border-indigo-500/20 text-indigo-200'
              }`}
            >
              {insight.type === 'positive' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              )}
              {insight.type === 'warning' && (
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              {insight.type === 'info' && (
                <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed font-medium">{insight.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
