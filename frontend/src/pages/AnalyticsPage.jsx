import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Percent,
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { useAuth } from '../context/AuthContext';
import { IncomeExpenseChart } from '../components/dashboard/IncomeExpenseChart';
import { CategoryPieChart } from '../components/dashboard/CategoryPieChart';
import { SpendingTrendChart } from '../components/dashboard/SpendingTrendChart';
import { StatCard } from '../components/common/StatCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const AnalyticsPage = () => {
  const { formatCurrency } = useAuth();
  const [timeframe, setTimeframe] = useState('MONTHLY'); // WEEKLY, MONTHLY, YEARLY, CUSTOM
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await dashboardService.getAnalytics(
        timeframe,
        startDate || undefined,
        endDate || undefined
      );
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timeframe !== 'CUSTOM' || (startDate && endDate)) {
      loadAnalytics();
    }
  }, [timeframe, startDate, endDate]);

  return (
    <div className="space-y-6">
      {/* Title & Timeframe Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Advanced Financial Intelligence</h2>
          <p className="text-xs text-slate-400 mt-0.5">Deep insights into savings velocity, burn rate, and category allocation</p>
        </div>

        {/* Timeframe pill tabs */}
        <div className="inline-flex p-1 bg-white border border-slate-200 rounded-2xl shadow-sm self-start md:self-auto">
          {['WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeframe === tf
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tf.charAt(0) + tf.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Range Picker when CUSTOM is selected */}
      {timeframe === 'CUSTOM' && (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card flex flex-wrap items-center gap-3">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold text-slate-700">Custom Range:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
          />
          <span className="text-slate-400 text-xs">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
          />
          <button
            onClick={loadAnalytics}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
          >
            Apply Range
          </button>
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Computing algorithmic analytics and historical trend curves..." />
      ) : (
        <>
          {/* Metrics summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Cash Inflow"
              value={formatCurrency(analytics?.totalIncome || 0)}
              subtitle={`Timeframe: ${analytics?.timeframe}`}
              icon={TrendingUp}
              color="emerald"
            />
            <StatCard
              title="Total Cash Burn"
              value={formatCurrency(analytics?.totalExpense || 0)}
              subtitle="All debit expenditures"
              icon={TrendingDown}
              color="rose"
            />
            <StatCard
              title="Net Retained Capital"
              value={formatCurrency(analytics?.netSavings || 0)}
              subtitle="Cashflow surplus"
              icon={PiggyBank}
              color={analytics?.netSavings >= 0 ? 'purple' : 'rose'}
            />
            <StatCard
              title="Savings Efficiency Rate"
              value={`${analytics?.savingsRate || 0}%`}
              subtitle="Portion of earnings retained"
              icon={Percent}
              color={analytics?.savingsRate >= 20 ? 'emerald' : 'amber'}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <IncomeExpenseChart data={analytics?.monthlyTrends || []} />
            </div>
            <div>
              <CategoryPieChart data={analytics?.categoryBreakdown || []} />
            </div>
          </div>

          {/* Spending Trend & Category Table Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SpendingTrendChart data={analytics?.monthlyTrends || []} />
            </div>

            {/* Category breakdown table */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-card">
              <h3 className="text-base font-bold text-slate-800 mb-1">Category Leaderboard</h3>
              <p className="text-xs text-slate-400 mb-4">Ranked by total outflow volume</p>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {(analytics?.categoryBreakdown || []).length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No category data for this period.</p>
                ) : (
                  (analytics?.categoryBreakdown || []).map((cat, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-none">
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: cat.color || '#10b981' }}
                        ></span>
                        <span className="font-semibold text-slate-700">{cat.categoryName}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-800">{formatCurrency(cat.amount)}</span>
                        <span className="text-slate-400 ml-2 font-mono text-[10px]">({cat.percentage}%)</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
