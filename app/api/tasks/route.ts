import { NextRequest, NextResponse } from "next/server";
import { MongoTaskRepository } from "@/src/infrastructure/database/mongoose/repositories/task.repository";
import { ListTasksUseCase } from "@/src/core/application/use-cases/list-tasks.use-case";
import { CreateTaskUseCase } from "@/src/core/application/use-cases/create-task.use-case";
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

export async function GET() {
  try {
    const useCase = new ListTasksUseCase(repository);
    const tasks = await useCase.execute();
    return NextResponse.json(tasks.map(toResponseDto));
  } catch (error) {
    console.error("Error listing tasks:", error);
    return NextResponse.json(
      { error: "Failed to list tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const useCase = new CreateTaskUseCase(repository);
    const task = await useCase.execute(body);
    return NextResponse.json(toResponseDto(task), { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Task title is required") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
