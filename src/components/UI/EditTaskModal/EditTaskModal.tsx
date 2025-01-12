import React, { useState } from "react";
import { Task } from "@/types/task";
import styles from "./EditTaskModal.module.css";

interface EditTaskModalProps {
  task: Task;
  onSave: (taskId: number, updatedData: Partial<Task>) => Promise<void>;
  onClose: () => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState(task.priority);
  const [category, setCategory] = useState(task.category);
  const [dueDate, setDueDate] = useState(
    task.due_date ? task.due_date.split("T")[0] : ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(task.id, {
      title,
      description,
      priority,
      category,
      due_date: dueDate || null,
    });
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>Edit Task</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Priority</label>
              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as Task["priority"])
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button type="submit" className={styles.saveButton}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
