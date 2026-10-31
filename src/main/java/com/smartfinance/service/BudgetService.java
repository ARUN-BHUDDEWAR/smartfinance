package com.smartfinance.service;

import com.smartfinance.domain.Budget;
import com.smartfinance.domain.User;
import com.smartfinance.dto.BudgetRequestDto;
import com.smartfinance.dto.BudgetResponseDto;
import com.smartfinance.exception.ResourceNotFoundException;
import com.smartfinance.repository.BudgetRepository;
import com.smartfinance.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class BudgetService {
    private final BudgetRepository budgetRepository;
    private final CurrentUserService currentUserService;
    private final TransactionService transactionService;

    @Transactional
    public BudgetResponseDto save(BudgetRequestDto request) {
        User user = currentUserService.getCurrentUser();
        Budget budget = budgetRepository.findByUserIdAndMonthAndYear(
            user.getId(), request.month(), request.year()
        ).orElseGet(Budget::new);

        budget.setMonthlyLimit(request.monthlyLimit());
        budget.setMonth(request.month());
        budget.setYear(request.year());
        budget.setUser(user);
        Budget saved = budgetRepository.save(budget);
        LocalDate firstDay = LocalDate.of(request.year(), request.month(), 1);
        LocalDate lastDay = firstDay.withDayOfMonth(firstDay.lengthOfMonth());
        BigDecimal spending = transactionService.getExpenseTotal(firstDay, lastDay);
        return toResponse(saved, spending);
    }

    @Transactional(readOnly = true)
    public BudgetResponseDto getCurrent() {
        User user = currentUserService.getCurrentUser();
        LocalDate today = LocalDate.now();
        int month = today.getMonthValue();
        int year = today.getYear();
        Budget budget = budgetRepository.findByUserIdAndMonthAndYear(user.getId(), month, year)
            .orElseThrow(() -> new ResourceNotFoundException("Budget for the current month not found"));

        LocalDate firstDay = today.withDayOfMonth(1);
        LocalDate lastDay = today.withDayOfMonth(today.lengthOfMonth());
        BigDecimal spending = transactionService.getExpenseTotal(firstDay, lastDay);
        return toResponse(budget, spending);
    }

    private BudgetResponseDto toResponse(Budget budget, BigDecimal spending) {
        return new BudgetResponseDto(
            budget.getMonthlyLimit(),
            budget.getMonth(),
            budget.getYear(),
            spending,
            budget.getMonthlyLimit().subtract(spending)
        );
    }
}
