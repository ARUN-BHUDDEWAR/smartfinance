package com.smartfinance.dto;

import java.math.BigDecimal;

public record BudgetResponseDto(
    BigDecimal monthlyLimit,
    int month,
    int year,
    BigDecimal totalSpending,
    BigDecimal remaining
) {
}
