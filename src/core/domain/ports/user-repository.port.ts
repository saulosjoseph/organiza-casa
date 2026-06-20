import { User } from "@/src/core/domain/entities/user.entity";
import { CreateUserDto, UpdateUserDto } from "@/src/core/application/dto/user.dto";

export interface UserRepositoryPort {
  findByGoogleId(googleId: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: CreateUserDto): Promise<User>;
  update(id: string, data: UpdateUserDto): Promise<User | null>;
  upsertByGoogleId(data: CreateUserDto): Promise<User>;
}
