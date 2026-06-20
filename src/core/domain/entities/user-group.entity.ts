export interface UserGroup {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: string[];
  inviteCode: string;
  createdAt: Date;
  updatedAt: Date;
}
