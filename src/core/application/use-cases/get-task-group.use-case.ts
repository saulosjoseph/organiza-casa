import { TaskGroup } from "@/src/core/domain/entities/task-group.entity";
import { TaskGroupRepositoryPort } from "@/src/core/domain/ports/task-group-repository.port";

export class GetTaskGroupUseCase {
  constructor(private readonly repository: TaskGroupRepositoryPort) {}

  async execute(id: string): Promise<TaskGroup | null> {
    return this.repository.findById(id);
  }
}
