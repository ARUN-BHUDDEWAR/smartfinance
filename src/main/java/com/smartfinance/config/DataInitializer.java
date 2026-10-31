package com.smartfinance.config;

import com.smartfinance.domain.Budget;
import com.smartfinance.domain.Category;
import com.smartfinance.domain.Role;
import com.smartfinance.domain.RoleName;
import com.smartfinance.domain.Transaction;
import com.smartfinance.domain.TransactionType;
import com.smartfinance.domain.User;
import com.smartfinance.repository.BudgetRepository;
import com.smartfinance.repository.CategoryRepository;
import com.smartfinance.repository.RoleRepository;
import com.smartfinance.repository.TransactionRepository;
import com.smartfinance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.demo-data.enabled:true}")
    private boolean demoDataEnabled;

    @Value("${app.demo-data.password:}")
    private String demoUserPassword;

    @Override
    @Transactional
    public void run(String... args) {
        if (!demoDataEnabled) {
            log.info("Demo data seeding is disabled.");
            return;
        }
        if (userRepository.count() > 0) {
            log.info("Skipping demo data seeding because users already exist.");
            return;
        }
        if (demoUserPassword.isBlank()) {
            throw new IllegalStateException(
                "Set DEMO_USER_PASSWORD before seeding an empty database."
            );
        }

        Role userRole = findOrCreateRole(RoleName.ROLE_USER);
        Role adminRole = findOrCreateRole(RoleName.ROLE_ADMIN);
        seedAlex(userRole);
        seedPriya(userRole);
        seedMarcus(userRole);

        log.info(
            "Demo accounts created: alex.demo@smartfinance.com, "
                + "priya.demo@smartfinance.com, marcus.demo@smartfinance.com"
        );
        log.debug("Available roles: {}, {}", userRole.getName(), adminRole.getName());
    }

    private Role findOrCreateRole(RoleName name) {
        return roleRepository.findByName(name)
            .orElseGet(() -> roleRepository.save(new Role(name)));
    }

    private User createUser(String email, Role role) {
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(demoUserPassword));
        user.getRoles().add(role);
        return userRepository.save(user);
    }

    private Map<String, Category> createCategories(
        User user,
        Map<String, TransactionType> categoryTypes
    ) {
        List<Category> categories = new ArrayList<>();
        for (Map.Entry<String, TransactionType> entry : categoryTypes.entrySet()) {
            Category category = new Category();
            category.setName(entry.getKey());
            category.setType(entry.getValue());
            category.setUser(user);
            categories.add(category);
        }

        Map<String, Category> byName = new HashMap<>();
        categoryRepository.saveAll(categories).forEach(category ->
            byName.put(category.getName(), category)
        );
        return byName;
    }

    private void seedAlex(Role role) {
        User user = createUser("alex.demo@smartfinance.com", role);
        Map<String, Category> categories = createCategories(user, Map.of(
            "Salary", TransactionType.INCOME,
            "Groceries", TransactionType.EXPENSE,
            "Rent", TransactionType.EXPENSE,
            "Utilities", TransactionType.EXPENSE,
            "Dining", TransactionType.EXPENSE
        ));

        BigDecimal[] salaries = amounts("0", "92000", "90000", "90000", "88000");
        BigDecimal[] groceries = amounts("0", "11500", "10500", "9800", "9500");
        BigDecimal[] rents = amounts("0", "28000", "28000", "28000", "28000");
        BigDecimal[] utilities = amounts("0", "4200", "3900", "3600", "3500");
        BigDecimal[] dining = amounts("0", "5000", "4400", "4000", "3600");
        List<Transaction> transactions = new ArrayList<>();

        for (int monthsAgo = 4; monthsAgo >= 1; monthsAgo--) {
            addTransaction(transactions, user, categories.get("Salary"), salaries, monthsAgo, 1);
            addTransaction(transactions, user, categories.get("Groceries"), groceries, monthsAgo, 6);
            addTransaction(transactions, user, categories.get("Rent"), rents, monthsAgo, 2);
            addTransaction(transactions, user, categories.get("Utilities"), utilities, monthsAgo, 18);
            addTransaction(transactions, user, categories.get("Dining"), dining, monthsAgo, 24);
        }
        transactionRepository.saveAll(transactions);

        Budget budget = new Budget();
        YearMonth currentMonth = YearMonth.now();
        budget.setMonthlyLimit(new BigDecimal("60000.00"));
        budget.setMonth(currentMonth.getMonthValue());
        budget.setYear(currentMonth.getYear());
        budget.setUser(user);
        budgetRepository.save(budget);
    }

    private void seedPriya(Role role) {
        User user = createUser("priya.demo@smartfinance.com", role);
        Map<String, Category> categories = createCategories(user, Map.of(
            "Client Invoicing", TransactionType.INCOME,
            "Tech Subscriptions", TransactionType.EXPENSE,
            "Travel", TransactionType.EXPENSE,
            "Coffee", TransactionType.EXPENSE
        ));

        BigDecimal[] invoices = amounts("0", "94000", "128000", "76000");
        BigDecimal[] subscriptions = amounts("0", "5200", "4800", "4800");
        BigDecimal[] travel = amounts("0", "9200", "18000", "6500");
        BigDecimal[] coffee = amounts("0", "2800", "3400", "2200");
        List<Transaction> transactions = new ArrayList<>();

        for (int monthsAgo = 3; monthsAgo >= 1; monthsAgo--) {
            addTransaction(transactions, user, categories.get("Client Invoicing"), invoices, monthsAgo, 3);
            addTransaction(transactions, user, categories.get("Tech Subscriptions"), subscriptions, monthsAgo, 7);
            addTransaction(transactions, user, categories.get("Travel"), travel, monthsAgo, 16);
            addTransaction(transactions, user, categories.get("Coffee"), coffee, monthsAgo, 25);
        }
        transactionRepository.saveAll(transactions);
    }

    private void seedMarcus(Role role) {
        User user = createUser("marcus.demo@smartfinance.com", role);
        Map<String, Category> categories = createCategories(user, Map.of(
            "Stipend", TransactionType.INCOME,
            "Eating Out", TransactionType.EXPENSE,
            "Entertainment", TransactionType.EXPENSE,
            "Books", TransactionType.EXPENSE
        ));

        BigDecimal[] stipends = amounts("0", "45000", "45000", "42000");
        BigDecimal[] dining = amounts("0", "19200", "16800", "12500");
        BigDecimal[] entertainment = amounts("0", "6100", "5200", "3800");
        BigDecimal[] books = amounts("0", "3200", "1800", "2400");
        List<Transaction> transactions = new ArrayList<>();

        for (int monthsAgo = 3; monthsAgo >= 1; monthsAgo--) {
            addTransaction(transactions, user, categories.get("Stipend"), stipends, monthsAgo, 1);
            addTransaction(transactions, user, categories.get("Eating Out"), dining, monthsAgo, 8);
            addTransaction(transactions, user, categories.get("Entertainment"), entertainment, monthsAgo, 17);
            addTransaction(transactions, user, categories.get("Books"), books, monthsAgo, 26);
        }
        transactionRepository.saveAll(transactions);
    }

    private void addTransaction(
        List<Transaction> transactions,
        User user,
        Category category,
        BigDecimal[] valuesByMonth,
        int monthsAgo,
        int dayOfMonth
    ) {
        YearMonth month = YearMonth.now().minusMonths(monthsAgo);
        int lastValidDay = month.equals(YearMonth.now())
            ? LocalDate.now().getDayOfMonth()
            : month.lengthOfMonth();
        Transaction transaction = new Transaction();
        transaction.setAmount(valuesByMonth[monthsAgo]);
        transaction.setDate(month.atDay(Math.min(dayOfMonth, lastValidDay)));
        transaction.setDescription(category.getName() + " - " + month);
        transaction.setCategory(category);
        transaction.setUser(user);
        transactions.add(transaction);
    }

    private BigDecimal[] amounts(String... valuesByMonth) {
        BigDecimal[] values = new BigDecimal[valuesByMonth.length];
        for (int monthsAgo = 0; monthsAgo < valuesByMonth.length; monthsAgo++) {
            values[monthsAgo] = new BigDecimal(valuesByMonth[monthsAgo]);
        }
        return values;
    }
}
