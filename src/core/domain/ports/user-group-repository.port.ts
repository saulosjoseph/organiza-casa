import { UserGroup } from "@/src/core/domain/entities/user-group.entity";
import {
  CreateUserGroupDto,
  UpdateUserGroupDto,
} from "@/src/core/application/dto/user-group.dto";

export interface UserGroupRepositoryPort {
  create(data: CreateUserGroupDto, ownerId: string): Promise<UserGroup>;
  findAll(): Promise<UserGroup[]>;
  findById(id: string): Promise<UserGroup | null>;
  findByMember(userId: string): Promise<UserGroup[]>;
  findByInviteCode(code: string): Promise<UserGroup | null>;
  update(id: string, data: UpdateUserGroupDto): Promise<UserGroup | null>;
  addMember(id: string, userId: string): Promise<UserGroup | null>;
  removeMember(id: string, userId: string): Promise<UserGroup | null>;
  delete(id: string): Promise<boolean>;
}
