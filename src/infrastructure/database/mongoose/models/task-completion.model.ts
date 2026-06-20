import mongoose, { Schema, Document } from "mongoose";

export interface TaskCompletionDocument extends Document {
  taskId: mongoose.Types.ObjectId;
  completedBy: mongoose.Types.ObjectId | null;
  completedAt: Date;
}

const TaskCompletionSchema = new Schema<TaskCompletionDocument>({
  taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true },
  completedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  completedAt: { type: Date, default: () => new Date() },
});

TaskCompletionSchema.index({ taskId: 1, completedAt: -1 });

export const TaskCompletionModel =
  mongoose.models.TaskCompletion ||
  mongoose.model<TaskCompletionDocument>("TaskCompletion", TaskCompletionSchema);
