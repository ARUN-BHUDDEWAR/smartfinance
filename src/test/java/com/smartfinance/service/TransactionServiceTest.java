package com.smartfinance.service;

import com.smartfinance.domain.User;
import com.smartfinance.dto.TransactionRequestDto;
import com.smartfinance.exception.ResourceNotFoundException;
import com.smartfinance.repository.CategoryRepository;
import com.smartfinance.repository.TransactionRepository;
import com.smartfinance.security.CurrentUserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {
    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private CurrentUserService currentUserService;

    private TransactionService transactionService;

    @BeforeEach
    void setUp() {
        transactionService = new TransactionService(
            transactionRepository, categoryRepository, currentUserService
        );
        User currentUser = new User();
        currentUser.setId(10L);
        when(currentUserService.getCurrentUser()).thenReturn(currentUser);
    }

    @Test
    void fetchingAnotherUsersTransactionReturnsNotFound() {
        when(transactionRepository.findByIdAndUserId(99L, 10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> transactionService.getById(99L))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessage("Transaction not found");

        verify(transactionRepository).findByIdAndUserId(99L, 10L);
    }

    @Test
    void updatingAnotherUsersTransactionReturnsNotFoundBeforeCheckingCategory() {
        when(transactionRepository.findByIdAndUserId(99L, 10L)).thenReturn(Optional.empty());
        TransactionRequestDto request = new TransactionRequestDto(
            new BigDecimal("25.00"), LocalDate.now(), "Lunch", 5L
        );

        assertThatThrownBy(() -> transactionService.update(99L, request))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessage("Transaction not found");

        verify(transactionRepository).findByIdAndUserId(99L, 10L);
    }
}
