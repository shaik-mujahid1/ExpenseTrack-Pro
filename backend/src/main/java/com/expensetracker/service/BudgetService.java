package com.expensetracker.service;

import com.expensetracker.dto.BudgetRequest;
import com.expensetracker.dto.BudgetResponse;
import com.expensetracker.entity.Budget;
import com.expensetracker.entity.Category;
import com.expensetracker.entity.User;
import com.expensetracker.repository.BudgetRepository;
import com.expensetracker.repository.ExpenseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final ExpenseRepository expenseRepository;
    private final CategoryService categoryService;
    private final UserService userService;

    public BudgetService(BudgetRepository budgetRepository,
                         ExpenseRepository expenseRepository,
                         CategoryService categoryService,
                         UserService userService) {
        this.budgetRepository = budgetRepository;
        this.expenseRepository = expenseRepository;
        this.categoryService = categoryService;
        this.userService = userService;
    }

    public List<BudgetResponse> getBudgetsForMonth(Integer month, Integer year) {
        User user = userService.getCurrentAuthenticatedUser();
        LocalDate now = LocalDate.now();
        int targetMonth = (month != null) ? month : now.getMonthValue();
        int targetYear = (year != null) ? year : now.getYear();

        List<Budget> budgets = budgetRepository.findByUserAndMonthAndYear(user, targetMonth, targetYear);
        return budgets.stream()
                .map(b -> mapToResponse(b, user))
                .collect(Collectors.toList());
    }

    public List<BudgetResponse> getAllBudgets() {
        User user = userService.getCurrentAuthenticatedUser();
        return budgetRepository.findByUserOrderByYearDescMonthDesc(user).stream()
                .map(b -> mapToResponse(b, user))
                .collect(Collectors.toList());
    }

    @Transactional
    public BudgetResponse createBudget(BudgetRequest request) {
        User user = userService.getCurrentAuthenticatedUser();
        Category category = null;

        if (request.getCategoryId() != null) {
            category = categoryService.getCategoryEntity(request.getCategoryId(), user);
            Optional<Budget> existing = budgetRepository.findByUserAndMonthAndYearAndCategory(
                    user, request.getMonth(), request.getYear(), category);
            if (existing.isPresent()) {
                throw new IllegalArgumentException("A budget for this category and month already exists. Please edit it instead.");
            }
        } else {
            Optional<Budget> existing = budgetRepository.findByUserAndMonthAndYearAndCategoryIsNull(
                    user, request.getMonth(), request.getYear());
            if (existing.isPresent()) {
                throw new IllegalArgumentException("An overall monthly budget already exists for this period. Please edit it instead.");
            }
        }

        Budget budget = new Budget(
                request.getMonth(),
                request.getYear(),
                request.getAmount(),
                category,
                user
        );

        budget = budgetRepository.save(budget);
        return mapToResponse(budget, user);
    }

    @Transactional
    public BudgetResponse updateBudget(Long id, BudgetRequest request) {
        User user = userService.getCurrentAuthenticatedUser();
        Budget budget = budgetRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Budget not found or access denied"));

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryService.getCategoryEntity(request.getCategoryId(), user);
        }

        budget.setMonth(request.getMonth());
        budget.setYear(request.getYear());
        budget.setAmount(request.getAmount());
        budget.setCategory(category);

        budget = budgetRepository.save(budget);
        return mapToResponse(budget, user);
    }

    @Transactional
    public void deleteBudget(Long id) {
        User user = userService.getCurrentAuthenticatedUser();
        Budget budget = budgetRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Budget not found or access denied"));

        budgetRepository.delete(budget);
    }

    public BudgetResponse mapToResponse(Budget budget, User user) {
        YearMonth ym = YearMonth.of(budget.getYear(), budget.getMonth());
        LocalDate startDate = ym.atDay(1);
        LocalDate endDate = ym.atEndOfMonth();

        BigDecimal spentAmount;
        if (budget.getCategory() != null) {
            spentAmount = expenseRepository.sumByUserAndCategoryAndDateBetween(
                    user, budget.getCategory(), startDate, endDate);
        } else {
            spentAmount = expenseRepository.sumByUserAndDateBetween(user, startDate, endDate);
        }

        if (spentAmount == null) {
            spentAmount = BigDecimal.ZERO;
        }

        BigDecimal remainingAmount = budget.getAmount().subtract(spentAmount);
        double percentage = 0.0;
        if (budget.getAmount().compareTo(BigDecimal.ZERO) > 0) {
            percentage = spentAmount.divide(budget.getAmount(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue();
        }

        boolean isWarning = percentage >= 80.0 && percentage <= 100.0;
        boolean isExceeded = percentage > 100.0;

        return new BudgetResponse(
                budget.getId(),
                budget.getMonth(),
                budget.getYear(),
                budget.getAmount(),
                budget.getCategory() != null ? budget.getCategory().getId() : null,
                budget.getCategory() != null ? budget.getCategory().getName() : "Total Monthly Budget",
                budget.getCategory() != null ? budget.getCategory().getColor() : "#0f172a",
                budget.getCategory() != null ? budget.getCategory().getIcon() : "PieChart",
                spentAmount,
                remainingAmount,
                Math.round(percentage * 10.0) / 10.0,
                isWarning,
                isExceeded
        );
    }
}
