import { Task } from "@/src/core/domain/entities/task.entity";
import { TaskRepositoryPort } from "@/src/core/domain/ports/task-repository.port";
import { CreateTaskDto } from "@/src/core/application/dto/task.dto";

export class CreateTaskUseCase {
  constructor(private readonly taskRepository: TaskRepositoryPort) {}

  async execute(data: CreateTaskDto): Promise<Task> {
    if (!data.title || data.title.trim().length === 0) {
      throw new Error("Task title is required");
    }
    return this.taskRepository.create(data);
  }
}
