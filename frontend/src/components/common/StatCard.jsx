import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'emerald', trend = null, badge = null }) => {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      border: 'border-rose-100',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-100',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-100',
    },
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card hover:shadow-card-hover transition-smooth relative overflow-hidden group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{title}</p>
          <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1.5">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${scheme.bg} ${scheme.text} transition-smooth group-hover:scale-105`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {(trend || badge) && (
        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-xs">
          {trend && (
            <span className={`inline-flex items-center font-medium ${trend.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trend.positive ? '+' : ''}{trend.value}
            </span>
          )}
          {badge && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
