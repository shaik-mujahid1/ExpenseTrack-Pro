import React from 'react';
import { Menu, Bell, Search, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';

export const Navbar = ({ onOpenSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = (path) => {
    switch (path) {
      case '/dashboard': return 'Dashboard Overview';
      case '/transactions': return 'All Transactions';
      case '/expenses': return 'Expense Tracker';
      case '/income': return 'Income Streams';
      case '/budgets': return 'Budget Management';
      case '/categories': return 'Categories';
      case '/analytics': return 'Analytics & Insights';
      case '/reports': return 'Financial Reports';
      case '/settings': return 'System Settings';
      case '/profile': return 'My Profile';
      default: return 'Expense Tracker';
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 sm:px-8">
      {/* Left side: Hamburger button + Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-800 leading-tight">
            {getPageTitle(location.pathname)}
          </h1>
          <p className="text-[11px] font-medium text-slate-400 hidden sm:block">
            {currentDate}
          </p>
        </div>
      </div>

      {/* Right side: Currency badge + User status */}
      <div className="flex items-center space-x-4">
        {/* Currency badge */}
        <div className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-xs font-semibold text-emerald-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Currency: {user?.currency || 'INR'}</span>
        </div>

        {/* User quick profile pill */}
        <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-emerald-400 text-xs font-bold flex items-center justify-center">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <span className="text-xs font-semibold text-slate-700">{user?.fullName?.split(' ')[0]}</span>
        </div>
      </div>
    </header>
  );
};
