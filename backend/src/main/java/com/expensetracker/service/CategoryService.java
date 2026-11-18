package com.expensetracker.service;

import com.expensetracker.dto.CategoryRequest;
import com.expensetracker.dto.CategoryResponse;
import com.expensetracker.entity.Category;
import com.expensetracker.entity.CategoryType;
import com.expensetracker.entity.User;
import com.expensetracker.repository.CategoryRepository;
import com.expensetracker.repository.ExpenseRepository;
import com.expensetracker.repository.IncomeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;
    private final UserService userService;

    public CategoryService(CategoryRepository categoryRepository,
                           ExpenseRepository expenseRepository,
                           IncomeRepository incomeRepository,
                           UserService userService) {
        this.categoryRepository = categoryRepository;
        this.expenseRepository = expenseRepository;
        this.incomeRepository = incomeRepository;
        this.userService = userService;
    }

    public List<CategoryResponse> getAllCategories() {
        User user = userService.getCurrentAuthenticatedUser();
        return categoryRepository.findAllAvailableForUser(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<CategoryResponse> getCategoriesByType(CategoryType type) {
        User user = userService.getCurrentAuthenticatedUser();
        return categoryRepository.findAvailableByTypeAndUser(type, user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Category getCategoryEntity(Long id, User user) {
        return categoryRepository.findByIdAndAvailableForUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + id));
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        User user = userService.getCurrentAuthenticatedUser();

        if (categoryRepository.existsByNameIgnoreCaseAndUser(request.getName().trim(), user)) {
            throw new IllegalArgumentException("A category with this name already exists");
        }

        Category category = new Category(
                request.getName().trim(),
                request.getType() != null ? request.getType() : CategoryType.EXPENSE,
                request.getColor() != null ? request.getColor() : "#10b981",
                request.getIcon() != null ? request.getIcon() : "Tag",
                false,
                user
        );

        category = categoryRepository.save(category);
        return mapToResponse(category);
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        User user = userService.getCurrentAuthenticatedUser();
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        if (category.isDefault() || category.getUser() == null || !category.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Default or system categories cannot be modified");
        }

        category.setName(request.getName().trim());
        if (request.getType() != null) category.setType(request.getType());
        if (request.getColor() != null) category.setColor(request.getColor());
        if (request.getIcon() != null) category.setIcon(request.getIcon());

        category = categoryRepository.save(category);
        return mapToResponse(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        User user = userService.getCurrentAuthenticatedUser();
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        if (category.isDefault() || category.getUser() == null || !category.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Default categories cannot be deleted");
        }

        if (expenseRepository.existsByCategory(category) || incomeRepository.existsByCategory(category)) {
            throw new IllegalStateException("Cannot delete category because it is used by existing transactions");
        }

        categoryRepository.delete(category);
    }

    public CategoryResponse mapToResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getType(),
                category.getColor(),
                category.getIcon(),
                category.isDefault()
        );
    }
}
