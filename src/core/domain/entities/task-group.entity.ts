export interface TaskGroup {
  id: string;
  name: string;
  description: string;
  assignedTo: string | null;
  createdAt: Date;
  updatedAt: Date;
}
