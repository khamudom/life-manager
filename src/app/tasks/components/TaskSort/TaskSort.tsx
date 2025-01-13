import React from "react";
import styles from "./TaskSort.module.css";

interface TaskSortProps {
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (
    field: "priority" | "due_date" | "title" | "created_at"
  ) => void;
  onOrderChange: () => void;
}

export const TaskSort: React.FC<TaskSortProps> = ({
  sortBy,
  sortOrder,
  onSortChange,
  onOrderChange,
}) => {
  return (
    <div className={styles.sortContainer}>
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value as never)}
        className={styles.sortSelect}
      >
        <option value="created_at">Created Date</option>
        <option value="priority">Priority</option>
        <option value="due_date">Due Date</option>
        <option value="title">Title</option>
      </select>

      <button
        onClick={onOrderChange}
        className={styles.orderButton}
        aria-label={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
      >
        {sortOrder === "asc" ? "↑" : "↓"}
      </button>
    </div>
  );
};
