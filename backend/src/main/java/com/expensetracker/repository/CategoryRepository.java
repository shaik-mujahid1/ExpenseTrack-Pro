package com.expensetracker.repository;

import com.expensetracker.entity.Category;
import com.expensetracker.entity.CategoryType;
import com.expensetracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    @Query("SELECT c FROM Category c WHERE c.user IS NULL OR c.user = :user ORDER BY c.name ASC")
    List<Category> findAllAvailableForUser(@Param("user") User user);

    @Query("SELECT c FROM Category c WHERE (c.user IS NULL OR c.user = :user) AND c.type = :type ORDER BY c.name ASC")
    List<Category> findAvailableByTypeAndUser(@Param("type") CategoryType type, @Param("user") User user);

    @Query("SELECT c FROM Category c WHERE c.id = :id AND (c.user IS NULL OR c.user = :user)")
    Optional<Category> findByIdAndAvailableForUser(@Param("id") Long id, @Param("user") User user);

    Optional<Category> findByNameAndUser(String name, User user);

    Optional<Category> findByNameAndIsDefaultTrue(String name);

    boolean existsByNameIgnoreCaseAndUser(String name, User user);
}
