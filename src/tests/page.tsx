"use client";

import { useEffect } from "react";

const TestAddTask = () => {
  useEffect(() => {
    const addTask = async () => {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Task",
          description: "This is a new task.",
        }),
      });

      const data = await response.json();
      console.log(data);
    };

    addTask();
  }, []);

  return <p>Check the console for the API response.</p>;
};

export default TestAddTask;
