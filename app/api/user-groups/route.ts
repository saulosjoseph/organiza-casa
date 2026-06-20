import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/infrastructure/auth/auth.config";
import { MongoUserGroupRepository } from "@/src/infrastructure/database/mongoose/repositories/user-group.repository";
import { ListUserGroupsUseCase } from "@/src/core/application/use-cases/list-user-groups.use-case";
import { CreateUserGroupUseCase } from "@/src/core/application/use-cases/create-user-group.use-case";
import { UserGroupResponseDto } from "@/src/core/application/dto/user-group.dto";
import { UserGroup } from "@/src/core/domain/entities/user-group.entity";

function toResponseDto(group: UserGroup, baseUrl: string): UserGroupResponseDto {
  return {
    id: group.id,
    name: group.name,
    description: group.description,
    ownerId: group.ownerId,
    members: group.members,
    inviteCode: group.inviteCode,
    inviteLink: `${baseUrl}/api/user-groups/join/${group.inviteCode}`,
    createdAt: group.createdAt.toISOString(),
    updatedAt: group.updatedAt.toISOString(),
  };
}

const repository = new MongoUserGroupRepository();

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const baseUrl = request.nextUrl.origin;
    const useCase = new ListUserGroupsUseCase(repository);
    const groups = await useCase.execute(session.user.id);
    return NextResponse.json(groups.map((g) => toResponseDto(g, baseUrl)));
  } catch (error) {
    console.error("Error listing user groups:", error);
    return NextResponse.json(
      { error: "Failed to list user groups" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const baseUrl = request.nextUrl.origin;
    const body = await request.json();
    const useCase = new CreateUserGroupUseCase(repository);
    const group = await useCase.execute(body, session.user.id);
    return NextResponse.json(toResponseDto(group, baseUrl), { status: 201 });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "User group name is required"
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error creating user group:", error);
    return NextResponse.json(
      { error: "Failed to create user group" },
      { status: 500 }
    );
  }
}
