package com.expensetracker.service;

import com.expensetracker.dto.IncomeRequest;
import com.expensetracker.dto.IncomeResponse;
import com.expensetracker.entity.Category;
import com.expensetracker.entity.Income;
import com.expensetracker.entity.User;
import com.expensetracker.repository.IncomeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class IncomeService {

    private final IncomeRepository incomeRepository;
    private final CategoryService categoryService;
    private final UserService userService;

    public IncomeService(IncomeRepository incomeRepository,
                         CategoryService categoryService,
                         UserService userService) {
        this.incomeRepository = incomeRepository;
        this.categoryService = categoryService;
        this.userService = userService;
    }

    public List<IncomeResponse> getAllIncomes() {
        User user = userService.getCurrentAuthenticatedUser();
        return incomeRepository.findByUserOrderByDateDescCreatedAtDesc(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<IncomeResponse> searchAndFilter(LocalDate startDate, LocalDate endDate, Long categoryId, String keyword) {
        User user = userService.getCurrentAuthenticatedUser();
        String trimmedKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;

        return incomeRepository.searchAndFilter(user, startDate, endDate, categoryId, trimmedKeyword).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public IncomeResponse getIncomeById(Long id) {
        User user = userService.getCurrentAuthenticatedUser();
        Income income = incomeRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Income not found with ID: " + id));
        return mapToResponse(income);
    }

    @Transactional
    public IncomeResponse createIncome(IncomeRequest request) {
        User user = userService.getCurrentAuthenticatedUser();
        Category category = categoryService.getCategoryEntity(request.getCategoryId(), user);

        Income income = new Income(
                request.getDescription().trim(),
                request.getAmount(),
                request.getDate(),
                category,
                user
        );

        income = incomeRepository.save(income);
        return mapToResponse(income);
    }

    @Transactional
    public IncomeResponse updateIncome(Long id, IncomeRequest request) {
        User user = userService.getCurrentAuthenticatedUser();
        Income income = incomeRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Income not found or access denied"));

        Category category = categoryService.getCategoryEntity(request.getCategoryId(), user);

        income.setDescription(request.getDescription().trim());
        income.setAmount(request.getAmount());
        income.setDate(request.getDate());
        income.setCategory(category);

        income = incomeRepository.save(income);
        return mapToResponse(income);
    }

    @Transactional
    public void deleteIncome(Long id) {
        User user = userService.getCurrentAuthenticatedUser();
        Income income = incomeRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Income not found or access denied"));

        incomeRepository.delete(income);
    }

    public IncomeResponse mapToResponse(Income income) {
        return new IncomeResponse(
                income.getId(),
                income.getDescription(),
                income.getAmount(),
                income.getDate(),
                income.getCategory().getId(),
                income.getCategory().getName(),
                income.getCategory().getColor(),
                income.getCategory().getIcon(),
                income.getCreatedAt()
        );
    }
}
