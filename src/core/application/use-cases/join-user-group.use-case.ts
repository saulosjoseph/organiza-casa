import { UserGroup } from "@/src/core/domain/entities/user-group.entity";
import { UserGroupRepositoryPort } from "@/src/core/domain/ports/user-group-repository.port";

export class JoinUserGroupUseCase {
  constructor(private readonly repository: UserGroupRepositoryPort) {}

  async execute(inviteCode: string, userId: string): Promise<UserGroup> {
    const group = await this.repository.findByInviteCode(inviteCode);
    if (!group) {
      throw new Error("Invalid invite code");
    }
    if (group.members.includes(userId)) {
      return group;
    }
    const updated = await this.repository.addMember(group.id, userId);
    if (!updated) {
      throw new Error("Failed to join group");
    }
    return updated;
  }
}
