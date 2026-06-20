import { UserGroup } from "@/src/core/domain/entities/user-group.entity";
import { UserGroupRepositoryPort } from "@/src/core/domain/ports/user-group-repository.port";
import { UpdateUserGroupDto } from "@/src/core/application/dto/user-group.dto";

export class UpdateUserGroupUseCase {
  constructor(private readonly repository: UserGroupRepositoryPort) {}

  async execute(
    id: string,
    data: UpdateUserGroupDto,
    userId: string
  ): Promise<UserGroup | null> {
    const group = await this.repository.findById(id);
    if (!group) return null;
    if (group.ownerId !== userId) {
      throw new Error("Only the owner can update this group");
    }
    return this.repository.update(id, data);
  }
}
