package com.expensetracker.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardSummaryResponse {
    private BigDecimal totalBalance;
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal currentMonthIncome;
    private BigDecimal currentMonthExpenses;
    private BigDecimal currentMonthSavings;
    private double savingsPercentage;
    private String currency;
    private List<RecentTransactionDto> recentTransactions;
    private List<CategorySpendingDto> categoryBreakdown;
    private List<MonthlyTrendDto> monthlyTrends;
    private List<BudgetResponse> budgetStatuses;

    public DashboardSummaryResponse() {}

    public BigDecimal getTotalBalance() { return totalBalance; }
    public void setTotalBalance(BigDecimal totalBalance) { this.totalBalance = totalBalance; }

    public BigDecimal getTotalIncome() { return totalIncome; }
    public void setTotalIncome(BigDecimal totalIncome) { this.totalIncome = totalIncome; }

    public BigDecimal getTotalExpenses() { return totalExpenses; }
    public void setTotalExpenses(BigDecimal totalExpenses) { this.totalExpenses = totalExpenses; }

    public BigDecimal getCurrentMonthIncome() { return currentMonthIncome; }
    public void setCurrentMonthIncome(BigDecimal currentMonthIncome) { this.currentMonthIncome = currentMonthIncome; }

    public BigDecimal getCurrentMonthExpenses() { return currentMonthExpenses; }
    public void setCurrentMonthExpenses(BigDecimal currentMonthExpenses) { this.currentMonthExpenses = currentMonthExpenses; }

    public BigDecimal getCurrentMonthSavings() { return currentMonthSavings; }
    public void setCurrentMonthSavings(BigDecimal currentMonthSavings) { this.currentMonthSavings = currentMonthSavings; }

    public double getSavingsPercentage() { return savingsPercentage; }
    public void setSavingsPercentage(double savingsPercentage) { this.savingsPercentage = savingsPercentage; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public List<RecentTransactionDto> getRecentTransactions() { return recentTransactions; }
    public void setRecentTransactions(List<RecentTransactionDto> recentTransactions) { this.recentTransactions = recentTransactions; }

    public List<CategorySpendingDto> getCategoryBreakdown() { return categoryBreakdown; }
    public void setCategoryBreakdown(List<CategorySpendingDto> categoryBreakdown) { this.categoryBreakdown = categoryBreakdown; }

    public List<MonthlyTrendDto> getMonthlyTrends() { return monthlyTrends; }
    public void setMonthlyTrends(List<MonthlyTrendDto> monthlyTrends) { this.monthlyTrends = monthlyTrends; }

    public List<BudgetResponse> getBudgetStatuses() { return budgetStatuses; }
    public void setBudgetStatuses(List<BudgetResponse> budgetStatuses) { this.budgetStatuses = budgetStatuses; }
}
