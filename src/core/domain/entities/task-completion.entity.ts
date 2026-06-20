export interface TaskCompletion {
  id: string;
  taskId: string;
  completedBy: string | null;
  completedAt: Date;
}
