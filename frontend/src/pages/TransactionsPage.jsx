import React, { useState, useEffect } from 'react';
import {
  ArrowLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Filter,
  FileSpreadsheet,
  RotateCcw,
} from 'lucide-react';
import { expenseService } from '../services/expenseService';
import { incomeService } from '../services/incomeService';
import { categoryService } from '../services/categoryService';
import { reportService } from '../services/reportService';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export const TransactionsPage = () => {
  const { formatCurrency } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState('ALL'); // ALL, EXPENSE, INCOME
  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Load categories once on mount
  useEffect(() => {
    categoryService.getAll().then(setCategories).catch(console.error);
  }, []);

  const loadData = async (kw = keyword) => {
    setLoading(true);
    setError(null);
    try {
      const filterParams = {
        keyword: kw || undefined,
        categoryId: categoryId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      let expData = [];
      let incData = [];

      if (typeFilter === 'ALL') {
        const [expenses, incomes] = await Promise.all([
          expenseService.filter(filterParams),
          incomeService.filter(filterParams),
        ]);
        expData = expenses;
        incData = incomes;
      } else if (typeFilter === 'EXPENSE') {
        expData = await expenseService.filter(filterParams);
      } else if (typeFilter === 'INCOME') {
        incData = await incomeService.filter(filterParams);
      }

      let combined = [];
      if (expData && expData.length > 0) {
        combined = combined.concat(
          expData.map((e) => ({
            ...e,
            type: 'EXPENSE',
          }))
        );
      }
      if (incData && incData.length > 0) {
        combined = combined.concat(
          incData.map((i) => ({
            ...i,
            type: 'INCOME',
            paymentMethod: 'N/A',
          }))
        );
      }

      combined.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(combined);
    } catch (err) {
      console.error('Failed to load transactions:', err);
      setError(err.response?.data?.message || 'Failed to connect to backend. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [typeFilter, categoryId, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleResetFilters = () => {
    setTypeFilter('ALL');
    setKeyword('');
    setCategoryId('');
    setStartDate('');
    setEndDate('');
    loadData('');
  };

  const handleExportCsv = async () => {
    try {
      await reportService.downloadCsv({
        type: typeFilter,
        categoryId: categoryId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
    } catch (err) {
      alert('Failed to export CSV: ' + err.message);
    }
  };

  // Compute totals for current filtered view
  const totalInflow = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalOutflow = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Master Transactions Ledger</h2>
          <p className="text-xs text-slate-400 mt-0.5">Comprehensive audit trail of all inflows and outflows</p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Export to CSV</span>
        </button>
      </div>

      {/* Summary Mini Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card">
          <p className="text-xs font-semibold text-slate-400 uppercase">Filtered Outflow</p>
          <p className="text-xl font-bold text-rose-600 mt-1">- {formatCurrency(totalOutflow)}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card">
          <p className="text-xs font-semibold text-slate-400 uppercase">Filtered Inflow</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">+ {formatCurrency(totalInflow)}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card">
          <p className="text-xs font-semibold text-slate-400 uppercase">Total Records</p>
          <p className="text-xl font-bold text-slate-800 mt-1">{transactions.length} entries</p>
        </div>
      </div>

      {/* Filters Box */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card space-y-4">
        {/* Top filter tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="inline-flex p-1 bg-slate-100 rounded-xl">
            {['ALL', 'EXPENSE', 'INCOME'].map((tab) => (
              <button
                key={tab}
                onClick={() => setTypeFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  typeFilter === tab
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab === 'ALL' ? 'All Activity' : tab === 'EXPENSE' ? 'Expenses Only' : 'Income Only'}
              </button>
            ))}
          </div>

          <button
            onClick={handleResetFilters}
            className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 py-1 px-2.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>

        {/* Filter controls row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search description..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </form>

          {/* Category Dropdown */}
          <div>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="Start Date"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700"
            />
          </div>

          {/* End Date */}
          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="End Date"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700"
            />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading transactions ledger..." />
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm font-semibold text-rose-600 mb-2">{error}</p>
            <button
              onClick={() => loadData()}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState
            title="No transactions match your criteria"
            description="Try clearing search filters or add a new transaction."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-6">Transaction</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-6 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx, idx) => {
                  const isExp = tx.type === 'EXPENSE';
                  return (
                    <tr key={`${tx.type}-${tx.id}-${idx}`} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isExp ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                            }`}
                          >
                            {isExp ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{tx.description}</p>
                            <span className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              isExp ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                            }`}>
                              {tx.type}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-600">
                        <span className="flex items-center space-x-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: tx.categoryColor || '#10b981' }}
                          ></span>
                          <span>{tx.categoryName}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{tx.date}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
                          {tx.paymentMethod || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right font-bold text-sm">
                        <span className={isExp ? 'text-rose-600' : 'text-emerald-600'}>
                          {isExp ? '-' : '+'} {formatCurrency(tx.amount)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
