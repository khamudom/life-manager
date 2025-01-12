"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/UI/Button/Button";
import { Input } from "@/components/UI/Input/Input";
import styles from "./tasks.module.css";

interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  category: string;
  due_date: string | null;
}

const TasksPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

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
        router.push("/auth/login"); // Redirect to login if not authenticated
      } else {
        setUser(data.user);
        fetchTasks();
      }
    };

    checkAuth();
  }, [router]);

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

  const addTask = async () => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      setMessage(`Error: ${sessionError.message}`);
      return;
    }

    // Log the session and token
    console.log("Client: Session object:", session);
    console.log("Client: Access Token:", session?.access_token);

    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`, // Pass the access token
      },
      body: JSON.stringify({ title, description }),
    });
    console.log("Session Token:", session?.access_token);

    const data = await response.json();

    if (response.ok) {
      setMessage("Task added successfully!");
      setTitle("");
      setDescription("");
      fetchTasks();
    } else {
      setMessage(`Error: ${data.error}`);
    }
  };

  if (!user) {
    return <p>Loading...</p>; // Show a loading state while checking auth
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Tasks</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addTask();
        }}
        className={styles.form}
      >
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Title:
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={styles.input}
            />
          </label>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Description:
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.textarea}
            />
          </label>
        </div>
        <Button type="submit" className={styles.button}>
          Add Task
        </Button>
      </form>

      {message && <p className={styles.message}>{message}</p>}

      <div className={styles.welcome}>
        <p>Welcome, {user.email}!</p>
      </div>

      <div className={styles.taskList}>
        <h2 className={styles.taskListTitle}>Your Tasks</h2>
        {tasks.length === 0 ? (
          <p className={styles.emptyMessage}>
            No tasks yet. Add your first task above!
          </p>
        ) : (
          <ul>
            {tasks.map((task) => (
              <li
                key={task.id}
                className={`${styles.taskItem} ${
                  task.completed ? styles.completed : ""
                }`}
              >
                <Input
                  label="Task"
                  value={task.title}
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTaskCompletion(task.id, task.completed)}
                />
                <div className={styles.taskContent}>
                  <h3 className={styles.taskTitle}>{task.title}</h3>
                  {task.description && (
                    <p className={styles.taskDescription}>{task.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TasksPage;
