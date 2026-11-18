package com.expensetracker.service;

import com.expensetracker.dto.*;
import com.expensetracker.entity.Expense;
import com.expensetracker.entity.Income;
import com.expensetracker.entity.User;
import com.expensetracker.repository.ExpenseRepository;
import com.expensetracker.repository.IncomeRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;
    private final BudgetService budgetService;
    private final UserService userService;

    public DashboardService(ExpenseRepository expenseRepository,
                            IncomeRepository incomeRepository,
                            BudgetService budgetService,
                            UserService userService) {
        this.expenseRepository = expenseRepository;
        this.incomeRepository = incomeRepository;
        this.budgetService = budgetService;
        this.userService = userService;
    }

    public DashboardSummaryResponse getDashboardSummary() {
        User user = userService.getCurrentAuthenticatedUser();
        LocalDate now = LocalDate.now();
        YearMonth currentYearMonth = YearMonth.from(now);
        LocalDate startOfMonth = currentYearMonth.atDay(1);
        LocalDate endOfMonth = currentYearMonth.atEndOfMonth();

        // Totals overall
        BigDecimal totalIncome = incomeRepository.sumTotalByUser(user);
        BigDecimal totalExpenses = expenseRepository.sumTotalByUser(user);
        BigDecimal totalBalance = totalIncome.subtract(totalExpenses);

        // Current Month
        BigDecimal monthIncome = incomeRepository.sumByUserAndDateBetween(user, startOfMonth, endOfMonth);
        BigDecimal monthExpenses = expenseRepository.sumByUserAndDateBetween(user, startOfMonth, endOfMonth);
        BigDecimal monthSavings = monthIncome.subtract(monthExpenses);

        double savingsPercentage = 0.0;
        if (monthIncome.compareTo(BigDecimal.ZERO) > 0) {
            savingsPercentage = monthSavings.divide(monthIncome, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue();
        }

        // Recent Transactions (Combined expenses and incomes)
        List<Expense> expenses = expenseRepository.findByUserOrderByDateDescCreatedAtDesc(user);
        List<Income> incomes = incomeRepository.findByUserOrderByDateDescCreatedAtDesc(user);

        List<RecentTransactionDto> recentList = new ArrayList<>();
        for (Expense e : expenses) {
            recentList.add(new RecentTransactionDto(
                    e.getId(),
                    "EXPENSE",
                    e.getDescription(),
                    e.getAmount(),
                    e.getDate(),
                    e.getCategory().getName(),
                    e.getCategory().getColor(),
                    e.getCategory().getIcon(),
                    e.getPaymentMethod()
            ));
        }
        for (Income i : incomes) {
            recentList.add(new RecentTransactionDto(
                    i.getId(),
                    "INCOME",
                    i.getDescription(),
                    i.getAmount(),
                    i.getDate(),
                    i.getCategory().getName(),
                    i.getCategory().getColor(),
                    i.getCategory().getIcon(),
                    null
            ));
        }

        // Sort descending by date
        recentList.sort((a, b) -> b.getDate().compareTo(a.getDate()));
        List<RecentTransactionDto> topRecent = recentList.stream().limit(8).collect(Collectors.toList());

        // Category Breakdown for current month
        List<CategorySpendingDto> categoryBreakdown = getCategorySpending(user, startOfMonth, endOfMonth, monthExpenses);

        // Monthly Trends (Past 6 months)
        List<MonthlyTrendDto> monthlyTrends = getMonthlyTrends(user, 6);

        // Active Budgets
        List<BudgetResponse> activeBudgets = budgetService.getBudgetsForMonth(now.getMonthValue(), now.getYear());

        DashboardSummaryResponse response = new DashboardSummaryResponse();
        response.setTotalBalance(totalBalance);
        response.setTotalIncome(totalIncome);
        response.setTotalExpenses(totalExpenses);
        response.setCurrentMonthIncome(monthIncome);
        response.setCurrentMonthExpenses(monthExpenses);
        response.setCurrentMonthSavings(monthSavings);
        response.setSavingsPercentage(Math.round(savingsPercentage * 10.0) / 10.0);
        response.setCurrency(user.getCurrency());
        response.setRecentTransactions(topRecent);
        response.setCategoryBreakdown(categoryBreakdown);
        response.setMonthlyTrends(monthlyTrends);
        response.setBudgetStatuses(activeBudgets);

        return response;
    }

    public List<CategorySpendingDto> getCategorySpending(User user, LocalDate startDate, LocalDate endDate, BigDecimal totalExpenses) {
        List<Object[]> rawList = expenseRepository.findCategorySpendingBreakdown(user, startDate, endDate);
        List<CategorySpendingDto> result = new ArrayList<>();

        BigDecimal total = (totalExpenses != null && totalExpenses.compareTo(BigDecimal.ZERO) > 0)
                ? totalExpenses : expenseRepository.sumByUserAndDateBetween(user, startDate, endDate);

        for (Object[] row : rawList) {
            Long categoryId = (Long) row[0];
            String name = (String) row[1];
            String color = (String) row[2];
            String icon = (String) row[3];
            BigDecimal amount = (BigDecimal) row[4];

            double percentage = 0.0;
            if (total.compareTo(BigDecimal.ZERO) > 0) {
                percentage = amount.divide(total, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).doubleValue();
            }

            result.add(new CategorySpendingDto(
                    categoryId,
                    name,
                    color,
                    icon,
                    amount,
                    Math.round(percentage * 10.0) / 10.0
            ));
        }

        return result;
    }

    public List<MonthlyTrendDto> getMonthlyTrends(User user, int monthsCount) {
        List<MonthlyTrendDto> trends = new ArrayList<>();
        YearMonth current = YearMonth.now();

        for (int i = monthsCount - 1; i >= 0; i--) {
            YearMonth ym = current.minusMonths(i);
            LocalDate start = ym.atDay(1);
            LocalDate end = ym.atEndOfMonth();

            BigDecimal inc = incomeRepository.sumByUserAndDateBetween(user, start, end);
            BigDecimal exp = expenseRepository.sumByUserAndDateBetween(user, start, end);
            BigDecimal sav = inc.subtract(exp);

            String monthName = ym.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);

            trends.add(new MonthlyTrendDto(
                    monthName + " " + ym.getYear(),
                    ym.getMonthValue(),
                    ym.getYear(),
                    inc,
                    exp,
                    sav
            ));
        }

        return trends;
    }

    public Map<String, Object> getAnalytics(String timeframe, LocalDate customStart, LocalDate customEnd) {
        User user = userService.getCurrentAuthenticatedUser();
        LocalDate now = LocalDate.now();
        LocalDate startDate;
        LocalDate endDate = now;

        if ("WEEKLY".equalsIgnoreCase(timeframe)) {
            startDate = now.minusDays(7);
        } else if ("YEARLY".equalsIgnoreCase(timeframe)) {
            startDate = now.withDayOfYear(1);
        } else if ("CUSTOM".equalsIgnoreCase(timeframe) && customStart != null && customEnd != null) {
            startDate = customStart;
            endDate = customEnd;
        } else {
            // Default MONTHLY
            startDate = now.withDayOfMonth(1);
        }

        BigDecimal income = incomeRepository.sumByUserAndDateBetween(user, startDate, endDate);
        BigDecimal expense = expenseRepository.sumByUserAndDateBetween(user, startDate, endDate);
        BigDecimal savings = income.subtract(expense);

        double savingsRate = 0.0;
        if (income.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = savings.divide(income, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue();
        }

        List<CategorySpendingDto> categories = getCategorySpending(user, startDate, endDate, expense);
        List<MonthlyTrendDto> trends = getMonthlyTrends(user, 12);

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("timeframe", timeframe != null ? timeframe.toUpperCase() : "MONTHLY");
        analytics.put("startDate", startDate);
        analytics.put("endDate", endDate);
        analytics.put("totalIncome", income);
        analytics.put("totalExpense", expense);
        analytics.put("netSavings", savings);
        analytics.put("savingsRate", Math.round(savingsRate * 10.0) / 10.0);
        analytics.put("categoryBreakdown", categories);
        analytics.put("monthlyTrends", trends);
        analytics.put("currency", user.getCurrency());

        return analytics;
    }
}
