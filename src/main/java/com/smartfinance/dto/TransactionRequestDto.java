package com.smartfinance.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionRequestDto(
    @NotNull @DecimalMin("0.01") BigDecimal amount,
    @NotNull LocalDate date,
    @Size(max = 500) String description,
    @NotNull @Positive Long categoryId
) {
}
