package com.smartfinance.service;

import com.smartfinance.domain.Category;
import com.smartfinance.domain.Transaction;
import com.smartfinance.domain.TransactionType;
import com.smartfinance.dto.CategoryPredictionDto;
import com.smartfinance.dto.MonthlyExpenseDto;
import com.smartfinance.dto.PredictionResponseDto;
import com.smartfinance.exception.BadRequestException;
import com.smartfinance.repository.TransactionRepository;
import com.smartfinance.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PredictionServiceImpl implements PredictionService {
    private static final int MIN_MONTHS = 2;
    private static final int MAX_MONTHS = 12;
    private static final int MIN_REGRESSION_MONTHS = 3;
    private static final double MIN_R_SQUARED = 0.20;
    private static final BigDecimal ZERO = BigDecimal.ZERO;

    private final TransactionRepository transactionRepository;
    private final CurrentUserService currentUserService;

    @Override
    @Transactional(readOnly = true)
    public PredictionResponseDto predictNextMonth(int months) {
        if (months < MIN_MONTHS || months > MAX_MONTHS) {
            throw new BadRequestException("months must be between 2 and 12");
        }

        LocalDate currentMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate fromDate = currentMonth.minusMonths(months);
        Long userId = currentUserService.getCurrentUser().getId();
        List<Transaction> expenses = transactionRepository
            .findAllByUserIdAndCategoryTypeAndDateGreaterThanEqualAndDateLessThan(
                userId, TransactionType.EXPENSE, fromDate, currentMonth
            );

        List<Double> monthlyTotals = new ArrayList<>();
        for (int i = 0; i < months; i++) {
            monthlyTotals.add(0.0);
        }

        Map<Long, CategoryTotal> categoryTotals = new LinkedHashMap<>();
        Set<Integer> monthsWithExpenses = new HashSet<>();
        for (Transaction transaction : expenses) {
            int monthIndex = (int) ChronoUnit.MONTHS.between(
                YearMonth.from(fromDate), YearMonth.from(transaction.getDate())
            );
            monthsWithExpenses.add(monthIndex);
            monthlyTotals.set(
                monthIndex,
                monthlyTotals.get(monthIndex) + transaction.getAmount().doubleValue()
            );

            Category category = transaction.getCategory();
            CategoryTotal existing = categoryTotals.get(category.getId());
            BigDecimal amount = existing == null
                ? transaction.getAmount()
                : existing.amount().add(transaction.getAmount());
            categoryTotals.put(category.getId(), new CategoryTotal(category.getName(), amount));
        }

        BigDecimal historicalTotal = categoryTotals.values().stream()
            .map(CategoryTotal::amount)
            .reduce(ZERO, BigDecimal::add);
        if (monthsWithExpenses.size() < MIN_MONTHS) {
            throw new BadRequestException(
                "At least two months of expense data are required to make a prediction"
            );
        }

        RegressionResult regression = calculateRegression(monthlyTotals);
        boolean useRegression = months >= MIN_REGRESSION_MONTHS
            && regression.rSquared() >= MIN_R_SQUARED
            && regression.prediction() > 0;
        double prediction = useRegression
            ? regression.prediction()
            : weightedAverage(monthlyTotals);
        prediction = Math.max(0, prediction);

        BigDecimal forecastedTotal = BigDecimal.valueOf(prediction)
            .setScale(2, RoundingMode.HALF_UP);
        List<CategoryPredictionDto> breakdown = createCategoryBreakdown(
            categoryTotals, historicalTotal, forecastedTotal
        );
        double confidence = useRegression
            ? regressionConfidence(months, regression.rSquared())
            : averageConfidence(monthlyTotals);

        YearMonth targetMonth = YearMonth.from(currentMonth).plusMonths(1);
        List<MonthlyExpenseDto> historicalMonthlyTotals = new ArrayList<>();
        for (int i = 0; i < monthlyTotals.size(); i++) {
            YearMonth month = YearMonth.from(fromDate).plusMonths(i);
            BigDecimal total = BigDecimal.valueOf(monthlyTotals.get(i))
                .setScale(2, RoundingMode.HALF_UP);
            historicalMonthlyTotals.add(
                new MonthlyExpenseDto(month.getMonthValue(), month.getYear(), total)
            );
        }
        return new PredictionResponseDto(
            forecastedTotal,
            targetMonth.getMonthValue(),
            targetMonth.getYear(),
            confidence,
            breakdown,
            useRegression ? "LINEAR_REGRESSION" : "WEIGHTED_AVERAGE",
            historicalMonthlyTotals
        );
    }

    private RegressionResult calculateRegression(List<Double> values) {
        int count = values.size();
        double sumX = 0;
        double sumY = 0;
        double sumXY = 0;
        double sumX2 = 0;

        for (int i = 0; i < count; i++) {
            double x = i + 1;
            double y = values.get(i);
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumX2 += x * x;
        }

        double denominator = count * sumX2 - sumX * sumX;
        if (denominator == 0) {
            return new RegressionResult(weightedAverage(values), 0);
        }

        // Ordinary least squares: calculate slope and intercept from the sums.
        double slope = (count * sumXY - sumX * sumY) / denominator;
        double intercept = (sumY - slope * sumX) / count;
        double prediction = slope * (count + 1) + intercept;

        double mean = sumY / count;
        double totalVariation = 0;
        double residualVariation = 0;
        for (int i = 0; i < count; i++) {
            double actual = values.get(i);
            double predicted = slope * (i + 1) + intercept;
            totalVariation += Math.pow(actual - mean, 2);
            residualVariation += Math.pow(actual - predicted, 2);
        }
        double rSquared = totalVariation == 0
            ? 1
            : clamp01(1 - residualVariation / totalVariation);

        return new RegressionResult(prediction, rSquared);
    }

    private double weightedAverage(List<Double> values) {
        double weightedTotal = 0;
        double totalWeight = 0;
        for (int i = 0; i < values.size(); i++) {
            double weight = i + 1;
            weightedTotal += values.get(i) * weight;
            totalWeight += weight;
        }
        return totalWeight == 0 ? 0 : weightedTotal / totalWeight;
    }

    private double regressionConfidence(int sampleSize, double rSquared) {
        return clamp01(Math.min(1, sampleSize / 6.0) * rSquared);
    }

    private double averageConfidence(List<Double> values) {
        double mean = values.stream().mapToDouble(Double::doubleValue).average().orElse(0);
        double variance = values.stream()
            .mapToDouble(value -> Math.pow(value - mean, 2))
            .average()
            .orElse(0);
        double standardError = Math.sqrt(variance / values.size());
        double consistency = 1 / (1 + standardError / (Math.abs(mean) + 1));
        return clamp01(Math.min(1, values.size() / 6.0) * consistency);
    }

    private List<CategoryPredictionDto> createCategoryBreakdown(
        Map<Long, CategoryTotal> categoryTotals,
        BigDecimal historicalTotal,
        BigDecimal forecastedTotal
    ) {
        List<Map.Entry<Long, CategoryTotal>> categories = categoryTotals.entrySet().stream()
            .sorted(Comparator.comparing(entry -> entry.getValue().name()))
            .toList();
        List<CategoryPredictionDto> result = new ArrayList<>();
        BigDecimal allocated = ZERO;
        BigDecimal allocatedShare = ZERO;

        for (int i = 0; i < categories.size(); i++) {
            CategoryTotal category = categories.get(i).getValue();
            boolean last = i == categories.size() - 1;
            BigDecimal share = last
                ? BigDecimal.valueOf(100).subtract(allocatedShare)
                : category.amount().multiply(BigDecimal.valueOf(100))
                    .divide(historicalTotal, 2, RoundingMode.HALF_UP);
            BigDecimal amount = last
                ? forecastedTotal.subtract(allocated)
                : forecastedTotal.multiply(share)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.DOWN);

            result.add(new CategoryPredictionDto(category.name(), amount, share));
            allocated = allocated.add(amount);
            allocatedShare = allocatedShare.add(share);
        }
        return result;
    }

    private double clamp01(double value) {
        return Math.max(0, Math.min(1, value));
    }

    private record CategoryTotal(String name, BigDecimal amount) {
    }

    private record RegressionResult(double prediction, double rSquared) {
    }
}
