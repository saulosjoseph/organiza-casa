import { TaskGroupRepositoryPort } from "@/src/core/domain/ports/task-group-repository.port";

export class DeleteTaskGroupUseCase {
  constructor(private readonly repository: TaskGroupRepositoryPort) {}

  async execute(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}
