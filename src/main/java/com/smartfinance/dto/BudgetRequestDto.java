package com.smartfinance.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record BudgetRequestDto(
    @NotNull @Positive BigDecimal monthlyLimit,
    @Min(1) @Max(12) int month,
    @Min(2000) @Max(9999) int year
) {
}
