import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, AlertCircle, CheckCircle2, ChevronRight, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const BudgetWidget = ({ budgets = [] }) => {
  const { formatCurrency } = useAuth();

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Budget Watch</h3>
            <p className="text-xs text-slate-400 mt-0.5">Monthly allocation vs actual spend</p>
          </div>
          <Link
            to="/budgets"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
          >
            <span>Manage</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {budgets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-slate-400 mb-3">No budgets configured for this month.</p>
            <Link
              to="/budgets"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Set First Budget</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {budgets.slice(0, 4).map((b) => {
              const pct = Math.min(b.percentageSpent || 0, 100);
              const isExceeded = b.isExceeded;
              const isWarning = b.isWarning;

              let statusColor = 'bg-emerald-500';
              let badgeText = 'Normal';
              let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-100';

              if (isExceeded) {
                statusColor = 'bg-rose-500';
                badgeText = 'Exceeded!';
                badgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
              } else if (isWarning) {
                statusColor = 'bg-amber-500';
                badgeText = 'Near Limit (80%)';
                badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
              }

              return (
                <div key={b.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{b.categoryName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}>
                      {badgeText}
                    </span>
                  </div>

                  {/* Progress bar track */}
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${statusColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span>Spent: {formatCurrency(b.spentAmount)}</span>
                    <span>Limit: {formatCurrency(b.amount)} ({b.percentageSpent}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {budgets.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Active Trackers: {budgets.length}</span>
          <span className="text-emerald-600 font-medium">Real-time alerts active</span>
        </div>
      )}
    </div>
  );
};
