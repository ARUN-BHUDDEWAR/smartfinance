package com.smartfinance.service;

import com.smartfinance.domain.Category;
import com.smartfinance.domain.Transaction;
import com.smartfinance.domain.TransactionType;
import com.smartfinance.domain.User;
import com.smartfinance.dto.TransactionRequestDto;
import com.smartfinance.dto.TransactionResponseDto;
import com.smartfinance.dto.TransactionSummaryResponseDto;
import com.smartfinance.exception.BadRequestException;
import com.smartfinance.exception.ResourceNotFoundException;
import com.smartfinance.repository.CategoryRepository;
import com.smartfinance.repository.TransactionRepository;
import com.smartfinance.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final CurrentUserService currentUserService;

    @Transactional
    public TransactionResponseDto create(TransactionRequestDto request) {
        User user = currentUserService.getCurrentUser();
        Category category = getUserCategory(request.categoryId(), user.getId());

        Transaction transaction = new Transaction();
        applyRequest(transaction, request, category);
        transaction.setUser(user);
        return toResponse(transactionRepository.save(transaction));
    }

    @Transactional(readOnly = true)
    public Page<TransactionResponseDto> getTransactions(
        LocalDate fromDate,
        LocalDate toDate,
        Long categoryId,
        TransactionType type,
        int page,
        int size
    ) {
        if (page < 0 || size < 1 || size > 100) {
            throw new BadRequestException("Page must be non-negative and size must be between 1 and 100");
        }
        validateDateRange(fromDate, toDate);

        User user = currentUserService.getCurrentUser();
        if (categoryId != null) {
            getUserCategory(categoryId, user.getId());
        }
        Pageable pageable = PageRequest.of(
            page, size, Sort.by(Sort.Direction.DESC, "date")
                .and(Sort.by(Sort.Direction.DESC, "id"))
        );
        return transactionRepository.findForUser(
            user.getId(), fromDate, toDate, categoryId, type, pageable
        ).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public TransactionResponseDto getById(Long id) {
        User user = currentUserService.getCurrentUser();
        return toResponse(findUserTransaction(id, user.getId()));
    }

    @Transactional
    public TransactionResponseDto update(Long id, TransactionRequestDto request) {
        User user = currentUserService.getCurrentUser();
        Transaction transaction = findUserTransaction(id, user.getId());
        Category category = getUserCategory(request.categoryId(), user.getId());
        applyRequest(transaction, request, category);
        return toResponse(transactionRepository.save(transaction));
    }

    @Transactional
    public void delete(Long id) {
        User user = currentUserService.getCurrentUser();
        transactionRepository.delete(findUserTransaction(id, user.getId()));
    }

    @Transactional(readOnly = true)
    public TransactionSummaryResponseDto getSummary() {
        Long userId = currentUserService.getCurrentUser().getId();
        BigDecimal income = transactionRepository.sumAmountsByUserAndType(
            userId, TransactionType.INCOME, null, null
        );
        BigDecimal expense = transactionRepository.sumAmountsByUserAndType(
            userId, TransactionType.EXPENSE, null, null
        );
        return new TransactionSummaryResponseDto(income, expense, income.subtract(expense));
    }

    @Transactional(readOnly = true)
    public BigDecimal getExpenseTotal(LocalDate fromDate, LocalDate toDate) {
        return transactionRepository.sumAmountsByUserAndType(
            currentUserService.getCurrentUser().getId(),
            TransactionType.EXPENSE,
            fromDate,
            toDate
        );
    }

    private Transaction findUserTransaction(Long id, Long userId) {
        return transactionRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
    }

    private Category getUserCategory(Long categoryId, Long userId) {
        return categoryRepository.findByIdAndUserId(categoryId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    private void applyRequest(
        Transaction transaction,
        TransactionRequestDto request,
        Category category
    ) {
        transaction.setAmount(request.amount());
        transaction.setDate(request.date());
        transaction.setDescription(request.description());
        transaction.setCategory(category);
    }

    private TransactionResponseDto toResponse(Transaction transaction) {
        Category category = transaction.getCategory();
        return new TransactionResponseDto(
            transaction.getId(),
            transaction.getAmount(),
            transaction.getDate(),
            transaction.getDescription(),
            category.getId(),
            category.getName(),
            category.getType()
        );
    }

    private void validateDateRange(LocalDate fromDate, LocalDate toDate) {
        if (fromDate != null && toDate != null && fromDate.isAfter(toDate)) {
            throw new BadRequestException("fromDate must be on or before toDate");
        }
    }
}
