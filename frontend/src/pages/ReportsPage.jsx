import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { reportService } from '../services/reportService';
import { categoryService } from '../services/categoryService';
import { useAuth } from '../context/AuthContext';

export const ReportsPage = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Form params
  const [type, setType] = useState('ALL');
  const [categoryId, setCategoryId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  React.useEffect(() => {
    categoryService.getAll().then((data) => setCategories(data)).catch(console.error);
  }, []);

  const handleDownload = async (e) => {
    e.preventDefault();
    setDownloading(true);
    setDownloadSuccess(false);

    try {
      await reportService.downloadCsv({
        type: type !== 'ALL' ? type : undefined,
        categoryId: categoryId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      alert('Failed to generate report: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800">Financial Reports & Data Exports</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Generate audit-compliant, spreadsheet-ready CSV statements for tax, accounting, and personal archiving
        </p>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-card">
        <div className="flex items-center space-x-3 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">CSV Export Configuration</h3>
            <p className="text-xs text-slate-400">Custom filter criteria for your data extract</p>
          </div>
        </div>

        <form onSubmit={handleDownload} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Statement Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="ALL">Combined Ledger (Expenses & Income)</option>
                <option value="EXPENSE">Expense Statement Only</option>
                <option value="INCOME">Income Streams Statement Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Category Filter (Optional)</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Date Range From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Date Range To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start space-x-3 text-xs text-slate-600">
            <FileText className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800">CSV Export Specifications:</p>
              <p className="text-slate-500 mt-0.5">
                Included columns: ID, Date, Transaction Type, Description, Category, Payment Method, Amount, and Currency ({user?.currency || 'INR'}). Standard UTF-8 encoding.
              </p>
            </div>
          </div>

          {downloadSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Report file generated and downloaded successfully!</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={downloading}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              {downloading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Report Statement (.CSV)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
