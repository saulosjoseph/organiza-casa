import { User } from "@/src/core/domain/entities/user.entity";
import { UserRepositoryPort } from "@/src/core/domain/ports/user-repository.port";
import { CreateUserDto, UpdateUserDto } from "@/src/core/application/dto/user.dto";
import {
  UserModel,
  UserDocument,
} from "@/src/infrastructure/database/mongoose/models/user.model";
import { connectToDatabase } from "@/src/infrastructure/database/mongoose/connection";

function toEntity(doc: UserDocument): User {
  return {
    id: doc._id.toString(),
    email: doc.email,
    name: doc.name,
    image: doc.image,
    googleId: doc.googleId,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export class MongoUserRepository implements UserRepositoryPort {
  async findByGoogleId(googleId: string): Promise<User | null> {
    await connectToDatabase();
    const doc = await UserModel.findOne({ googleId });
    return doc ? toEntity(doc as UserDocument) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    await connectToDatabase();
    const doc = await UserModel.findOne({ email });
    return doc ? toEntity(doc as UserDocument) : null;
  }

  async findById(id: string): Promise<User | null> {
    await connectToDatabase();
    const doc = await UserModel.findById(id);
    return doc ? toEntity(doc as UserDocument) : null;
  }

  async create(data: CreateUserDto): Promise<User> {
    await connectToDatabase();
    const doc = await UserModel.create({
      email: data.email,
      name: data.name,
      image: data.image ?? null,
      googleId: data.googleId,
    });
    return toEntity(doc as UserDocument);
  }

  async update(id: string, data: UpdateUserDto): Promise<User | null> {
    await connectToDatabase();
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.image !== undefined) updateData.image = data.image;

    const doc = await UserModel.findByIdAndUpdate(id, updateData, { new: true });
    return doc ? toEntity(doc as UserDocument) : null;
  }

  async upsertByGoogleId(data: CreateUserDto): Promise<User> {
    await connectToDatabase();
    const doc = await UserModel.findOneAndUpdate(
      { googleId: data.googleId },
      {
        $set: {
          email: data.email,
          name: data.name,
          image: data.image ?? null,
        },
        $setOnInsert: { googleId: data.googleId },
      },
      { upsert: true, new: true }
    );
    return toEntity(doc as UserDocument);
  }
}
