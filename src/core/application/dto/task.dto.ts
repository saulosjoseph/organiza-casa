import { TaskStatus, TaskRecurrence } from "@/src/core/domain/entities/task.entity";

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  groupId?: string | null;
  userGroupId?: string | null;
  assignedTo?: string | null;
  dueDate?: string | null;
  recurrence?: TaskRecurrence;
  recurrenceQuantity?: number;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  groupId?: string | null;
  userGroupId?: string | null;
  assignedTo?: string | null;
  dueDate?: string | null;
  recurrence?: TaskRecurrence;
  recurrenceQuantity?: number;
}

export interface TaskResponseDto {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  groupId: string | null;
  userGroupId: string | null;
  assignedTo: string | null;
  dueDate: string | null;
  recurrence: TaskRecurrence;
  recurrenceQuantity: number;
  overdue: boolean;
  createdAt: string;
  updatedAt: string;
}
