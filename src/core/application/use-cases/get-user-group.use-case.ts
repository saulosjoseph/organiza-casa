import { UserGroup } from "@/src/core/domain/entities/user-group.entity";
import { UserGroupRepositoryPort } from "@/src/core/domain/ports/user-group-repository.port";

export class GetUserGroupUseCase {
  constructor(private readonly repository: UserGroupRepositoryPort) {}

  async execute(id: string): Promise<UserGroup | null> {
    return this.repository.findById(id);
  }
}
