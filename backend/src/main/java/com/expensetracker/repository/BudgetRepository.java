package com.expensetracker.repository;

import com.expensetracker.entity.Budget;
import com.expensetracker.entity.Category;
import com.expensetracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByUserAndMonthAndYear(User user, Integer month, Integer year);

    List<Budget> findByUserOrderByYearDescMonthDesc(User user);

    Optional<Budget> findByIdAndUser(Long id, User user);

    Optional<Budget> findByUserAndMonthAndYearAndCategory(User user, Integer month, Integer year, Category category);

    Optional<Budget> findByUserAndMonthAndYearAndCategoryIsNull(User user, Integer month, Integer year);
}
