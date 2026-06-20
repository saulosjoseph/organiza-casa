import { Task } from "@/src/core/domain/entities/task.entity";
import { TaskRepositoryPort } from "@/src/core/domain/ports/task-repository.port";
import { UpdateTaskDto } from "@/src/core/application/dto/task.dto";

export class UpdateTaskUseCase {
  constructor(private readonly taskRepository: TaskRepositoryPort) {}

  async execute(id: string, data: UpdateTaskDto): Promise<Task | null> {
    return this.taskRepository.update(id, data);
  }
}
