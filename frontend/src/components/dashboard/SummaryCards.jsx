import React from 'react';
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { useAuth } from '../../context/AuthContext';

export const SummaryCards = ({ summary }) => {
  const { formatCurrency } = useAuth();

  const balance = summary?.totalBalance || 0;
  const isPositiveBalance = balance >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <StatCard
        title="Total Net Balance"
        value={formatCurrency(balance)}
        subtitle="All-time net liquid balance"
        icon={Wallet}
        color={isPositiveBalance ? 'emerald' : 'rose'}
        badge="Live"
      />

      <StatCard
        title="Total Inflow"
        value={formatCurrency(summary?.totalIncome || 0)}
        subtitle={`Current Month: ${formatCurrency(summary?.currentMonthIncome || 0)}`}
        icon={TrendingUp}
        color="emerald"
        trend={{ positive: true, value: 'Active Streams' }}
      />

      <StatCard
        title="Total Expenses"
        value={formatCurrency(summary?.totalExpenses || 0)}
        subtitle={`Current Month: ${formatCurrency(summary?.currentMonthExpenses || 0)}`}
        icon={TrendingDown}
        color="rose"
        trend={{ positive: false, value: 'Total Outflow' }}
      />

      <StatCard
        title="Monthly Savings"
        value={formatCurrency(summary?.currentMonthSavings || 0)}
        subtitle={`Savings Rate: ${summary?.savingsPercentage || 0}% this month`}
        icon={PiggyBank}
        color={summary?.currentMonthSavings >= 0 ? 'purple' : 'rose'}
        badge={`${summary?.savingsPercentage || 0}%`}
      />
    </div>
  );
};
