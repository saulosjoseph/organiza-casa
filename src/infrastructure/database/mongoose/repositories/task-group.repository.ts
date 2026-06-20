import { TaskGroup } from "@/src/core/domain/entities/task-group.entity";
import { TaskGroupRepositoryPort } from "@/src/core/domain/ports/task-group-repository.port";
import {
  CreateTaskGroupDto,
  UpdateTaskGroupDto,
} from "@/src/core/application/dto/task-group.dto";
import {
  TaskGroupModel,
  TaskGroupDocument,
} from "@/src/infrastructure/database/mongoose/models/task-group.model";
import { connectToDatabase } from "@/src/infrastructure/database/mongoose/connection";

function toEntity(doc: TaskGroupDocument): TaskGroup {
  return {
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description,
    userGroupId: doc.userGroupId ? doc.userGroupId.toString() : null,
    assignedTo: doc.assignedTo ? doc.assignedTo.toString() : null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export class MongoTaskGroupRepository implements TaskGroupRepositoryPort {
  async create(data: CreateTaskGroupDto): Promise<TaskGroup> {
    await connectToDatabase();
    const doc = await TaskGroupModel.create({
      name: data.name,
      description: data.description ?? "",
      userGroupId: data.userGroupId ?? null,
      assignedTo: data.assignedTo ?? null,
    });
    return toEntity(doc as TaskGroupDocument);
  }

  async findAll(): Promise<TaskGroup[]> {
    await connectToDatabase();
    const docs = await TaskGroupModel.find().sort({ createdAt: -1 }).lean();
    return docs.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
      userGroupId: doc.userGroupId ? doc.userGroupId.toString() : null,
      assignedTo: doc.assignedTo ? doc.assignedTo.toString() : null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  }

  async findById(id: string): Promise<TaskGroup | null> {
    await connectToDatabase();
    const doc = await TaskGroupModel.findById(id);
    return doc ? toEntity(doc as TaskGroupDocument) : null;
  }

  async update(
    id: string,
    data: UpdateTaskGroupDto
  ): Promise<TaskGroup | null> {
    await connectToDatabase();
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.userGroupId !== undefined) updateData.userGroupId = data.userGroupId;
    if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo;

    const doc = await TaskGroupModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    return doc ? toEntity(doc as TaskGroupDocument) : null;
  }

  async delete(id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await TaskGroupModel.findByIdAndDelete(id);
    return result !== null;
  }
}
