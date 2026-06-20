import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/infrastructure/auth/auth";
import { MongoUserGroupRepository } from "@/src/infrastructure/database/mongoose/repositories/user-group.repository";
import { GetUserGroupUseCase } from "@/src/core/application/use-cases/get-user-group.use-case";
import { UpdateUserGroupUseCase } from "@/src/core/application/use-cases/update-user-group.use-case";
import { DeleteUserGroupUseCase } from "@/src/core/application/use-cases/delete-user-group.use-case";
import { LeaveUserGroupUseCase } from "@/src/core/application/use-cases/leave-user-group.use-case";
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const baseUrl = request.nextUrl.origin;
    const useCase = new GetUserGroupUseCase(repository);
    const group = await useCase.execute(id);
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }
    if (!group.members.includes(session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(toResponseDto(group, baseUrl));
  } catch (error) {
    console.error("Error getting user group:", error);
    return NextResponse.json(
      { error: "Failed to get user group" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const baseUrl = request.nextUrl.origin;
    const body = await request.json();
    const useCase = new UpdateUserGroupUseCase(repository);
    const group = await useCase.execute(id, body, session.user.id);
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }
    return NextResponse.json(toResponseDto(group, baseUrl));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Only the owner can update this group"
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Error updating user group:", error);
    return NextResponse.json(
      { error: "Failed to update user group" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const useCase = new DeleteUserGroupUseCase(repository);
    const deleted = await useCase.execute(id, session.user.id);
    if (!deleted) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Only the owner can delete this group"
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Error deleting user group:", error);
    return NextResponse.json(
      { error: "Failed to delete user group" },
      { status: 500 }
    );
  }
}
