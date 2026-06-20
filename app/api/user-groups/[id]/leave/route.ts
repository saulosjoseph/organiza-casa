import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/infrastructure/auth/auth";
import { MongoUserGroupRepository } from "@/src/infrastructure/database/mongoose/repositories/user-group.repository";
import { LeaveUserGroupUseCase } from "@/src/core/application/use-cases/leave-user-group.use-case";

const repository = new MongoUserGroupRepository();

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const useCase = new LeaveUserGroupUseCase(repository);
    const group = await useCase.execute(id, session.user.id);
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Left group successfully" });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Owner cannot leave")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error leaving user group:", error);
    return NextResponse.json(
      { error: "Failed to leave group" },
      { status: 500 }
    );
  }
}
