import { NextRequest, NextResponse } from "next/server";
import { MongoTaskGroupRepository } from "@/src/infrastructure/database/mongoose/repositories/task-group.repository";
import { ListTaskGroupsUseCase } from "@/src/core/application/use-cases/list-task-groups.use-case";
import { CreateTaskGroupUseCase } from "@/src/core/application/use-cases/create-task-group.use-case";
import { TaskGroupResponseDto } from "@/src/core/application/dto/task-group.dto";
import { TaskGroup } from "@/src/core/domain/entities/task-group.entity";

function toResponseDto(group: TaskGroup): TaskGroupResponseDto {
  return {
    id: group.id,
    name: group.name,
    description: group.description,
    userGroupId: group.userGroupId,
    assignedTo: group.assignedTo,
    createdAt: group.createdAt.toISOString(),
    updatedAt: group.updatedAt.toISOString(),
  };
}

const repository = new MongoTaskGroupRepository();

export async function GET() {
  try {
    const useCase = new ListTaskGroupsUseCase(repository);
    const groups = await useCase.execute();
    return NextResponse.json(groups.map(toResponseDto));
  } catch (error) {
    console.error("Error listing task groups:", error);
    return NextResponse.json(
      { error: "Failed to list task groups" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const useCase = new CreateTaskGroupUseCase(repository);
    const group = await useCase.execute(body);
    return NextResponse.json(toResponseDto(group), { status: 201 });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Task group name is required"
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error creating task group:", error);
    return NextResponse.json(
      { error: "Failed to create task group" },
      { status: 500 }
    );
  }
}
