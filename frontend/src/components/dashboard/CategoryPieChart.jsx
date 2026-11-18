import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useAuth } from '../../context/AuthContext';

export const CategoryPieChart = ({ data = [] }) => {
  const { getCurrencySymbol } = useAuth();
  const symbol = getCurrencySymbol();

  const defaultColors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316', '#64748b'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs">
          <p className="font-bold flex items-center space-x-1.5 text-slate-200">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.color || defaultColors[0] }}
            ></span>
            <span>{item.categoryName}</span>
          </p>
          <p className="mt-1 text-slate-300">
            Amount: <span className="font-bold text-white">{symbol} {Number(item.amount || 0).toLocaleString()}</span>
          </p>
          <p className="text-emerald-400 font-semibold">{item.percentage}% of total expenses</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-card flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">Expense Breakdown</h3>
          <p className="text-xs text-slate-400 mt-0.5">Top spending categories this month</p>
        </div>
      </div>

      <div className="h-56 w-full flex items-center justify-center relative">
        {data.length === 0 ? (
          <div className="text-xs text-slate-400 text-center py-10">
            No expense data recorded this month.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={data}
                dataKey="amount"
                nameKey="categoryName"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || defaultColors[index % defaultColors.length]}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend list */}
      {data.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-50 grid grid-cols-2 gap-2 text-xs">
          {data.slice(0, 4).map((cat, idx) => (
            <div key={idx} className="flex items-center space-x-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: cat.color || defaultColors[idx % defaultColors.length] }}
              ></span>
              <span className="text-slate-600 truncate">{cat.categoryName}</span>
              <span className="font-bold text-slate-800 ml-auto">{cat.percentage}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
