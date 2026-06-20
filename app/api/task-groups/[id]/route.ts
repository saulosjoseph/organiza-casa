import { NextRequest, NextResponse } from "next/server";
import { MongoTaskGroupRepository } from "@/src/infrastructure/database/mongoose/repositories/task-group.repository";
import { MongoTaskRepository } from "@/src/infrastructure/database/mongoose/repositories/task.repository";
import { GetTaskGroupUseCase } from "@/src/core/application/use-cases/get-task-group.use-case";
import { UpdateTaskGroupUseCase } from "@/src/core/application/use-cases/update-task-group.use-case";
import { DeleteTaskGroupUseCase } from "@/src/core/application/use-cases/delete-task-group.use-case";
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
const taskRepository = new MongoTaskRepository();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const useCase = new GetTaskGroupUseCase(repository);
    const group = await useCase.execute(id);
    if (!group) {
      return NextResponse.json(
        { error: "Task group not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(toResponseDto(group));
  } catch (error) {
    console.error("Error getting task group:", error);
    return NextResponse.json(
      { error: "Failed to get task group" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { applyAssignedToAllTasks, ...updateData } = body;
    const useCase = new UpdateTaskGroupUseCase(repository);
    const group = await useCase.execute(id, updateData);
    if (!group) {
      return NextResponse.json(
        { error: "Task group not found" },
        { status: 404 }
      );
    }

    if (applyAssignedToAllTasks && updateData.assignedTo !== undefined) {
      await taskRepository.updateManyByGroupId(id, {
        assignedTo: updateData.assignedTo,
      });
    }

    return NextResponse.json(toResponseDto(group));
  } catch (error) {
    console.error("Error updating task group:", error);
    return NextResponse.json(
      { error: "Failed to update task group" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const useCase = new DeleteTaskGroupUseCase(repository);
    const deleted = await useCase.execute(id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Task group not found" },
        { status: 404 }
      );
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting task group:", error);
    return NextResponse.json(
      { error: "Failed to delete task group" },
      { status: 500 }
    );
  }
}
