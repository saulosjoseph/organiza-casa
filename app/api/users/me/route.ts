import { NextResponse } from "next/server";
import { auth } from "@/src/infrastructure/auth/auth";
import { MongoUserRepository } from "@/src/infrastructure/database/mongoose/repositories/user.repository";
import { toUserResponseDto } from "@/src/core/application/dto/user.dto";

const repository = new MongoUserRepository();

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await repository.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(toUserResponseDto(user));
  } catch (error) {
    console.error("Error getting current user:", error);
    return NextResponse.json(
      { error: "Failed to get user" },
      { status: 500 }
    );
  }
}
