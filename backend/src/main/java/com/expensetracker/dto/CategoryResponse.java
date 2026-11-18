package com.expensetracker.dto;

import com.expensetracker.entity.CategoryType;

public class CategoryResponse {
    private Long id;
    private String name;
    private CategoryType type;
    private String color;
    private String icon;
    private boolean isDefault;

    public CategoryResponse() {}

    public CategoryResponse(Long id, String name, CategoryType type, String color, String icon, boolean isDefault) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.color = color;
        this.icon = icon;
        this.isDefault = isDefault;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public CategoryType getType() { return type; }
    public void setType(CategoryType type) { this.type = type; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public boolean isDefault() { return isDefault; }
    public void setDefault(boolean aDefault) { isDefault = aDefault; }
}
