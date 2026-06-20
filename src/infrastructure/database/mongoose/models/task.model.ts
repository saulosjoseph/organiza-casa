import mongoose, { Schema, Document } from "mongoose";
import { TaskStatus } from "@/src/core/domain/entities/task.entity";

export interface TaskDocument extends Document {
  title: string;
  description: string;
  status: TaskStatus;
  groupId: mongoose.Types.ObjectId | null;
  userGroupId: mongoose.Types.ObjectId | null;
  assignedTo: mongoose.Types.ObjectId | null;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<TaskDocument>(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "in_progress", "done"],
      default: "pending",
    },
    groupId: { type: Schema.Types.ObjectId, ref: "TaskGroup", default: null },
    userGroupId: { type: Schema.Types.ObjectId, ref: "UserGroup", default: null },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", default: null },
    dueDate: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

export const TaskModel =
  mongoose.models.Task ||
  mongoose.model<TaskDocument>("Task", TaskSchema);
