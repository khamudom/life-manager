import React from "react";
import { Input } from "../../../../components/UI/Input/Input";
import styles from "./TaskFilters.module.css";

interface TaskFiltersProps {
  onSearchChange: (search: string) => void;
  onPriorityChange: (priority: string) => void;
  onCategoryChange: (category: string) => void;
  categories: string[];
  searchValue: string;
  selectedPriority: string;
  selectedCategory: string;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  onSearchChange,
  onPriorityChange,
  onCategoryChange,
  categories,
  searchValue,
  selectedPriority,
  selectedCategory,
}) => {
  return (
    <div className={styles.filters}>
      <Input
        label="Search"
        type="search"
        placeholder="Search tasks..."
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        className={styles.searchInput}
      />

      <select
        value={selectedPriority}
        onChange={(e) => onPriorityChange(e.target.value)}
        className={styles.select}
      >
        <option value="">All Priorities</option>
        <option value="high">High Priority</option>
        <option value="medium">Medium Priority</option>
        <option value="low">Low Priority</option>
      </select>

      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className={styles.select}
      >
        <option value="">All Categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>
  );
};
