package com.smartfinance.repository;

import com.smartfinance.domain.Budget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findAllByUserId(Long userId);

    Optional<Budget> findByUserIdAndMonthAndYear(Long userId, int month, int year);
}
