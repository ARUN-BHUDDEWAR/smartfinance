package com.smartfinance.service;

import com.smartfinance.domain.Category;
import com.smartfinance.domain.Transaction;
import com.smartfinance.domain.TransactionType;
import com.smartfinance.domain.User;
import com.smartfinance.dto.CategoryPredictionDto;
import com.smartfinance.dto.PredictionResponseDto;
import com.smartfinance.exception.BadRequestException;
import com.smartfinance.repository.TransactionRepository;
import com.smartfinance.security.CurrentUserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PredictionServiceTest {
    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private CurrentUserService currentUserService;

    private PredictionServiceImpl predictionService;

    @BeforeEach
    void setUp() {
        predictionService = new PredictionServiceImpl(transactionRepository, currentUserService);
        User user = new User();
        user.setId(7L);
        when(currentUserService.getCurrentUser()).thenReturn(user);
    }

    @Test
    void predictsNextMonthWithLinearRegressionForUpwardTrend() {
        stubExpenses(List.of(
            transaction(1L, "Food", "1000.00", 3, 1),
            transaction(1L, "Food", "2000.00", 2, 1),
            transaction(1L, "Food", "3000.00", 1, 1)
        ));

        PredictionResponseDto result = predictionService.predictNextMonth(3);

        assertThat(result.methodUsed()).isEqualTo("LINEAR_REGRESSION");
        assertThat(result.forecastedTotal()).isEqualByComparingTo("4000.00");
        assertThat(result.confidenceScore()).isBetween(0.0, 1.0);
        assertThat(result.historicalMonthlyTotals()).hasSize(3);
        assertThat(result.historicalMonthlyTotals())
            .extracting(month -> month.total())
            .containsExactly(
                new BigDecimal("1000.00"),
                new BigDecimal("2000.00"),
                new BigDecimal("3000.00")
            );
    }

    @Test
    void usesWeightedAverageWhenMonthlySpendingIsErratic() {
        stubExpenses(List.of(
            transaction(1L, "Food", "100.00", 6, 1),
            transaction(1L, "Food", "500.00", 5, 1),
            transaction(1L, "Food", "100.00", 4, 1),
            transaction(1L, "Food", "500.00", 3, 1),
            transaction(1L, "Food", "100.00", 2, 1),
            transaction(1L, "Food", "500.00", 1, 1)
        ));

        PredictionResponseDto result = predictionService.predictNextMonth(6);

        assertThat(result.methodUsed()).isEqualTo("WEIGHTED_AVERAGE");
        assertThat(result.forecastedTotal()).isEqualByComparingTo("328.57");
    }

    @Test
    void doesNotCompressZeroSpendMonthsOutOfTheTrend() {
        stubExpenses(List.of(
            transaction(1L, "Food", "1000.00", 3, 1),
            transaction(1L, "Food", "3000.00", 1, 1)
        ));

        PredictionResponseDto result = predictionService.predictNextMonth(3);

        assertThat(result.methodUsed()).isEqualTo("LINEAR_REGRESSION");
        assertThat(result.forecastedTotal()).isEqualByComparingTo("3333.33");
        assertThat(result.historicalMonthlyTotals())
            .extracting(month -> month.total())
            .containsExactly(
                new BigDecimal("1000.00"),
                new BigDecimal("0.00"),
                new BigDecimal("3000.00")
            );
    }

    @Test
    void rejectsPredictionWhenHistoryContainsNoExpenses() {
        stubExpenses(List.of());

        assertThatThrownBy(() -> predictionService.predictNextMonth(6))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("At least two months");
    }

    @Test
    void rejectsPredictionWhenOnlyOneMonthHasExpenseData() {
        stubExpenses(List.of(
            transaction(1L, "Food", "120.00", 1, 1)
        ));

        assertThatThrownBy(() -> predictionService.predictNextMonth(6))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("At least two months");
    }

    @Test
    void splitsForecastByHistoricalCategoryShares() {
        stubExpenses(List.of(
            transaction(1L, "Food", "500.00", 3, 1),
            transaction(2L, "Rent", "500.00", 3, 1),
            transaction(1L, "Food", "1000.00", 2, 1),
            transaction(2L, "Rent", "1000.00", 2, 1),
            transaction(1L, "Food", "1500.00", 1, 1),
            transaction(2L, "Rent", "1500.00", 1, 1)
        ));

        PredictionResponseDto result = predictionService.predictNextMonth(3);

        assertThat(result.forecastedTotal()).isEqualByComparingTo("4000.00");
        assertThat(result.categoryBreakdown())
            .extracting(CategoryPredictionDto::categoryName)
            .containsExactly("Food", "Rent");
        assertThat(result.categoryBreakdown())
            .extracting(CategoryPredictionDto::historicalPercentageShare)
            .containsExactly(new BigDecimal("50.00"), new BigDecimal("50.00"));
        assertThat(result.categoryBreakdown())
            .extracting(CategoryPredictionDto::predictedAmount)
            .containsExactly(new BigDecimal("2000.00"), new BigDecimal("2000.00"));
    }

    private void stubExpenses(List<Transaction> expenses) {
        when(transactionRepository
            .findAllByUserIdAndCategoryTypeAndDateGreaterThanEqualAndDateLessThan(
                anyLong(),
                eq(TransactionType.EXPENSE),
                any(LocalDate.class),
                any(LocalDate.class)
            )).thenReturn(expenses);
    }

    private Transaction transaction(
        long categoryId,
        String categoryName,
        String amount,
        int monthsAgo,
        int dayOfMonth
    ) {
        YearMonth month = YearMonth.now().minusMonths(monthsAgo);
        Category category = new Category();
        category.setId(categoryId);
        category.setName(categoryName);
        category.setType(TransactionType.EXPENSE);

        Transaction transaction = new Transaction();
        transaction.setAmount(new BigDecimal(amount));
        transaction.setDate(month.atDay(Math.min(dayOfMonth, month.lengthOfMonth())));
        transaction.setCategory(category);
        return transaction;
    }
}
