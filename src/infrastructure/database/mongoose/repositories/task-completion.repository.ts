import { TaskCompletion } from "@/src/core/domain/entities/task-completion.entity";
import { TaskCompletionRepositoryPort } from "@/src/core/domain/ports/task-completion-repository.port";
import {
  TaskCompletionModel,
  TaskCompletionDocument,
} from "@/src/infrastructure/database/mongoose/models/task-completion.model";
import { connectToDatabase } from "@/src/infrastructure/database/mongoose/connection";

function toEntity(doc: TaskCompletionDocument): TaskCompletion {
  return {
    id: doc._id.toString(),
    taskId: doc.taskId.toString(),
    completedBy: doc.completedBy ? doc.completedBy.toString() : null,
    completedAt: doc.completedAt,
  };
}

export class MongoTaskCompletionRepository implements TaskCompletionRepositoryPort {
  async create(taskId: string, completedBy: string | null): Promise<TaskCompletion> {
    await connectToDatabase();
    const doc = await TaskCompletionModel.create({
      taskId,
      completedBy,
      completedAt: new Date(),
    });
    return toEntity(doc as TaskCompletionDocument);
  }

  async countInPeriod(taskId: string, periodStart: Date, periodEnd: Date): Promise<number> {
    await connectToDatabase();
    return TaskCompletionModel.countDocuments({
      taskId,
      completedAt: { $gte: periodStart, $lt: periodEnd },
    });
  }

  async findByTask(taskId: string): Promise<TaskCompletion[]> {
    await connectToDatabase();
    const docs = await TaskCompletionModel.find({ taskId }).sort({ completedAt: -1 });
    return docs.map((doc) => toEntity(doc as TaskCompletionDocument));
  }

  async deleteLatestInPeriod(taskId: string, periodStart: Date, periodEnd: Date): Promise<boolean> {
    await connectToDatabase();
    const doc = await TaskCompletionModel.findOneAndDelete(
      {
        taskId,
        completedAt: { $gte: periodStart, $lt: periodEnd },
      },
      { sort: { completedAt: -1 } }
    );
    return doc !== null;
  }
}
