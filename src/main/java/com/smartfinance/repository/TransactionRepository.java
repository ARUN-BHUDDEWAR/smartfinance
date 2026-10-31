package com.smartfinance.repository;

import com.smartfinance.domain.Transaction;
import com.smartfinance.domain.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Page<Transaction> findAllByUserId(Long userId, Pageable pageable);

    Optional<Transaction> findByIdAndUserId(Long id, Long userId);

    boolean existsByCategoryIdAndUserId(Long categoryId, Long userId);

    List<Transaction> findAllByUserIdAndCategoryTypeAndDateGreaterThanEqualAndDateLessThan(
        Long userId,
        TransactionType type,
        LocalDate fromDate,
        LocalDate toDate
    );

    @Query("""
        SELECT t FROM Transaction t
        WHERE t.user.id = :userId
          AND (:fromDate IS NULL OR t.date >= :fromDate)
          AND (:toDate IS NULL OR t.date <= :toDate)
          AND (:categoryId IS NULL OR t.category.id = :categoryId)
          AND (:type IS NULL OR t.category.type = :type)
        """)
    Page<Transaction> findForUser(
        @Param("userId") Long userId,
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate,
        @Param("categoryId") Long categoryId,
        @Param("type") TransactionType type,
        Pageable pageable
    );

    @Query("""
        SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t
        WHERE t.user.id = :userId
          AND t.category.type = :type
          AND (:fromDate IS NULL OR t.date >= :fromDate)
          AND (:toDate IS NULL OR t.date <= :toDate)
        """)
    BigDecimal sumAmountsByUserAndType(
        @Param("userId") Long userId,
        @Param("type") TransactionType type,
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate
    );
}
