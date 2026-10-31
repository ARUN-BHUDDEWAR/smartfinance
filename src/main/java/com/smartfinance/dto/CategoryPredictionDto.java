package com.smartfinance.dto;

import java.math.BigDecimal;

public record CategoryPredictionDto(
    String categoryName,
    BigDecimal predictedAmount,
    BigDecimal historicalPercentageShare
) {
}
