package com.smartfinance.dto;

import com.smartfinance.domain.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionResponseDto(
    Long id,
    BigDecimal amount,
    LocalDate date,
    String description,
    Long categoryId,
    String categoryName,
    TransactionType type
) {
}
