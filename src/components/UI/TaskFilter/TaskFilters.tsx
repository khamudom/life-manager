import React from "react";
import { Input } from "../Input/Input";
import styles from "./TaskFilters.module.css";

interface TaskFiltersProps {
  onSearchChange: (search: string) => void;
  onPriorityChange: (priority: string) => void;
  onCategoryChange: (category: string) => void;
  categories: string[];
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  onSearchChange,
  onPriorityChange,
  onCategoryChange,
  categories,
}) => {
  return (
    <div className={styles.filters}>
      <Input
        label="Search"
        type="search"
        placeholder="Search tasks..."
        onChange={(e) => onSearchChange(e.target.value)}
        className={styles.searchInput}
      />

      <select
        onChange={(e) => onPriorityChange(e.target.value)}
        className={styles.select}
      >
        <option value="">All Priorities</option>
        <option value="high">High Priority</option>
        <option value="medium">Medium Priority</option>
        <option value="low">Low Priority</option>
      </select>

      <select
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
