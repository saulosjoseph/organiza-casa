import { NextRequest, NextResponse } from "next/server";
import { MongoTaskRepository } from "@/src/infrastructure/database/mongoose/repositories/task.repository";
import { GetTaskUseCase } from "@/src/core/application/use-cases/get-task.use-case";
import { UpdateTaskUseCase } from "@/src/core/application/use-cases/update-task.use-case";
import { DeleteTaskUseCase } from "@/src/core/application/use-cases/delete-task.use-case";
import { TaskResponseDto } from "@/src/core/application/dto/task.dto";
import { Task } from "@/src/core/domain/entities/task.entity";

function toResponseDto(task: Task): TaskResponseDto {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    groupId: task.groupId,
    userGroupId: task.userGroupId,
    assignedTo: task.assignedTo,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    recurrence: task.recurrence,
    overdue: task.overdue,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

const repository = new MongoTaskRepository();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const useCase = new GetTaskUseCase(repository);
    const task = await useCase.execute(id);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json(toResponseDto(task));
  } catch (error) {
    console.error("Error getting task:", error);
    return NextResponse.json(
      { error: "Failed to get task" },
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
    const useCase = new UpdateTaskUseCase(repository);
    const task = await useCase.execute(id, body);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json(toResponseDto(task));
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
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
    const useCase = new DeleteTaskUseCase(repository);
    const deleted = await useCase.execute(id);
    if (!deleted) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
