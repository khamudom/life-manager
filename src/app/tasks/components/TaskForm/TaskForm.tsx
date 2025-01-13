import React, { useState } from "react";
import { Task } from "@/types/task";
import { Button } from "@/components/UI/Button/Button";
import { Input } from "@/components/UI/Input/Input";
import styles from "./TaskForm.module.css";

interface TaskFormProps {
  onSubmit: (taskData: Omit<Task, "id" | "completed">) => Promise<void>;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("Submitting task with data:", {
        title,
        description,
        priority,
        category,
        due_date: dueDate,
      });

      await onSubmit({
        title,
        description,
        priority,
        category,
        due_date: dueDate,
      });

      // Clear form
      setTitle("");
      setDescription("");
      setPriority("medium");
      setCategory("");
      setDueDate("");
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <Input
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        type="textarea"
      />

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Task["priority"])}
            className={styles.select}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={styles.input}
            placeholder="e.g., Work, Personal, Shopping"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={styles.input}
          />
        </div>
      </div>

      <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
        Add Task
      </Button>
    </form>
  );
};
