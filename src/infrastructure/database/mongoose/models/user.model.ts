import mongoose, { Schema, Document } from "mongoose";

export interface UserDocument extends Document {
  email: string;
  name: string;
  image: string | null;
  googleId: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    image: { type: String, default: null },
    googleId: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

export const UserModel =
  mongoose.models.User || mongoose.model<UserDocument>("User", UserSchema);
