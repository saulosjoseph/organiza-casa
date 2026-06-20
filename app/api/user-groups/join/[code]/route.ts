import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/infrastructure/auth/auth";
import { MongoUserGroupRepository } from "@/src/infrastructure/database/mongoose/repositories/user-group.repository";
import { JoinUserGroupUseCase } from "@/src/core/application/use-cases/join-user-group.use-case";
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
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await params;
    const baseUrl = request.nextUrl.origin;
    const useCase = new JoinUserGroupUseCase(repository);
    const group = await useCase.execute(code, session.user.id);
    return NextResponse.json(toResponseDto(group, baseUrl));
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid invite code") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error("Error joining user group:", error);
    return NextResponse.json(
      { error: "Failed to join group" },
      { status: 500 }
    );
  }
}
