package com.expensetracker.dto;

import java.math.BigDecimal;

public class MonthlyTrendDto {
    private String monthName;
    private int month;
    private int year;
    private BigDecimal income;
    private BigDecimal expense;
    private BigDecimal savings;

    public MonthlyTrendDto() {}

    public MonthlyTrendDto(String monthName, int month, int year, BigDecimal income, BigDecimal expense, BigDecimal savings) {
        this.monthName = monthName;
        this.month = month;
        this.year = year;
        this.income = income;
        this.expense = expense;
        this.savings = savings;
    }

    public String getMonthName() { return monthName; }
    public void setMonthName(String monthName) { this.monthName = monthName; }

    public int getMonth() { return month; }
    public void setMonth(int month) { this.month = month; }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public BigDecimal getIncome() { return income; }
    public void setIncome(BigDecimal income) { this.income = income; }

    public BigDecimal getExpense() { return expense; }
    public void setExpense(BigDecimal expense) { this.expense = expense; }

    public BigDecimal getSavings() { return savings; }
    public void setSavings(BigDecimal savings) { this.savings = savings; }
}
