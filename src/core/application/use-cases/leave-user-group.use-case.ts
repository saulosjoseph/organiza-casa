import { UserGroup } from "@/src/core/domain/entities/user-group.entity";
import { UserGroupRepositoryPort } from "@/src/core/domain/ports/user-group-repository.port";

export class LeaveUserGroupUseCase {
  constructor(private readonly repository: UserGroupRepositoryPort) {}

  async execute(groupId: string, userId: string): Promise<UserGroup | null> {
    const group = await this.repository.findById(groupId);
    if (!group) return null;
    if (group.ownerId === userId) {
      throw new Error("Owner cannot leave the group. Transfer ownership or delete it.");
    }
    return this.repository.removeMember(groupId, userId);
  }
}
