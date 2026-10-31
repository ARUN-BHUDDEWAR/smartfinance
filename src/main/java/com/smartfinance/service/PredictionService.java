package com.smartfinance.service;

import com.smartfinance.dto.PredictionResponseDto;

public interface PredictionService {
    PredictionResponseDto predictNextMonth(int months);
}
