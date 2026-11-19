package com.expensetracker.repository;

import com.expensetracker.entity.Category;
import com.expensetracker.entity.Expense;
import com.expensetracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByUserOrderByDateDescCreatedAtDesc(User user);

    Optional<Expense> findByIdAndUser(Long id, User user);

    @Query("SELECT e FROM Expense e WHERE e.user = :user " +
           "AND (:startDate IS NULL OR e.date >= :startDate) " +
           "AND (:endDate IS NULL OR e.date <= :endDate) " +
           "AND (:categoryId IS NULL OR e.category.id = :categoryId) " +
           "AND (CAST(:paymentMethod AS string) IS NULL OR e.paymentMethod = :paymentMethod) " +
           "AND (CAST(:keyword AS string) IS NULL OR LOWER(e.description) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))) " +
           "ORDER BY e.date DESC, e.createdAt DESC")
    List<Expense> searchAndFilter(
            @Param("user") User user,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("categoryId") Long categoryId,
            @Param("paymentMethod") String paymentMethod,
            @Param("keyword") String keyword
    );

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.user = :user")
    BigDecimal sumTotalByUser(@Param("user") User user);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.user = :user AND e.date >= :startDate AND e.date <= :endDate")
    BigDecimal sumByUserAndDateBetween(@Param("user") User user, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.user = :user AND e.category = :category AND e.date >= :startDate AND e.date <= :endDate")
    BigDecimal sumByUserAndCategoryAndDateBetween(@Param("user") User user, @Param("category") Category category, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT e.category.id, e.category.name, e.category.color, e.category.icon, SUM(e.amount) " +
           "FROM Expense e WHERE e.user = :user AND e.date >= :startDate AND e.date <= :endDate " +
           "GROUP BY e.category.id, e.category.name, e.category.color, e.category.icon " +
           "ORDER BY SUM(e.amount) DESC")
    List<Object[]> findCategorySpendingBreakdown(@Param("user") User user, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    boolean existsByCategory(Category category);
}
