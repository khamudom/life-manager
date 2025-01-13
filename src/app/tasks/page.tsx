"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { TaskForm } from "@/app/tasks/components/TaskForm/TaskForm";
import { TaskFilters } from "@/app/tasks/components/TaskFilters/TaskFilters";
import { TaskSort } from "@/app/tasks/components/TaskSort/TaskSort";
import { EditTaskModal } from "@/app/tasks/components/EditTaskModal/EditTaskModal";
import { Task } from "@/types/task";
import styles from "./tasks.module.css";

const TasksPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [sortBy, setSortBy] = useState<
    "priority" | "due_date" | "title" | "created_at"
  >("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const router = useRouter();

  // Get unique categories from tasks
  const categories = [
    ...new Set(
      tasks
        .map((task) => task.category)
        .filter(
          (category): category is string =>
            typeof category === "string" && category !== ""
        )
    ),
  ];

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

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data?.user) {
        router.push("/auth/login");
      } else {
        setUser(data.user);
        fetchTasks();
      }
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async (taskData: Omit<Task, "id" | "completed">) => {
    console.log("Task data received in handleSubmit:", taskData);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      setMessage(`Error: ${sessionError.message}`);
      return;
    }

    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify(taskData),
    });

    const data = await response.json();

    if (response.ok) {
      setMessage("Task added successfully!");
      fetchTasks();
    } else {
      setMessage(`Error: ${data.error}`);
    }
  };

  const updateTask = async (taskId: number, updatedData: Partial<Task>) => {
    try {
      const cleanedData = {
        ...updatedData,
        due_date: updatedData.due_date || null,
      };

      const { error } = await supabase
        .from("tasks")
        .update(cleanedData)
        .match({ id: taskId });

      if (error) {
        console.error("Supabase error details:", error);
        throw error;
      }

      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, ...cleanedData } : task
        )
      );
      setMessage("Task updated successfully!");
    } catch (error) {
      console.error("Error updating task:", error);
      setMessage(
        error instanceof Error ? error.message : "Error updating task"
      );
    }
  };

  const deleteTask = async (taskId: number) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .match({ id: taskId });

      if (error) throw error;

      setTasks(tasks.filter((task) => task.id !== taskId));
      setMessage("Task deleted successfully!");
    } catch (error) {
      console.error("Error deleting task:", error);
      setMessage("Error deleting task");
    }
  };

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
      console.error("Error toggling task:", error);
    }
  };

  const handleSortChange = (
    newSort: "priority" | "due_date" | "title" | "created_at"
  ) => {
    setSortBy(newSort);
  };

  const handleOrderChange = () => {
    setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
  };

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

  // Filter tasks based on search, priority, and category
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

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Tasks</h1>

      <TaskForm onSubmit={handleSubmit} />

      <div className={styles.toolbarRow}>
        <TaskFilters
          onSearchChange={setSearchQuery}
          onPriorityChange={setSelectedPriority}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          searchValue={searchQuery}
          selectedPriority={selectedPriority}
          selectedCategory={selectedCategory}
        />
        <TaskSort
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          onOrderChange={handleOrderChange}
        />
      </div>

      {message && <p className={styles.message}>{message}</p>}

      <div className={styles.taskList}>
        <h2 className={styles.taskListTitle}>Your Tasks</h2>
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
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onSave={updateTask}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
};

export default TasksPage;
