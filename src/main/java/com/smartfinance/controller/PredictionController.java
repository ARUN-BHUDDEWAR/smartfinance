package com.smartfinance.controller;

import com.smartfinance.dto.PredictionResponseDto;
import com.smartfinance.service.PredictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/predictions")
@RequiredArgsConstructor
public class PredictionController {
    private final PredictionService predictionService;

    @GetMapping("/next-month")
    public PredictionResponseDto predictNextMonth(
        @RequestParam(defaultValue = "6") int months
    ) {
        return predictionService.predictNextMonth(months);
    }
}
