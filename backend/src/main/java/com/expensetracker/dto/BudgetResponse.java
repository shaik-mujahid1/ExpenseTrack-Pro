package com.expensetracker.dto;

import java.math.BigDecimal;

public class BudgetResponse {
    private Long id;
    private Integer month;
    private Integer year;
    private BigDecimal amount;
    private Long categoryId;
    private String categoryName;
    private String categoryColor;
    private String categoryIcon;
    private BigDecimal spentAmount;
    private BigDecimal remainingAmount;
    private double percentageSpent;
    private boolean isWarning;
    private boolean isExceeded;

    public BudgetResponse() {}

    public BudgetResponse(Long id, Integer month, Integer year, BigDecimal amount, Long categoryId,
                          String categoryName, String categoryColor, String categoryIcon,
                          BigDecimal spentAmount, BigDecimal remainingAmount, double percentageSpent,
                          boolean isWarning, boolean isExceeded) {
        this.id = id;
        this.month = month;
        this.year = year;
        this.amount = amount;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.categoryColor = categoryColor;
        this.categoryIcon = categoryIcon;
        this.spentAmount = spentAmount;
        this.remainingAmount = remainingAmount;
        this.percentageSpent = percentageSpent;
        this.isWarning = isWarning;
        this.isExceeded = isExceeded;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getMonth() { return month; }
    public void setMonth(Integer month) { this.month = month; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getCategoryColor() { return categoryColor; }
    public void setCategoryColor(String categoryColor) { this.categoryColor = categoryColor; }

    public String getCategoryIcon() { return categoryIcon; }
    public void setCategoryIcon(String categoryIcon) { this.categoryIcon = categoryIcon; }

    public BigDecimal getSpentAmount() { return spentAmount; }
    public void setSpentAmount(BigDecimal spentAmount) { this.spentAmount = spentAmount; }

    public BigDecimal getRemainingAmount() { return remainingAmount; }
    public void setRemainingAmount(BigDecimal remainingAmount) { this.remainingAmount = remainingAmount; }

    public double getPercentageSpent() { return percentageSpent; }
    public void setPercentageSpent(double percentageSpent) { this.percentageSpent = percentageSpent; }

    public boolean isWarning() { return isWarning; }
    public void setWarning(boolean warning) { isWarning = warning; }

    public boolean isExceeded() { return isExceeded; }
    public void setExceeded(boolean exceeded) { isExceeded = exceeded; }
}
