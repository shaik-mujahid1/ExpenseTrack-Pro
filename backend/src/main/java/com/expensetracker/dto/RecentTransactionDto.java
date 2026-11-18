package com.expensetracker.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class RecentTransactionDto {
    private Long id;
    private String type; // "EXPENSE" or "INCOME"
    private String description;
    private BigDecimal amount;
    private LocalDate date;
    private String categoryName;
    private String categoryColor;
    private String categoryIcon;
    private String paymentMethod; // null for income

    public RecentTransactionDto() {}

    public RecentTransactionDto(Long id, String type, String description, BigDecimal amount, LocalDate date,
                                String categoryName, String categoryColor, String categoryIcon, String paymentMethod) {
        this.id = id;
        this.type = type;
        this.description = description;
        this.amount = amount;
        this.date = date;
        this.categoryName = categoryName;
        this.categoryColor = categoryColor;
        this.categoryIcon = categoryIcon;
        this.paymentMethod = paymentMethod;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getCategoryColor() { return categoryColor; }
    public void setCategoryColor(String categoryColor) { this.categoryColor = categoryColor; }

    public String getCategoryIcon() { return categoryIcon; }
    public void setCategoryIcon(String categoryIcon) { this.categoryIcon = categoryIcon; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
}
