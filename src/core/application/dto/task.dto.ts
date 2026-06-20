import { TaskStatus } from "@/src/core/domain/entities/task.entity";

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  groupId?: string | null;
  userGroupId?: string | null;
  assignedTo?: string | null;
  dueDate?: string | null;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  groupId?: string | null;
  userGroupId?: string | null;
  assignedTo?: string | null;
  dueDate?: string | null;
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
  createdAt: string;
  updatedAt: string;
}
