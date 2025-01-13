export interface Task {
  id: number;
  title: string;
  description: string;
  completed?: boolean;
  priority: "low" | "medium" | "high";
  category: string | null;
  due_date: string | null;
}
