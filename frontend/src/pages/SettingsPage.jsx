import React, { useState } from 'react';
import {
  Settings,
  Coins,
  Palette,
  Database,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsPage = () => {
  const { user, updateProfile } = useAuth();
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [theme, setTheme] = useState('light');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await updateProfile(user?.fullName || '', currency);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Failed to update settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800">Preferences & Application Settings</h2>
        <p className="text-xs text-slate-400 mt-0.5">Customize your financial dashboard appearance, currency formats, and data rules</p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Currency selection card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Default Currency Configuration</h3>
              <p className="text-xs text-slate-400">All ledger amounts and reports format with this currency symbol</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { code: 'INR', symbol: '₹', name: 'Indian Rupee (Default)' },
              { code: 'USD', symbol: '$', name: 'US Dollar' },
              { code: 'EUR', symbol: '€', name: 'Euro' },
              { code: 'GBP', symbol: '£', name: 'British Pound' },
              { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
              { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
            ].map((cur) => (
              <label
                key={cur.code}
                className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                  currency === cur.code
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-800 font-bold text-sm flex items-center justify-center">
                    {cur.symbol}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{cur.code}</p>
                    <p className="text-[10px] text-slate-400">{cur.name}</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="currency"
                  value={cur.code}
                  checked={currency === cur.code}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="accent-emerald-600"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Theme Preference */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Dashboard Theme</h3>
              <p className="text-xs text-slate-400">Select your preferred user interface color scheme</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label
              className={`p-4 rounded-2xl border cursor-pointer flex items-center space-x-3 transition-all ${
                theme === 'light'
                  ? 'border-emerald-500 bg-emerald-50/30 shadow-sm'
                  : 'border-slate-200'
              }`}
            >
              <input
                type="radio"
                name="theme"
                value="light"
                checked={theme === 'light'}
                onChange={() => setTheme('light')}
                className="accent-emerald-600"
              />
              <div>
                <p className="text-xs font-bold text-slate-800">Modern SaaS Theme (Recommended)</p>
                <p className="text-[11px] text-slate-500">Dark Navy sidebar, light content canvas, emerald accents</p>
              </div>
            </label>

            <label
              className={`p-4 rounded-2xl border cursor-pointer flex items-center space-x-3 transition-all ${
                theme === 'dark'
                  ? 'border-emerald-500 bg-emerald-50/30 shadow-sm'
                  : 'border-slate-200'
              }`}
            >
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={theme === 'dark'}
                onChange={() => setTheme('dark')}
                className="accent-emerald-600"
              />
              <div>
                <p className="text-xs font-bold text-slate-800">High Contrast Navy</p>
                <p className="text-[11px] text-slate-500">Deep slate card headers, darker background tones</p>
              </div>
            </label>
          </div>
        </div>

        {/* System Architecture Information Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Database & Security Architecture</h3>
              <p className="text-xs text-slate-400">Zero data-loss local storage & enterprise isolation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-700 block mb-0.5">Database Engine</span>
              <span className="text-slate-500">H2 File-based Persistent Storage (Ready for MySQL)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-700 block mb-0.5">Persistence Status</span>
              <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active (Survives application restarts)</span>
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-700 block mb-0.5">Authentication Protocol</span>
              <span className="text-slate-500">Stateless JWT + BCrypt Password Encryption</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-700 block mb-0.5">Data Isolation</span>
              <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Strict User-Specific Foreign Key Ownership</span>
              </span>
            </div>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving Preferences...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
