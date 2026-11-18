import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DynamicIcon } from '../common/DynamicIcon';

export const RecentTransactionsTable = ({ transactions = [] }) => {
  const { formatCurrency } = useAuth();

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800">Recent Activity</h3>
          <p className="text-xs text-slate-400 mt-0.5">Latest expenses and income deposits</p>
        </div>
        <Link
          to="/transactions"
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
        >
          <span>View All</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="divide-y divide-slate-100">
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No recent activity recorded yet.
          </div>
        ) : (
          transactions.map((tx, idx) => {
            const isExpense = tx.type === 'EXPENSE';
            return (
              <div
                key={`${tx.type}-${tx.id}-${idx}`}
                className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-center space-x-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isExpense ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                    }`}
                  >
                    {isExpense ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 truncate max-w-xs sm:max-w-md">
                      {tx.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-0.5 text-xs text-slate-400">
                      <span className="font-medium text-slate-600">{tx.categoryName}</span>
                      <span>•</span>
                      <span>{tx.date}</span>
                      {tx.paymentMethod && (
                        <>
                          <span>•</span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-mono text-[10px]">
                            {tx.paymentMethod}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-sm font-bold ${
                      isExpense ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {isExpense ? '-' : '+'} {formatCurrency(tx.amount)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
