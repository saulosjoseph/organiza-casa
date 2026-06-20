import { UserGroup } from "@/src/core/domain/entities/user-group.entity";
import { UserGroupRepositoryPort } from "@/src/core/domain/ports/user-group-repository.port";
import {
  CreateUserGroupDto,
  UpdateUserGroupDto,
} from "@/src/core/application/dto/user-group.dto";
import {
  UserGroupModel,
  UserGroupDocument,
} from "@/src/infrastructure/database/mongoose/models/user-group.model";
import { connectToDatabase } from "@/src/infrastructure/database/mongoose/connection";

function toEntity(doc: UserGroupDocument): UserGroup {
  return {
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description,
    ownerId: doc.ownerId.toString(),
    members: doc.members.map((m) => m.toString()),
    inviteCode: doc.inviteCode,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export class MongoUserGroupRepository implements UserGroupRepositoryPort {
  async create(data: CreateUserGroupDto, ownerId: string): Promise<UserGroup> {
    await connectToDatabase();
    const doc = await UserGroupModel.create({
      name: data.name,
      description: data.description ?? "",
      ownerId,
      members: [ownerId],
    });
    return toEntity(doc as UserGroupDocument);
  }

  async findAll(): Promise<UserGroup[]> {
    await connectToDatabase();
    const docs = await UserGroupModel.find().sort({ createdAt: -1 }).lean();
    return docs.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
      ownerId: doc.ownerId.toString(),
      members: (doc.members as { toString(): string }[]).map((m) => m.toString()),
      inviteCode: doc.inviteCode,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  }

  async findById(id: string): Promise<UserGroup | null> {
    await connectToDatabase();
    const doc = await UserGroupModel.findById(id);
    return doc ? toEntity(doc as UserGroupDocument) : null;
  }

  async findByMember(userId: string): Promise<UserGroup[]> {
    await connectToDatabase();
    const docs = await UserGroupModel.find({ members: userId })
      .sort({ createdAt: -1 })
      .lean();
    return docs.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
      ownerId: doc.ownerId.toString(),
      members: (doc.members as { toString(): string }[]).map((m) => m.toString()),
      inviteCode: doc.inviteCode,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  }

  async findByInviteCode(code: string): Promise<UserGroup | null> {
    await connectToDatabase();
    const doc = await UserGroupModel.findOne({ inviteCode: code });
    return doc ? toEntity(doc as UserGroupDocument) : null;
  }

  async update(
    id: string,
    data: UpdateUserGroupDto
  ): Promise<UserGroup | null> {
    await connectToDatabase();
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;

    const doc = await UserGroupModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    return doc ? toEntity(doc as UserGroupDocument) : null;
  }

  async addMember(id: string, userId: string): Promise<UserGroup | null> {
    await connectToDatabase();
    const doc = await UserGroupModel.findByIdAndUpdate(
      id,
      { $addToSet: { members: userId } },
      { new: true }
    );
    return doc ? toEntity(doc as UserGroupDocument) : null;
  }

  async removeMember(id: string, userId: string): Promise<UserGroup | null> {
    await connectToDatabase();
    const doc = await UserGroupModel.findByIdAndUpdate(
      id,
      { $pull: { members: userId } },
      { new: true }
    );
    return doc ? toEntity(doc as UserGroupDocument) : null;
  }

  async delete(id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await UserGroupModel.findByIdAndDelete(id);
    return result !== null;
  }
}
