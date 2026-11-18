import React, { useState, useEffect } from 'react';
import {
  PieChart as PieIcon,
  Plus,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit2,
  Calendar,
} from 'lucide-react';
import { budgetService } from '../services/budgetService';
import { categoryService } from '../services/categoryService';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';

export const BudgetsPage = () => {
  const { formatCurrency } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Month & Year selection
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Modal & Form
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
    amount: '',
    categoryId: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const monthsList = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' },
  ];

  const loadBudgets = async () => {
    setLoading(true);
    try {
      const data = await budgetService.getByMonth(selectedMonth, selectedYear);
      setBudgets(data);
    } catch (err) {
      console.error('Failed to load budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await categoryService.getByType('EXPENSE');
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadBudgets();
  }, [selectedMonth, selectedYear]);

  const openAddModal = () => {
    setEditingBudget(null);
    setFormData({
      month: selectedMonth,
      year: selectedYear,
      amount: '',
      categoryId: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (budget) => {
    setEditingBudget(budget);
    setFormData({
      month: budget.month,
      year: budget.year,
      amount: budget.amount,
      categoryId: budget.categoryId || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        amount: parseFloat(formData.amount),
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
      };

      if (editingBudget) {
        await budgetService.update(editingBudget.id, payload);
      } else {
        await budgetService.create(payload);
      }
      setModalOpen(false);
      loadBudgets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save budget plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete budget for "${name}"?`)) {
      try {
        await budgetService.delete(id);
        loadBudgets();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete budget');
      }
    }
  };

  const totalAllocated = budgets.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalSpent = budgets.reduce((acc, curr) => acc + Number(curr.spentAmount || 0), 0);
  const exceededCount = budgets.filter((b) => b.isExceeded).length;
  const warningCount = budgets.filter((b) => b.isWarning).length;

  return (
    <div className="space-y-6">
      {/* Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Budget Management & Limits</h2>
          <p className="text-xs text-slate-400 mt-0.5">Define spending caps, monitor progress, and receive smart alerts</p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Budget</span>
        </button>
      </div>

      {/* Month / Year Selector & Status Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-emerald-600" />
          <div className="flex items-center space-x-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {monthsList.map((m) => (
                <option key={m.value} value={m.value}>{m.name}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {[2024, 2025, 2026, 2027].map((yr) => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
            Allocated: {formatCurrency(totalAllocated)}
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
            Spent: {formatCurrency(totalSpent)}
          </span>
          {warningCount > 0 && (
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold flex items-center space-x-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{warningCount} Near Limit (80%)</span>
            </span>
          )}
          {exceededCount > 0 && (
            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{exceededCount} Exceeded!</span>
            </span>
          )}
        </div>
      </div>

      {/* Budgets Grid */}
      {loading ? (
        <LoadingSpinner text="Computing budget limits and spending totals..." />
      ) : budgets.length === 0 ? (
        <EmptyState
          title="No budgets set for this month"
          description="Create category or overall monthly spending limits to prevent overspending."
          actionText="Create First Budget"
          onAction={openAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((b) => {
            const pct = Math.min(b.percentageSpent || 0, 100);
            let barColor = 'bg-emerald-500';
            let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            let statusText = 'Safe';
            let Icon = CheckCircle2;

            if (b.isExceeded) {
              barColor = 'bg-rose-500';
              badgeBg = 'bg-rose-50 text-rose-700 border-rose-200';
              statusText = 'Limit Exceeded';
              Icon = AlertCircle;
            } else if (b.isWarning) {
              barColor = 'bg-amber-500';
              badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
              statusText = '80% Warning';
              Icon = AlertTriangle;
            }

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: b.categoryColor || '#0f172a' }}
                      ></span>
                      <span>{b.categoryName}</span>
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center space-x-1 ${badgeBg}`}>
                      <Icon className="w-3 h-3" />
                      <span>{statusText}</span>
                    </span>
                  </div>

                  <div className="my-4">
                    <div className="flex items-baseline justify-between text-xs mb-1.5">
                      <span className="font-extrabold text-xl text-slate-800">
                        {formatCurrency(b.spentAmount)}
                      </span>
                      <span className="text-slate-400 font-medium">
                        of {formatCurrency(b.amount)}
                      </span>
                    </div>

                    {/* Progress track */}
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between mt-2 text-[11px] font-semibold text-slate-500">
                      <span>{b.percentageSpent}% utilized</span>
                      <span>
                        {b.remainingAmount >= 0
                          ? `Remaining: ${formatCurrency(b.remainingAmount)}`
                          : `Overspent: ${formatCurrency(Math.abs(b.remainingAmount))}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {monthsList.find((m) => m.value === b.month)?.name} {b.year}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditModal(b)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Budget"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id, b.categoryName)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Budget"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add/Edit Budget */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBudget ? 'Update Budget Plan' : 'Define New Budget Allocation'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Month</label>
              <select
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {monthsList.map((m) => (
                  <option key={m.value} value={m.value}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Year</label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {[2024, 2025, 2026, 2027].map((yr) => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Category Scope (Leave empty for Overall Monthly Budget)
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="">Total Overall Monthly Budget</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Budget Limit Amount</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="e.g. 15000.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              {submitting ? 'Saving...' : editingBudget ? 'Update Budget' : 'Save Budget'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
