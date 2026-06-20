import { Task } from "@/src/core/domain/entities/task.entity";
import { TaskRepositoryPort } from "@/src/core/domain/ports/task-repository.port";
import { UpdateTaskDto } from "@/src/core/application/dto/task.dto";

export class UpdateTaskUseCase {
  constructor(private readonly taskRepository: TaskRepositoryPort) {}

  async execute(id: string, data: UpdateTaskDto): Promise<Task | null> {
    if (
      (data.dueDate === null || data.dueDate === undefined) &&
      (data.recurrence === null || data.recurrence === undefined)
    ) {
      // If both are being cleared, check if the existing task has at least one
      const existing = await this.taskRepository.findById(id);
      if (!existing) return null;

      const futureDueDate = data.dueDate !== undefined ? data.dueDate : (existing.dueDate ? existing.dueDate.toISOString() : null);
      const futureRecurrence = data.recurrence !== undefined ? data.recurrence : existing.recurrence;

      if (!futureDueDate && !futureRecurrence) {
        throw new Error("Task must have a due date or recurrence");
      }
    }
    return this.taskRepository.update(id, data);
  }
}
