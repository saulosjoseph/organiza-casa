import { User } from "@/src/core/domain/entities/user.entity";

export interface CreateUserDto {
  email: string;
  name: string;
  image?: string | null;
  googleId: string;
}

export interface UpdateUserDto {
  name?: string;
  image?: string | null;
}

export interface UserResponseDto {
  id: string;
  email: string;
  name: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

export function toUserResponseDto(user: User): UserResponseDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
