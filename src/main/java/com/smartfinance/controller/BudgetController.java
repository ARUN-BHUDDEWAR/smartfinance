package com.smartfinance.controller;

import com.smartfinance.dto.BudgetRequestDto;
import com.smartfinance.dto.BudgetResponseDto;
import com.smartfinance.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {
    private final BudgetService budgetService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BudgetResponseDto save(@Valid @RequestBody BudgetRequestDto request) {
        return budgetService.save(request);
    }

    @GetMapping("/current")
    public BudgetResponseDto getCurrent() {
        return budgetService.getCurrent();
    }
}
