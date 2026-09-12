import React from 'react';
import { Filter } from 'lucide-react';

const CATEGORIES = [
  'ALL',
  'TECHNOLOGY',
  'WORKSHOP',
  'HACKATHON',
  'CULTURAL',
  'SPORTS',
  'SEMINAR',
  'COMPETITION',
  'SOCIAL',
];

export const FilterBar = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
      <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold uppercase tracking-wider pl-1 pr-2 shrink-0">
        <Filter className="w-3.5 h-3.5" />
        <span>Categories:</span>
      </div>
      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === (cat === 'ALL' ? '' : cat);
        return (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat === 'ALL' ? '' : cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              isSelected
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800/80'
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
};
