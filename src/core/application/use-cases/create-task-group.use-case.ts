import { TaskGroup } from "@/src/core/domain/entities/task-group.entity";
import { TaskGroupRepositoryPort } from "@/src/core/domain/ports/task-group-repository.port";
import { CreateTaskGroupDto } from "@/src/core/application/dto/task-group.dto";

export class CreateTaskGroupUseCase {
  constructor(private readonly repository: TaskGroupRepositoryPort) {}

  async execute(data: CreateTaskGroupDto): Promise<TaskGroup> {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error("Task group name is required");
    }
    return this.repository.create(data);
  }
}
