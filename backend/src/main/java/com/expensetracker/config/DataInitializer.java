package com.expensetracker.config;

import com.expensetracker.entity.*;
import com.expensetracker.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;
    private final BudgetRepository budgetRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(CategoryRepository categoryRepository,
                           UserRepository userRepository,
                           ExpenseRepository expenseRepository,
                           IncomeRepository incomeRepository,
                           BudgetRepository budgetRepository,
                           PasswordEncoder passwordEncoder) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.expenseRepository = expenseRepository;
        this.incomeRepository = incomeRepository;
        this.budgetRepository = budgetRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedDefaultCategories();
        seedDemoUser();
    }

    private void seedDefaultCategories() {
        if (categoryRepository.findByNameAndIsDefaultTrue("Food").isEmpty()) {
            List<Category> defaultCategories = List.of(
                    // Expense categories
                    new Category("Food", CategoryType.EXPENSE, "#f97316", "UtensilsCrossed", true, null),
                    new Category("Shopping", CategoryType.EXPENSE, "#ec4899", "ShoppingBag", true, null),
                    new Category("Transportation", CategoryType.EXPENSE, "#3b82f6", "Car", true, null),
                    new Category("Education", CategoryType.EXPENSE, "#8b5cf6", "GraduationCap", true, null),
                    new Category("Healthcare", CategoryType.EXPENSE, "#ef4444", "HeartPulse", true, null),
                    new Category("Entertainment", CategoryType.EXPENSE, "#eab308", "Film", true, null),
                    new Category("Bills", CategoryType.EXPENSE, "#6366f1", "Receipt", true, null),
                    new Category("Travel", CategoryType.EXPENSE, "#14b8a6", "Plane", true, null),
                    new Category("Personal", CategoryType.EXPENSE, "#a855f7", "User", true, null),
                    new Category("Other", CategoryType.EXPENSE, "#64748b", "MoreHorizontal", true, null),

                    // Income categories
                    new Category("Salary", CategoryType.INCOME, "#10b981", "Briefcase", true, null),
                    new Category("Freelance", CategoryType.INCOME, "#06b6d4", "Laptop", true, null),
                    new Category("Investments", CategoryType.INCOME, "#84cc16", "TrendingUp", true, null),
                    new Category("Business", CategoryType.INCOME, "#3b82f6", "Building2", true, null),
                    new Category("Gifts", CategoryType.INCOME, "#f43f5e", "Gift", true, null),
                    new Category("Other Income", CategoryType.INCOME, "#64748b", "Coins", true, null)
            );

            categoryRepository.saveAll(defaultCategories);
            logger.info("Seeded {} default categories", defaultCategories.size());
        }
    }

    private void seedDemoUser() {
        String demoEmail = "demo@expensetracker.com";
        if (userRepository.findByEmail(demoEmail).isEmpty()) {
            User demoUser = new User("Rahul Sharma", demoEmail, passwordEncoder.encode("Password123!"), "INR");
            demoUser = userRepository.save(demoUser);

            LocalDate now = LocalDate.now();
            int currentMonth = now.getMonthValue();
            int currentYear = now.getYear();

            Category food = categoryRepository.findByNameAndIsDefaultTrue("Food").orElse(null);
            Category shopping = categoryRepository.findByNameAndIsDefaultTrue("Shopping").orElse(null);
            Category transport = categoryRepository.findByNameAndIsDefaultTrue("Transportation").orElse(null);
            Category bills = categoryRepository.findByNameAndIsDefaultTrue("Bills").orElse(null);
            Category entertainment = categoryRepository.findByNameAndIsDefaultTrue("Entertainment").orElse(null);
            Category healthcare = categoryRepository.findByNameAndIsDefaultTrue("Healthcare").orElse(null);

            Category salary = categoryRepository.findByNameAndIsDefaultTrue("Salary").orElse(null);
            Category freelance = categoryRepository.findByNameAndIsDefaultTrue("Freelance").orElse(null);
            Category investments = categoryRepository.findByNameAndIsDefaultTrue("Investments").orElse(null);

            // Incomes
            if (salary != null) {
                incomeRepository.save(new Income("Monthly Tech Lead Salary", BigDecimal.valueOf(85000.00), now.withDayOfMonth(1), salary, demoUser));
                incomeRepository.save(new Income("Previous Month Salary", BigDecimal.valueOf(85000.00), now.minusMonths(1).withDayOfMonth(1), salary, demoUser));
                incomeRepository.save(new Income("Q3 Salary", BigDecimal.valueOf(82000.00), now.minusMonths(2).withDayOfMonth(1), salary, demoUser));
            }
            if (freelance != null) {
                incomeRepository.save(new Income("Web UI Redesign Project", BigDecimal.valueOf(25000.00), now.withDayOfMonth(10), freelance, demoUser));
                incomeRepository.save(new Income("Consulting Gig", BigDecimal.valueOf(18000.00), now.minusMonths(1).withDayOfMonth(15), freelance, demoUser));
            }
            if (investments != null) {
                incomeRepository.save(new Income("Quarterly Mutual Fund Dividend", BigDecimal.valueOf(6500.00), now.withDayOfMonth(5), investments, demoUser));
            }

            // Expenses for current month
            if (bills != null) {
                expenseRepository.save(new Expense("Apartment Rent Payment", BigDecimal.valueOf(22000.00), now.withDayOfMonth(2), "NET_BANKING", bills, demoUser));
                expenseRepository.save(new Expense("Electricity & Water Utility", BigDecimal.valueOf(2800.00), now.withDayOfMonth(6), "UPI", bills, demoUser));
                expenseRepository.save(new Expense("Fiber Internet Broadband", BigDecimal.valueOf(1299.00), now.withDayOfMonth(8), "CREDIT_CARD", bills, demoUser));
            }
            if (food != null) {
                expenseRepository.save(new Expense("Monthly Supermarket Groceries", BigDecimal.valueOf(6450.00), now.withDayOfMonth(3), "DEBIT_CARD", food, demoUser));
                expenseRepository.save(new Expense("Weekend Family Dining", BigDecimal.valueOf(2150.00), now.withDayOfMonth(7), "UPI", food, demoUser));
                expenseRepository.save(new Expense("Coffee & Snack with Team", BigDecimal.valueOf(450.00), now.withDayOfMonth(11), "UPI", food, demoUser));
            }
            if (transport != null) {
                expenseRepository.save(new Expense("Car Fuel Tank Full", BigDecimal.valueOf(3500.00), now.withDayOfMonth(4), "CREDIT_CARD", transport, demoUser));
                expenseRepository.save(new Expense("Metro Smart Card Recharge", BigDecimal.valueOf(1000.00), now.withDayOfMonth(9), "UPI", transport, demoUser));
            }
            if (shopping != null) {
                expenseRepository.save(new Expense("Formal Office Wear & Shoes", BigDecimal.valueOf(4200.00), now.withDayOfMonth(12), "CREDIT_CARD", shopping, demoUser));
            }
            if (entertainment != null) {
                expenseRepository.save(new Expense("Digital Media Streaming Subscriptions", BigDecimal.valueOf(899.00), now.withDayOfMonth(5), "CREDIT_CARD", entertainment, demoUser));
            }
            if (healthcare != null) {
                expenseRepository.save(new Expense("Health Checkup & Vitamins", BigDecimal.valueOf(1500.00), now.withDayOfMonth(13), "UPI", healthcare, demoUser));
            }

            // Past month expenses for trend graphs
            if (food != null) {
                expenseRepository.save(new Expense("Groceries Store", BigDecimal.valueOf(5900.00), now.minusMonths(1).withDayOfMonth(4), "DEBIT_CARD", food, demoUser));
                expenseRepository.save(new Expense("Groceries & Provisions", BigDecimal.valueOf(6100.00), now.minusMonths(2).withDayOfMonth(3), "DEBIT_CARD", food, demoUser));
            }
            if (bills != null) {
                expenseRepository.save(new Expense("Apartment Rent", BigDecimal.valueOf(22000.00), now.minusMonths(1).withDayOfMonth(2), "NET_BANKING", bills, demoUser));
                expenseRepository.save(new Expense("Apartment Rent", BigDecimal.valueOf(22000.00), now.minusMonths(2).withDayOfMonth(2), "NET_BANKING", bills, demoUser));
            }

            // Budgets for current month
            if (food != null) {
                budgetRepository.save(new Budget(currentMonth, currentYear, BigDecimal.valueOf(12000.00), food, demoUser));
            }
            if (shopping != null) {
                budgetRepository.save(new Budget(currentMonth, currentYear, BigDecimal.valueOf(5000.00), shopping, demoUser));
            }
            if (transport != null) {
                budgetRepository.save(new Budget(currentMonth, currentYear, BigDecimal.valueOf(6000.00), transport, demoUser));
            }
            if (bills != null) {
                budgetRepository.save(new Budget(currentMonth, currentYear, BigDecimal.valueOf(28000.00), bills, demoUser));
            }
            // Overall monthly budget
            budgetRepository.save(new Budget(currentMonth, currentYear, BigDecimal.valueOf(60000.00), null, demoUser));

            logger.info("Seeded demo user {} with initial transactions and budgets", demoEmail);
        }
    }
}
