export interface CreateTaskGroupDto {
  name: string;
  description?: string;
}

export interface UpdateTaskGroupDto {
  name?: string;
  description?: string;
}

export interface TaskGroupResponseDto {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}
