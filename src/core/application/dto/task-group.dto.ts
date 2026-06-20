export interface CreateTaskGroupDto {
  name: string;
  description?: string;
  assignedTo?: string | null;
}

export interface UpdateTaskGroupDto {
  name?: string;
  description?: string;
  assignedTo?: string | null;
}

export interface TaskGroupResponseDto {
  id: string;
  name: string;
  description: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
}
