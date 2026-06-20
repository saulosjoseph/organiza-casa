import { TaskGroup } from "@/src/core/domain/entities/task-group.entity";
import { TaskGroupRepositoryPort } from "@/src/core/domain/ports/task-group-repository.port";
import { UpdateTaskGroupDto } from "@/src/core/application/dto/task-group.dto";

export class UpdateTaskGroupUseCase {
  constructor(private readonly repository: TaskGroupRepositoryPort) {}

  async execute(id: string, data: UpdateTaskGroupDto): Promise<TaskGroup | null> {
    return this.repository.update(id, data);
  }
}
