import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Calendar,
  RotateCcw,
} from 'lucide-react';
import { incomeService } from '../services/incomeService';
import { categoryService } from '../services/categoryService';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';

export const IncomePage = () => {
  const { formatCurrency } = useAuth();
  const [incomes, setIncomes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal & Form States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    categoryId: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadIncomes = async () => {
    setLoading(true);
    try {
      const data = await incomeService.filter({
        keyword,
        categoryId: categoryId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setIncomes(data);
    } catch (err) {
      console.error('Failed to load income:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await categoryService.getByType('INCOME');
      setCategories(cats);
      if (cats.length > 0 && !formData.categoryId) {
        setFormData((prev) => ({ ...prev, categoryId: cats[0].id }));
      }
    } catch (err) {
      console.error('Failed to load income categories:', err);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadIncomes();
  }, [categoryId, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadIncomes();
  };

  const handleResetFilters = () => {
    setKeyword('');
    setCategoryId('');
    setStartDate('');
    setEndDate('');
  };

  const openAddModal = () => {
    setEditingIncome(null);
    setFormData({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      categoryId: categories[0]?.id || '',
    });
    setModalOpen(true);
  };

  const openEditModal = (income) => {
    setEditingIncome(income);
    setFormData({
      description: income.description,
      amount: income.amount,
      date: income.date,
      categoryId: income.categoryId,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        categoryId: parseInt(formData.categoryId),
      };

      if (editingIncome) {
        await incomeService.update(editingIncome.id, payload);
      } else {
        await incomeService.create(payload);
      }
      setModalOpen(false);
      loadIncomes();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save income record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, description) => {
    if (window.confirm(`Are you sure you want to delete "${description}"?`)) {
      try {
        await incomeService.delete(id);
        loadIncomes();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete income record');
      }
    }
  };

  const totalIncome = incomes.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const averageIncome = incomes.length > 0 ? totalIncome / incomes.length : 0;

  return (
    <div className="space-y-6">
      {/* Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Income Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">Track your salaries, freelance earnings, investments, and capital inflows</p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Income</span>
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Filtered Inflow</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Income Streams</p>
          <p className="text-2xl font-extrabold text-slate-800 mt-1">{incomes.length} deposits</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Deposit</p>
          <p className="text-2xl font-extrabold text-slate-800 mt-1">{formatCurrency(averageIncome)}</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Search & Filter Income</span>
          </span>
          <button
            onClick={handleResetFilters}
            className="flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800 font-medium"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search description..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </form>

          {/* Category Filter */}
          <div>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700"
            >
              <option value="">All Income Sources</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Date from */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="From date"
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700"
            />
          </div>

          {/* Date to */}
          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="To date"
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700"
            />
          </div>
        </div>
      </div>

      {/* Income Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Retrieving income records..." />
        ) : incomes.length === 0 ? (
          <EmptyState
            title="No income records found"
            description="Record your salary or client payments to begin tracking cashflow."
            actionText="Record First Income"
            onAction={openAddModal}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-6">Source / Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incomes.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-slate-800">
                      {inc.description}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="flex items-center space-x-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: inc.categoryColor || '#10b981' }}
                        ></span>
                        <span className="font-medium text-slate-700">{inc.categoryName}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {inc.date}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-600 text-sm">
                      + {formatCurrency(inc.amount)}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => openEditModal(inc)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Income"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(inc.id, inc.description)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Income"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add/Edit Income */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingIncome ? 'Edit Income Stream' : 'Record New Income Stream'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Source / Description</label>
            <input
              type="text"
              required
              placeholder="e.g., Monthly Tech Salary, Consulting Client"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Income Category / Source</label>
            <select
              required
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
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
              {submitting ? 'Saving...' : editingIncome ? 'Update Income' : 'Save Income'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
