import { TaskCompletion } from "@/src/core/domain/entities/task-completion.entity";

export interface TaskCompletionRepositoryPort {
  create(taskId: string, completedBy: string | null): Promise<TaskCompletion>;
  countInPeriod(taskId: string, periodStart: Date, periodEnd: Date): Promise<number>;
  findByTask(taskId: string): Promise<TaskCompletion[]>;
  deleteLatestInPeriod(taskId: string, periodStart: Date, periodEnd: Date): Promise<boolean>;
}
