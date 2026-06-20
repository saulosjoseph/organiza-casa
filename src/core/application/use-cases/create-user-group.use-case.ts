import { UserGroup } from "@/src/core/domain/entities/user-group.entity";
import { UserGroupRepositoryPort } from "@/src/core/domain/ports/user-group-repository.port";
import { CreateUserGroupDto } from "@/src/core/application/dto/user-group.dto";

export class CreateUserGroupUseCase {
  constructor(private readonly repository: UserGroupRepositoryPort) {}

  async execute(data: CreateUserGroupDto, ownerId: string): Promise<UserGroup> {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error("User group name is required");
    }
    return this.repository.create(data, ownerId);
  }
}
