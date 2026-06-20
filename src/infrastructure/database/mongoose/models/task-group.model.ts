import mongoose, { Schema, Document } from "mongoose";

export interface TaskGroupDocument extends Document {
  name: string;
  description: string;
  assignedTo: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const TaskGroupSchema = new Schema<TaskGroupDocument>(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    assignedTo: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

export const TaskGroupModel =
  mongoose.models.TaskGroup ||
  mongoose.model<TaskGroupDocument>("TaskGroup", TaskGroupSchema);
