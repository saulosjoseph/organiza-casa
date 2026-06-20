import { Task } from "@/src/core/domain/entities/task.entity";
import { TaskRepositoryPort } from "@/src/core/domain/ports/task-repository.port";

export class GetTaskUseCase {
  constructor(private readonly taskRepository: TaskRepositoryPort) {}

  async execute(id: string): Promise<Task | null> {
    return this.taskRepository.findById(id);
  }
}
