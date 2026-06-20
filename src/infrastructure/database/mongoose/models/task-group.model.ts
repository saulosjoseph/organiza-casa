import mongoose, { Schema, Document } from "mongoose";

export interface TaskGroupDocument extends Document {
  name: string;
  description: string;
  userGroupId: mongoose.Types.ObjectId | null;
  assignedTo: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const TaskGroupSchema = new Schema<TaskGroupDocument>(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    userGroupId: { type: Schema.Types.ObjectId, ref: "UserGroup", default: null },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  {
    timestamps: true,
  }
);

export const TaskGroupModel =
  mongoose.models.TaskGroup ||
  mongoose.model<TaskGroupDocument>("TaskGroup", TaskGroupSchema);
