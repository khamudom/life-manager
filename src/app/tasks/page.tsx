"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { Task } from "../../types/task";
import { AddTaskModal } from "./components/AddTaskModal/AddTaskModal";
import { TaskFilters } from "./components/TaskFilters/TaskFilters";
import { TaskSort } from "./components/TaskSort/TaskSort";
import { EditTaskModal } from "./components/EditTaskModal/EditTaskModal";
import styles from "./tasks.module.css";

const TasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [sortBy, setSortBy] = useState<
    "priority" | "due_date" | "title" | "created_at"
  >("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const router = useRouter();

  // Fetch tasks from Supabase
  const fetchTasks = async () => {
    try {
      const { data: tasks, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching tasks:", error);
        return;
      }

      setTasks(tasks || []);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Handle authentication and fetch tasks
  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.push("/auth/login");
      } else {
        fetchTasks();
      }
    };

    checkAuth();
  }, [router]);

  // Add a new task
  const handleAddTask = async (taskData: Omit<Task, "id" | "completed">) => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error(`Error: ${sessionError.message}`);
      return;
    }

    if (!session || !session.access_token) {
      console.error("Error: Unable to retrieve access token.");
      return;
    }

    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(taskData),
    });

    if (response.ok) {
      fetchTasks();
    } else {
      const data = await response.json();
      console.error(`Error: ${data.error}`);
    }
  };

  // Disable scrolling when modal is open
  useEffect(() => {
    if (isAddingTask || editingTask) {
      document.body.style.overflow = "hidden"; // Disable scrolling
    } else {
      document.body.style.overflow = ""; // Enable scrolling
    }

    // Cleanup when component unmounts
    return () => {
      document.body.style.overflow = "";
    };
  }, [isAddingTask, editingTask]);

  // Delete a task
  const deleteTask = async (taskId: number) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .match({ id: taskId });

      if (error) throw error;

      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Toggle task completion
  const toggleTaskCompletion = async (
    taskId: number,
    currentStatus: boolean
  ) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ completed: !currentStatus })
        .match({ id: taskId });

      if (error) throw error;

      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, completed: !currentStatus } : task
        )
      );
    } catch (error) {
      console.error("Error toggling task completion:", error);
    }
  };

  // Sort tasks
  const sortTasks = (tasks: Task[]) => {
    return [...tasks].sort((a, b) => {
      switch (sortBy) {
        case "priority": {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          const aValue = priorityOrder[a.priority] || 0;
          const bValue = priorityOrder[b.priority] || 0;
          return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
        }
        case "due_date": {
          const aDate = a.due_date ? new Date(a.due_date).getTime() : 0;
          const bDate = b.due_date ? new Date(b.due_date).getTime() : 0;
          return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
        }
        case "title":
          return sortOrder === "asc"
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority =
      !selectedPriority || task.priority === selectedPriority;
    const matchesCategory =
      !selectedCategory || task.category === selectedCategory;
    return matchesSearch && matchesPriority && matchesCategory;
  });

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Tasks</h1>
        <button
          className={styles.addButton}
          onClick={() => setIsAddingTask(true)}
        >
          + Add Task
        </button>
      </div>
      <div className={styles.toolbarRow}>
        <TaskFilters
          onSearchChange={setSearchQuery}
          onPriorityChange={setSelectedPriority}
          onCategoryChange={setSelectedCategory}
          categories={[...new Set(tasks.map((task) => task.category || ""))]}
          searchValue={searchQuery}
          selectedPriority={selectedPriority}
          selectedCategory={selectedCategory}
        />
        <TaskSort
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={setSortBy}
          onOrderChange={() =>
            setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"))
          }
        />
      </div>

      <div className={styles.taskList}>
        {filteredTasks.length === 0 ? (
          <p className={styles.emptyMessage}>No tasks found.</p>
        ) : (
          <ul>
            {sortTasks(filteredTasks).map((task) => (
              <li
                key={task.id}
                className={`${styles.taskItem} ${
                  task.completed ? styles.completed : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={task.completed || false}
                  onChange={() =>
                    toggleTaskCompletion(task.id, task.completed || false)
                  }
                  className={styles.checkbox}
                />
                <div className={styles.taskContent}>
                  <div className={styles.taskHeader}>
                    <h3 className={styles.taskTitle}>{task.title}</h3>
                    <span
                      className={`${styles.priority} ${styles[task.priority]}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                  {task.description && (
                    <p className={styles.taskDescription}>{task.description}</p>
                  )}
                  <div className={styles.taskMeta}>
                    {task.category && (
                      <span className={styles.category}>{task.category}</span>
                    )}
                    {task.due_date && (
                      <span className={styles.dueDate}>
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.taskActions}>
                  <button
                    onClick={() => setEditingTask(task)}
                    className={styles.editButton}
                    aria-label="Edit task"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className={styles.deleteButton}
                    aria-label="Delete task"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isAddingTask && (
        <AddTaskModal
          onSubmit={handleAddTask}
          onClose={() => setIsAddingTask(false)}
        />
      )}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onSave={() => fetchTasks()}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
};

export default TasksPage;
