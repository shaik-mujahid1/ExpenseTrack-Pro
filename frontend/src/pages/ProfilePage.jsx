import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Lock,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile Form
  const [fullName, setFullName] = useState('');
  const [profileUpdating, setProfileUpdating] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await authService.getProfile();
      setProfile(data);
      setFullName(data.fullName);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileUpdating(true);
    setProfileSuccess(false);

    try {
      await updateProfile(fullName, profile?.currency || 'INR');
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      alert('Failed to update profile: ' + err.message);
    } finally {
      setProfileUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match');
      return;
    }

    setPasswordUpdating(true);

    try {
      await authService.changePassword(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Current password incorrect');
    } finally {
      setPasswordUpdating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving authenticated profile security token..." fullHeight />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800">User Profile & Security</h2>
        <p className="text-xs text-slate-400 mt-0.5">Manage your credentials, personal identity, and security keys</p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            {profile?.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="text-xl font-extrabold">{profile?.fullName}</h3>
            <p className="text-xs text-slate-300 mt-0.5 flex items-center space-x-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{profile?.email}</span>
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {profile?.role || 'ROLE_USER'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Currency: {profile?.currency || 'INR'}
              </span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-400 sm:text-right flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
          <span>Account Member Since</span>
          <span className="font-mono text-slate-300 font-medium sm:mt-1">
            {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Active'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details Form */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Personal Identity</h4>
              <p className="text-xs text-slate-400">Update your visible name</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={profile?.email || ''}
                className="w-full px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Email is uniquely bound to your user record and isolated.</span>
            </div>

            {profileSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            <button
              type="submit"
              disabled={profileUpdating}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
            >
              {profileUpdating ? 'Saving...' : 'Update Details'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Security & Password</h4>
              <p className="text-xs text-slate-400">Rotate BCrypt encrypted credentials</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Password (min 6 chars)</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
              />
            </div>

            {passwordError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Password changed successfully!</span>
              </div>
            )}

            <button
              type="submit"
              disabled={passwordUpdating}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-colors disabled:opacity-50"
            >
              {passwordUpdating ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
