import { TaskGroup } from "@/src/core/domain/entities/task-group.entity";
import { TaskGroupRepositoryPort } from "@/src/core/domain/ports/task-group-repository.port";

export class ListTaskGroupsUseCase {
  constructor(private readonly repository: TaskGroupRepositoryPort) {}

  async execute(): Promise<TaskGroup[]> {
    return this.repository.findAll();
  }
}
