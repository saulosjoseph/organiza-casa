export interface TaskGroup {
  id: string;
  name: string;
  description: string;
  userGroupId: string | null;
  assignedTo: string | null;
  createdAt: Date;
  updatedAt: Date;
}
