import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';

export const IncomeExpenseChart = ({ data = [] }) => {
  const { getCurrencySymbol } = useAuth();
  const symbol = getCurrencySymbol();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs">
          <p className="font-bold text-slate-300 mb-1.5">{label}</p>
          <div className="space-y-1">
            <p className="flex items-center space-x-2 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Income: {symbol} {Number(payload[0]?.value || 0).toLocaleString()}</span>
            </p>
            <p className="flex items-center space-x-2 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <span>Expenses: {symbol} {Number(payload[1]?.value || 0).toLocaleString()}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-800">Income vs Expenses</h3>
          <p className="text-xs text-slate-400 mt-0.5">Monthly cashflow distribution</p>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span className="flex items-center space-x-1.5 text-slate-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Income</span>
          </span>
          <span className="flex items-center space-x-1.5 text-slate-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Expenses</span>
          </span>
        </div>
      </div>

      <div className="h-72 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No transaction records available yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={6} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="monthName" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} name="Income" />
              <Bar dataKey="expense" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
