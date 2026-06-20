import { UserGroupRepositoryPort } from "@/src/core/domain/ports/user-group-repository.port";

export class DeleteUserGroupUseCase {
  constructor(private readonly repository: UserGroupRepositoryPort) {}

  async execute(id: string, userId: string): Promise<boolean> {
    const group = await this.repository.findById(id);
    if (!group) return false;
    if (group.ownerId !== userId) {
      throw new Error("Only the owner can delete this group");
    }
    return this.repository.delete(id);
  }
}
