import React, { useState, useEffect } from 'react';
import {
  Tags,
  Plus,
  Lock,
  Edit2,
  Trash2,
  Check,
} from 'lucide-react';
import { categoryService } from '../services/categoryService';
import { DynamicIcon } from '../components/common/DynamicIcon';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Modal } from '../components/common/Modal';

export const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL'); // ALL, EXPENSE, INCOME

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'EXPENSE',
    color: '#10b981',
    icon: 'Tag',
  });
  const [submitting, setSubmitting] = useState(false);

  const colorPalette = [
    '#10b981', '#059669', '#3b82f6', '#2563eb', '#6366f1',
    '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e', '#ef4444',
    '#f97316', '#f59e0b', '#06b6d4', '#14b8a6', '#64748b',
  ];

  const iconOptions = [
    'Tag', 'UtensilsCrossed', 'ShoppingBag', 'Car', 'GraduationCap',
    'HeartPulse', 'Film', 'Receipt', 'Plane', 'User', 'Briefcase',
    'Laptop', 'TrendingUp', 'Building2', 'Gift', 'Coins', 'Home', 'Coffee'
  ];

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      type: 'EXPENSE',
      color: '#10b981',
      icon: 'Tag',
    });
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      type: cat.type,
      color: cat.color || '#10b981',
      icon: cat.icon || 'Tag',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCategory) {
        await categoryService.update(editingCategory.id, formData);
      } else {
        await categoryService.create(formData);
      }
      setModalOpen(false);
      loadCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete custom category "${name}"?`)) {
      try {
        await categoryService.delete(id);
        loadCategories();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete category');
      }
    }
  };

  const filtered = categories.filter((c) => {
    if (filterType === 'ALL') return true;
    return c.type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Categories Architecture</h2>
          <p className="text-xs text-slate-400 mt-0.5">Organize transactions into system default and personalized custom categories</p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Custom Category</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        {['ALL', 'EXPENSE', 'INCOME'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterType(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterType === tab
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            {tab === 'ALL' ? 'All Categories' : tab === 'EXPENSE' ? 'Expense Categories' : 'Income Categories'}
          </button>
        ))}
      </div>

      {/* Grid of Categories */}
      {loading ? (
        <LoadingSpinner text="Loading category registry..." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((cat) => (
            <div
              key={cat.id}
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover transition-all flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                  style={{ backgroundColor: cat.color || '#10b981' }}
                >
                  <DynamicIcon name={cat.icon} className="w-5 h-5 text-white" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-sm font-bold text-slate-800 truncate">{cat.name}</h4>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      cat.type === 'EXPENSE' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {cat.type}
                    </span>
                    {cat.default && (
                      <span className="text-[10px] font-semibold text-slate-400 flex items-center space-x-0.5">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Default</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {!cat.default && (
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Custom Category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Custom Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add/Edit Custom Category */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Custom Category' : 'Create Custom Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Category Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Freelance Client, Gym, Subscriptions"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Category Classification</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="EXPENSE">Expense Category (Outflow)</option>
              <option value="INCOME">Income Category (Inflow)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Color Accent</label>
            <div className="flex flex-wrap gap-2">
              {colorPalette.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: col })}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                  style={{ backgroundColor: col }}
                >
                  {formData.color === col && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Icon</label>
            <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
              {iconOptions.map((iconName) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: iconName })}
                  className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                    formData.icon === iconName
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                  title={iconName}
                >
                  <DynamicIcon name={iconName} className="w-4 h-4" />
                </button>
              ))}
            </div>
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
              {submitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Save Category'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
