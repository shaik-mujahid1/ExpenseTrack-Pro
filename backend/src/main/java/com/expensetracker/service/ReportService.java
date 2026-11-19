package com.expensetracker.service;

import com.expensetracker.entity.Expense;
import com.expensetracker.entity.Income;
import com.expensetracker.entity.User;
import com.expensetracker.repository.ExpenseRepository;
import com.expensetracker.repository.IncomeRepository;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class ReportService {

    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;
    private final UserService userService;

    public ReportService(ExpenseRepository expenseRepository,
                         IncomeRepository incomeRepository,
                         UserService userService) {
        this.expenseRepository = expenseRepository;
        this.incomeRepository = incomeRepository;
        this.userService = userService;
    }

    public byte[] generateTransactionsCsv(LocalDate startDate, LocalDate endDate, Long categoryId, String type) {
        User user = userService.getCurrentAuthenticatedUser();

        List<CsvRecord> records = new ArrayList<>();

        boolean includeExpense = type == null || "ALL".equalsIgnoreCase(type) || "EXPENSE".equalsIgnoreCase(type);
        boolean includeIncome = type == null || "ALL".equalsIgnoreCase(type) || "INCOME".equalsIgnoreCase(type);

        String currency = (user != null && user.getCurrency() != null) ? user.getCurrency() : "INR";

        if (includeExpense) {
            List<Expense> expenses = expenseRepository.searchAndFilter(user, startDate, endDate, categoryId, null, null);
            for (Expense e : expenses) {
                records.add(new CsvRecord(
                        e.getId(),
                        e.getDate() != null ? e.getDate().toString() : "",
                        "EXPENSE",
                        e.getDescription() != null ? e.getDescription() : "",
                        e.getCategory() != null ? e.getCategory().getName() : "General",
                        e.getPaymentMethod() != null ? e.getPaymentMethod() : "CASH",
                        e.getAmount() != null ? e.getAmount().toString() : "0.00",
                        currency
                ));
            }
        }

        if (includeIncome) {
            List<Income> incomes = incomeRepository.searchAndFilter(user, startDate, endDate, categoryId, null);
            for (Income i : incomes) {
                records.add(new CsvRecord(
                        i.getId(),
                        i.getDate() != null ? i.getDate().toString() : "",
                        "INCOME",
                        i.getDescription() != null ? i.getDescription() : "",
                        i.getCategory() != null ? i.getCategory().getName() : "General",
                        "N/A",
                        i.getAmount() != null ? i.getAmount().toString() : "0.00",
                        currency
                ));
            }
        }

        // Sort by date descending
        records.sort((a, b) -> {
            if (b.date == null) return -1;
            if (a.date == null) return 1;
            return b.date.compareTo(a.date);
        });

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out, true, StandardCharsets.UTF_8)) {
            // Write CSV Header
            writer.println("ID,Date,Type,Description,Category,Payment Method,Amount,Currency");

            for (CsvRecord r : records) {
                writer.println(String.format("%d,%s,%s,\"%s\",\"%s\",%s,%s,%s",
                        r.id != null ? r.id : 0L,
                        escapeCsv(r.date),
                        escapeCsv(r.type),
                        escapeCsv(r.description),
                        escapeCsv(r.category),
                        escapeCsv(r.paymentMethod),
                        r.amount != null ? r.amount : "0.00",
                        escapeCsv(r.currency)
                ));
            }
            writer.flush();
        }

        return out.toByteArray();
    }

    private String escapeCsv(String val) {
        if (val == null) return "";
        return val.replace("\"", "\"\"");
    }

    private static class CsvRecord {
        Long id;
        String date;
        String type;
        String description;
        String category;
        String paymentMethod;
        String amount;
        String currency;

        CsvRecord(Long id, String date, String type, String description, String category, String paymentMethod, String amount, String currency) {
            this.id = id;
            this.date = date;
            this.type = type;
            this.description = description;
            this.category = category;
            this.paymentMethod = paymentMethod;
            this.amount = amount;
            this.currency = currency;
        }
    }
}
