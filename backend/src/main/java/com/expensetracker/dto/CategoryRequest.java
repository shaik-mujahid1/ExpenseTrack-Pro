package com.expensetracker.dto;

import com.expensetracker.entity.CategoryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CategoryRequest {
    @NotBlank(message = "Category name is required")
    private String name;

    @NotNull(message = "Category type is required")
    private CategoryType type = CategoryType.EXPENSE;

    private String color = "#10b981";
    private String icon = "Tag";

    public CategoryRequest() {}

    public CategoryRequest(String name, CategoryType type, String color, String icon) {
        this.name = name;
        this.type = type;
        this.color = color;
        this.icon = icon;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public CategoryType getType() { return type; }
    public void setType(CategoryType type) { this.type = type; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
}
