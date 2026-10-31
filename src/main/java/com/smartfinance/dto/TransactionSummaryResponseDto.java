package com.smartfinance.dto;

import java.math.BigDecimal;

public record TransactionSummaryResponseDto(
    BigDecimal totalIncome,
    BigDecimal totalExpense,
    BigDecimal balance
) {
}
