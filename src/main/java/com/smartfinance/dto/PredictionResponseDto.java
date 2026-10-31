package com.smartfinance.dto;

import java.math.BigDecimal;
import java.util.List;

public record PredictionResponseDto(
    BigDecimal forecastedTotal,
    int targetMonth,
    int targetYear,
    double confidenceScore,
    List<CategoryPredictionDto> categoryBreakdown,
    String methodUsed,
    List<MonthlyExpenseDto> historicalMonthlyTotals
) {
}
