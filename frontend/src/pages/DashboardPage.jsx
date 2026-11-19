import React, { useState, useEffect } from 'react';
import { PlusCircle, RefreshCw, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { expenseService } from '../services/expenseService';
import { incomeService } from '../services/incomeService';
import { categoryService } from '../services/categoryService';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { IncomeExpenseChart } from '../components/dashboard/IncomeExpenseChart';
import { CategoryPieChart } from '../components/dashboard/CategoryPieChart';
import { SpendingTrendChart } from '../components/dashboard/SpendingTrendChart';
import { RecentTransactionsTable } from '../components/dashboard/RecentTransactionsTable';
import { BudgetWidget } from '../components/dashboard/BudgetWidget';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Modal } from '../components/common/Modal';

export const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Quick Action Modal States
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'UPI',
    categoryId: '',
  });
  const [incomeForm, setIncomeForm] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    categoryId: '',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchSummary = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load dashboard summary:', err);
      setError(err.response?.data?.message || 'Connecting to backend... If the backend was inactive, it may take a few moments to spin up.');
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const cats = await categoryService.getAll();
      setCategories(cats);
      // Set defaults if available
      const expCat = cats.find((c) => c.type === 'EXPENSE');
      if (expCat) setExpenseForm((prev) => ({ ...prev, categoryId: expCat.id }));
      const incCat = cats.find((c) => c.type === 'INCOME');
      if (incCat) setIncomeForm((prev) => ({ ...prev, categoryId: incCat.id }));
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchCategories();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSummary(false);
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      await expenseService.create({
        ...expenseForm,
        amount: parseFloat(expenseForm.amount),
        categoryId: parseInt(expenseForm.categoryId),
      });
      setExpenseModalOpen(false);
      setExpenseForm({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'UPI',
        categoryId: categories.find((c) => c.type === 'EXPENSE')?.id || '',
      });
      fetchSummary(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add expense');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleCreateIncome = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      await incomeService.create({
        ...incomeForm,
        amount: parseFloat(incomeForm.amount),
        categoryId: parseInt(incomeForm.categoryId),
      });
      setIncomeModalOpen(false);
      setIncomeForm({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        categoryId: categories.find((c) => c.type === 'INCOME')?.id || '',
      });
      fetchSummary(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add income');
    } finally {
      setFormSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Fetching real-time financial metrics..." fullHeight />;
  }

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');
  const incomeCategories = categories.filter((c) => c.type === 'INCOME');

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Financial Control Center</span>
          <h2 className="text-2xl font-extrabold tracking-tight mt-1">Smart Wealth & Expense Dashboard</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Live database-driven overview of your cashflow, budgets, category distribution and savings.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 relative z-10 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700"
            title="Refresh dashboard data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          <button
            onClick={() => setExpenseModalOpen(true)}
            className="flex items-center space-x-2 px-3.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-colors"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Add Expense</span>
          </button>

          <button
            onClick={() => setIncomeModalOpen(true)}
            className="flex items-center space-x-2 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-colors"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Add Income</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
          <p className="text-xs font-semibold text-amber-800">{error}</p>
          <button
            onClick={() => fetchSummary(true)}
            className="px-3 py-1 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <SummaryCards summary={summary} />

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <IncomeExpenseChart data={summary?.monthlyTrends || []} />
        </div>
        <div>
          <CategoryPieChart data={summary?.categoryBreakdown || []} />
        </div>
      </div>

      {/* Trends & Budgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SpendingTrendChart data={summary?.monthlyTrends || []} />
        </div>
        <div>
          <BudgetWidget budgets={summary?.budgetStatuses || []} />
        </div>
      </div>

      {/* Recent Transactions List */}
      <RecentTransactionsTable transactions={summary?.recentTransactions || []} />

      {/* Modal: Quick Add Expense */}
      <Modal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        title="Add New Expense Record"
      >
        <form onSubmit={handleCreateExpense} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description / Merchant</label>
            <input
              type="text"
              required
              placeholder="e.g., Grocery Shopping, Metro Transit"
              value={expenseForm.description}
              onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={expenseForm.date}
                onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                required
                value={expenseForm.categoryId}
                onChange={(e) => setExpenseForm({ ...expenseForm, categoryId: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {expenseCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
              <select
                value={expenseForm.paymentMethod}
                onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="UPI">UPI</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="DEBIT_CARD">Debit Card</option>
                <option value="NET_BANKING">Net Banking</option>
                <option value="CASH">Cash</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setExpenseModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              {formSubmitting ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Quick Add Income */}
      <Modal
        isOpen={incomeModalOpen}
        onClose={() => setIncomeModalOpen(false)}
        title="Add New Income Stream"
      >
        <form onSubmit={handleCreateIncome} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Source / Description</label>
            <input
              type="text"
              required
              placeholder="e.g., Monthly Salary, Freelance Gig"
              value={incomeForm.description}
              onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={incomeForm.amount}
                onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={incomeForm.date}
                onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Category / Income Source</label>
            <select
              required
              value={incomeForm.categoryId}
              onChange={(e) => setIncomeForm({ ...incomeForm, categoryId: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              {incomeCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIncomeModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              {formSubmitting ? 'Saving...' : 'Save Income'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
