package com.smartfinance.dto;

import java.math.BigDecimal;

public record MonthlyExpenseDto(int month, int year, BigDecimal total) {
}
