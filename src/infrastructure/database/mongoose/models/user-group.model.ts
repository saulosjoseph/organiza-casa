import mongoose, { Schema, Document } from "mongoose";
import crypto from "crypto";

export interface UserGroupDocument extends Document {
  name: string;
  description: string;
  ownerId: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  inviteCode: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserGroupSchema = new Schema<UserGroupDocument>(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    inviteCode: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomBytes(6).toString("hex"),
    },
  },
  {
    timestamps: true,
  }
);

export const UserGroupModel =
  mongoose.models.UserGroup ||
  mongoose.model<UserGroupDocument>("UserGroup", UserGroupSchema);
