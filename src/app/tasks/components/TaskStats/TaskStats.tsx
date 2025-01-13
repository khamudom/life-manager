import React from "react";
import { Task } from "@/types/task";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import styles from "./TaskStats.module.css";

interface TaskStatsProps {
  tasks: Task[];
}

export const TaskStats: React.FC<TaskStatsProps> = ({ tasks }) => {
  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const completionRate = totalTasks
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  // Priority distribution
  const priorityData = [
    {
      name: "High",
      value: tasks.filter((task) => task.priority === "high").length,
    },
    {
      name: "Medium",
      value: tasks.filter((task) => task.priority === "medium").length,
    },
    {
      name: "Low",
      value: tasks.filter((task) => task.priority === "low").length,
    },
  ];

  const PRIORITY_COLORS = {
    High: "#dc2626",
    Medium: "#d97706",
    Low: "#16a34a",
  };

  return (
    <div className={styles.statsContainer}>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Tasks</h3>
          <p className={styles.statNumber}>{totalTasks}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Completed Tasks</h3>
          <p className={styles.statNumber}>{completedTasks}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Completion Rate</h3>
          <p className={styles.statNumber}>{completionRate}%</p>
        </div>
      </div>

      <div className={styles.chartContainer}>
        <h3>Priority Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={priorityData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {priorityData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS]
                  }
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
