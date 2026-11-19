package com.expensetracker.repository;

import com.expensetracker.entity.Category;
import com.expensetracker.entity.Income;
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
public interface IncomeRepository extends JpaRepository<Income, Long> {

    List<Income> findByUserOrderByDateDescCreatedAtDesc(User user);

    Optional<Income> findByIdAndUser(Long id, User user);

    @Query("SELECT i FROM Income i WHERE i.user = :user " +
           "AND (:startDate IS NULL OR i.date >= :startDate) " +
           "AND (:endDate IS NULL OR i.date <= :endDate) " +
           "AND (:categoryId IS NULL OR i.category.id = :categoryId) " +
           "AND (CAST(:keyword AS string) IS NULL OR LOWER(i.description) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))) " +
           "ORDER BY i.date DESC, i.createdAt DESC")
    List<Income> searchAndFilter(
            @Param("user") User user,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("categoryId") Long categoryId,
            @Param("keyword") String keyword
    );

    @Query("SELECT COALESCE(SUM(i.amount), 0) FROM Income i WHERE i.user = :user")
    BigDecimal sumTotalByUser(@Param("user") User user);

    @Query("SELECT COALESCE(SUM(i.amount), 0) FROM Income i WHERE i.user = :user AND i.date >= :startDate AND i.date <= :endDate")
    BigDecimal sumByUserAndDateBetween(@Param("user") User user, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT i.category.id, i.category.name, i.category.color, i.category.icon, SUM(i.amount) " +
           "FROM Income i WHERE i.user = :user AND i.date >= :startDate AND i.date <= :endDate " +
           "GROUP BY i.category.id, i.category.name, i.category.color, i.category.icon " +
           "ORDER BY SUM(i.amount) DESC")
    List<Object[]> findIncomeCategoryBreakdown(@Param("user") User user, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    boolean existsByCategory(Category category);
}
