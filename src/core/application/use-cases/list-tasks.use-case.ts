import { Task } from "@/src/core/domain/entities/task.entity";
import { TaskRepositoryPort } from "@/src/core/domain/ports/task-repository.port";

export class ListTasksUseCase {
  constructor(private readonly taskRepository: TaskRepositoryPort) {}

  async execute(): Promise<Task[]> {
    return this.taskRepository.findAll();
  }
}
