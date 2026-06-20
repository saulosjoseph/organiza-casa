export type TaskStatus = "pending" | "in_progress" | "done";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  groupId: string | null;
  assignedTo: string | null;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
