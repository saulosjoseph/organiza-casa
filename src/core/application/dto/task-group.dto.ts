export interface CreateTaskGroupDto {
  name: string;
  description?: string;
  userGroupId?: string | null;
  assignedTo?: string | null;
}

export interface UpdateTaskGroupDto {
  name?: string;
  description?: string;
  userGroupId?: string | null;
  assignedTo?: string | null;
}

export interface TaskGroupResponseDto {
  id: string;
  name: string;
  description: string;
  userGroupId: string | null;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
}
