package com.smartfinance.controller;

import com.smartfinance.dto.TransactionRequestDto;
import com.smartfinance.dto.TransactionResponseDto;
import com.smartfinance.dto.TransactionSummaryResponseDto;
import com.smartfinance.domain.TransactionType;
import com.smartfinance.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {
    private final TransactionService transactionService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionResponseDto create(@Valid @RequestBody TransactionRequestDto request) {
        return transactionService.create(request);
    }

    @GetMapping
    public Page<TransactionResponseDto> getTransactions(
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
        @RequestParam(required = false) Long categoryId,
        @RequestParam(required = false) TransactionType type,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return transactionService.getTransactions(fromDate, toDate, categoryId, type, page, size);
    }

    @GetMapping("/summary")
    public TransactionSummaryResponseDto getSummary() {
        return transactionService.getSummary();
    }

    @GetMapping("/{id}")
    public TransactionResponseDto getById(@PathVariable Long id) {
        return transactionService.getById(id);
    }

    @PutMapping("/{id}")
    public TransactionResponseDto update(
        @PathVariable Long id,
        @Valid @RequestBody TransactionRequestDto request
    ) {
        return transactionService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        transactionService.delete(id);
    }
}
