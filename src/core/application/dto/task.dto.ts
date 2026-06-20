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
  overdue: boolean;
  createdAt: string;
  updatedAt: string;
}
