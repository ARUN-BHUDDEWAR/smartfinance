package com.smartfinance.dto;

import com.smartfinance.domain.TransactionType;

public record CategoryResponseDto(Long id, String name, TransactionType type) {
}
