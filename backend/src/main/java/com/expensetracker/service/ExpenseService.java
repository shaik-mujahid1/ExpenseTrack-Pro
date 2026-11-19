package com.expensetracker.service;

import com.expensetracker.dto.ExpenseRequest;
import com.expensetracker.dto.ExpenseResponse;
import com.expensetracker.entity.Category;
import com.expensetracker.entity.Expense;
import com.expensetracker.entity.User;
import com.expensetracker.repository.ExpenseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final CategoryService categoryService;
    private final UserService userService;

    public ExpenseService(ExpenseRepository expenseRepository,
                          CategoryService categoryService,
                          UserService userService) {
        this.expenseRepository = expenseRepository;
        this.categoryService = categoryService;
        this.userService = userService;
    }

    public List<ExpenseResponse> getAllExpenses() {
        User user = userService.getCurrentAuthenticatedUser();
        return expenseRepository.findByUserOrderByDateDescCreatedAtDesc(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ExpenseResponse> searchAndFilter(LocalDate startDate, LocalDate endDate,
                                                 Long categoryId, String paymentMethod, String keyword) {
        User user = userService.getCurrentAuthenticatedUser();
        String trimmedKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;
        String trimmedMethod = (paymentMethod != null && !paymentMethod.trim().isEmpty() && !"ALL".equalsIgnoreCase(paymentMethod))
                ? paymentMethod.trim().toUpperCase() : null;

        if (startDate == null && endDate == null && categoryId == null && trimmedMethod == null && trimmedKeyword == null) {
            return getAllExpenses();
        }

        return expenseRepository.searchAndFilter(user, startDate, endDate, categoryId, trimmedMethod, trimmedKeyword)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ExpenseResponse getExpenseById(Long id) {
        User user = userService.getCurrentAuthenticatedUser();
        Expense expense = expenseRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Expense not found with ID: " + id));
        return mapToResponse(expense);
    }

    @Transactional
    public ExpenseResponse createExpense(ExpenseRequest request) {
        User user = userService.getCurrentAuthenticatedUser();
        Category category = categoryService.getCategoryEntity(request.getCategoryId(), user);

        Expense expense = new Expense(
                request.getDescription().trim(),
                request.getAmount(),
                request.getDate(),
                request.getPaymentMethod() != null ? request.getPaymentMethod().toUpperCase() : "CASH",
                category,
                user
        );

        expense = expenseRepository.save(expense);
        return mapToResponse(expense);
    }

    @Transactional
    public ExpenseResponse updateExpense(Long id, ExpenseRequest request) {
        User user = userService.getCurrentAuthenticatedUser();
        Expense expense = expenseRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Expense not found or access denied"));

        Category category = categoryService.getCategoryEntity(request.getCategoryId(), user);

        expense.setDescription(request.getDescription().trim());
        expense.setAmount(request.getAmount());
        expense.setDate(request.getDate());
        if (request.getPaymentMethod() != null) {
            expense.setPaymentMethod(request.getPaymentMethod().toUpperCase());
        }
        expense.setCategory(category);

        expense = expenseRepository.save(expense);
        return mapToResponse(expense);
    }

    @Transactional
    public void deleteExpense(Long id) {
        User user = userService.getCurrentAuthenticatedUser();
        Expense expense = expenseRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Expense not found or access denied"));

        expenseRepository.delete(expense);
    }

    public ExpenseResponse mapToResponse(Expense expense) {
        return new ExpenseResponse(
                expense.getId(),
                expense.getDescription(),
                expense.getAmount(),
                expense.getDate(),
                expense.getPaymentMethod(),
                expense.getCategory().getId(),
                expense.getCategory().getName(),
                expense.getCategory().getColor(),
                expense.getCategory().getIcon(),
                expense.getCreatedAt()
        );
    }
}
