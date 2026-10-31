package com.smartfinance.repository;

import com.smartfinance.domain.Category;
import com.smartfinance.domain.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findAllByUserIdOrderByNameAsc(Long userId);

    Optional<Category> findByIdAndUserId(Long id, Long userId);

    boolean existsByNameAndUserIdAndType(String name, Long userId, TransactionType type);

    boolean existsByUserIdAndNameAndTypeAndIdNot(
        Long userId,
        String name,
        TransactionType type,
        Long id
    );
}
