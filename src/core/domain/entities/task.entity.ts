export type TaskStatus = "pending" | "in_progress" | "done";

export type TaskRecurrence = "daily" | "weekly" | "monthly" | null;

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  groupId: string | null;
  userGroupId: string | null;
  assignedTo: string | null;
  dueDate: Date | null;
  recurrence: TaskRecurrence;
  createdAt: Date;
  updatedAt: Date;
}
