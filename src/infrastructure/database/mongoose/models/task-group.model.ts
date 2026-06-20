import mongoose, { Schema, Document } from "mongoose";

export interface TaskGroupDocument extends Document {
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const TaskGroupSchema = new Schema<TaskGroupDocument>(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

export const TaskGroupModel =
  mongoose.models.TaskGroup ||
  mongoose.model<TaskGroupDocument>("TaskGroup", TaskGroupSchema);
