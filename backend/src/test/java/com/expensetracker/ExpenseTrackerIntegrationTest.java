package com.expensetracker;

import com.expensetracker.dto.*;
import com.expensetracker.entity.Category;
import com.expensetracker.entity.CategoryType;
import com.expensetracker.entity.User;
import com.expensetracker.repository.CategoryRepository;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class ExpenseTrackerIntegrationTest {

    @Autowired
    private UserService userService;

    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private IncomeService incomeService;

    @Autowired
    private BudgetService budgetService;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private ReportService reportService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserDetailsService userDetailsService;

    private String testEmail = "testuser@example.com";

    @BeforeEach
    void setupSecurityContext() {
        if (!userRepository.existsByEmail(testEmail)) {
            RegisterRequest reg = new RegisterRequest("Test User", testEmail, "Password123!", "INR");
            userService.register(reg);
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(testEmail);
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    void testAuthAndLogin() {
        AuthResponse response = userService.login(new AuthRequest(testEmail, "Password123!"));
        assertNotNull(response);
        assertNotNull(response.getToken());
        assertEquals(testEmail, response.getEmail());
    }

    @Test
    void testCategoryRetrieval() {
        List<CategoryResponse> categories = categoryService.getAllCategories();
        assertFalse(categories.isEmpty());
    }

    @Test
    void testCreateExpenseAndDashboardUpdate() {
        List<CategoryResponse> expCats = categoryService.getCategoriesByType(CategoryType.EXPENSE);
        assertFalse(expCats.isEmpty());
        Long catId = expCats.get(0).getId();

        ExpenseRequest req = new ExpenseRequest(
                "Integration Test Expense",
                BigDecimal.valueOf(150.00),
                LocalDate.now(),
                "UPI",
                catId
        );

        ExpenseResponse created = expenseService.createExpense(req);
        assertNotNull(created.getId());
        assertEquals("Integration Test Expense", created.getDescription());

        // Check Dashboard
        DashboardSummaryResponse summary = dashboardService.getDashboardSummary();
        assertNotNull(summary);
        assertTrue(summary.getTotalExpenses().compareTo(BigDecimal.ZERO) >= 0);

        // Delete created expense
        expenseService.deleteExpense(created.getId());
    }

    @Test
    void testCreateIncomeAndLedger() {
        List<CategoryResponse> incCats = categoryService.getCategoriesByType(CategoryType.INCOME);
        assertFalse(incCats.isEmpty());
        Long catId = incCats.get(0).getId();

        IncomeRequest req = new IncomeRequest(
                "Integration Test Income",
                BigDecimal.valueOf(2500.00),
                LocalDate.now(),
                catId
        );

        IncomeResponse created = incomeService.createIncome(req);
        assertNotNull(created.getId());
        assertEquals("Integration Test Income", created.getDescription());

        // Cleanup
        incomeService.deleteIncome(created.getId());
    }

    @Test
    void testBudgetTrackingAndAlerts() {
        LocalDate now = LocalDate.now();
        BudgetRequest bReq = new BudgetRequest(
                now.getMonthValue(),
                now.getYear(),
                BigDecimal.valueOf(5000.00),
                null
        );

        // If exists, delete first to ensure test isolation
        List<BudgetResponse> existing = budgetService.getBudgetsForMonth(now.getMonthValue(), now.getYear());
        for (BudgetResponse b : existing) {
            if (b.getCategoryId() == null) {
                budgetService.deleteBudget(b.getId());
            }
        }

        BudgetResponse created = budgetService.createBudget(bReq);
        assertNotNull(created);
        assertEquals(BigDecimal.valueOf(5000.00), created.getAmount());

        // Cleanup
        budgetService.deleteBudget(created.getId());
    }

    @Test
    void testReportCsvGeneration() {
        ByteArrayInputStream csvStream = reportService.generateTransactionsCsv(
                LocalDate.now().minusDays(30),
                LocalDate.now(),
                null,
                "ALL"
        );
        assertNotNull(csvStream);
        assertTrue(csvStream.available() > 0);
    }
}
