export interface CreateUserGroupDto {
  name: string;
  description?: string;
}

export interface UpdateUserGroupDto {
  name?: string;
  description?: string;
}

export interface UserGroupResponseDto {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: string[];
  inviteCode: string;
  inviteLink: string;
  createdAt: string;
  updatedAt: string;
}
