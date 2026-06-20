import { Task } from "@/src/core/domain/entities/task.entity";
import { TaskRepositoryPort } from "@/src/core/domain/ports/task-repository.port";
import { CreateTaskDto, UpdateTaskDto } from "@/src/core/application/dto/task.dto";
import { TaskModel, TaskDocument } from "@/src/infrastructure/database/mongoose/models/task.model";
import { connectToDatabase } from "@/src/infrastructure/database/mongoose/connection";

function toEntity(doc: TaskDocument): Task {
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    status: doc.status,
    groupId: doc.groupId ? doc.groupId.toString() : null,
    userGroupId: doc.userGroupId ? doc.userGroupId.toString() : null,
    assignedTo: doc.assignedTo ? doc.assignedTo.toString() : null,
    dueDate: doc.dueDate,
    recurrence: doc.recurrence ?? null,
    recurrenceQuantity: doc.recurrenceQuantity ?? 1,
    overdue: doc.overdue ?? false,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export class MongoTaskRepository implements TaskRepositoryPort {
  async create(data: CreateTaskDto): Promise<Task> {
    await connectToDatabase();
    const doc = await TaskModel.create({
      title: data.title,
      description: data.description ?? "",
      status: data.status ?? "pending",
      groupId: data.groupId ?? null,
      userGroupId: data.userGroupId ?? null,
      assignedTo: data.assignedTo ?? null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      recurrence: data.recurrence ?? null,
      recurrenceQuantity: data.recurrenceQuantity ?? 1,
    });
    return toEntity(doc as TaskDocument);
  }

  async findAll(): Promise<Task[]> {
    await connectToDatabase();
    const docs = await TaskModel.find().sort({ createdAt: -1 }).lean();
    return docs.map((doc) => ({
      id: doc._id.toString(),
      title: doc.title,
      description: doc.description,
      status: doc.status,
      groupId: doc.groupId ? doc.groupId.toString() : null,
      userGroupId: doc.userGroupId ? doc.userGroupId.toString() : null,
      assignedTo: doc.assignedTo ? doc.assignedTo.toString() : null,
      dueDate: doc.dueDate,
      recurrence: (doc as unknown as { recurrence: string | null }).recurrence ?? null,
      recurrenceQuantity: (doc as unknown as { recurrenceQuantity: number }).recurrenceQuantity ?? 1,
      overdue: (doc as unknown as { overdue: boolean }).overdue ?? false,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  }

  async findById(id: string): Promise<Task | null> {
    await connectToDatabase();
    const doc = await TaskModel.findById(id);
    return doc ? toEntity(doc as TaskDocument) : null;
  }

  async update(id: string, data: UpdateTaskDto): Promise<Task | null> {
    await connectToDatabase();
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.groupId !== undefined) updateData.groupId = data.groupId;
    if (data.userGroupId !== undefined) updateData.userGroupId = data.userGroupId;
    if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo;
    if (data.dueDate !== undefined)
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.recurrence !== undefined) updateData.recurrence = data.recurrence;
    if (data.recurrenceQuantity !== undefined) updateData.recurrenceQuantity = data.recurrenceQuantity;

    const doc = await TaskModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    return doc ? toEntity(doc as TaskDocument) : null;
  }

  async delete(id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await TaskModel.findByIdAndDelete(id);
    return result !== null;
  }
}
