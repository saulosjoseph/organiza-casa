import { UserGroup } from "@/src/core/domain/entities/user-group.entity";
import { UserGroupRepositoryPort } from "@/src/core/domain/ports/user-group-repository.port";

export class ListUserGroupsUseCase {
  constructor(private readonly repository: UserGroupRepositoryPort) {}

  async execute(userId: string): Promise<UserGroup[]> {
    return this.repository.findByMember(userId);
  }
}
