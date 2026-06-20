import { TaskRepositoryPort } from "@/src/core/domain/ports/task-repository.port";

export class DeleteTaskUseCase {
  constructor(private readonly taskRepository: TaskRepositoryPort) {}

  async execute(id: string): Promise<boolean> {
    return this.taskRepository.delete(id);
  }
}
