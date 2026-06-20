import { NextRequest, NextResponse } from "next/server";
import { MongoTaskRepository } from "@/src/infrastructure/database/mongoose/repositories/task.repository";
import { MongoTaskCompletionRepository } from "@/src/infrastructure/database/mongoose/repositories/task-completion.repository";
import { auth } from "@/src/infrastructure/auth/auth";

const taskRepository = new MongoTaskRepository();
const completionRepository = new MongoTaskCompletionRepository();

function getPeriodBounds(recurrence: string): { start: Date; end: Date } {
  const now = new Date();
  if (recurrence === "daily") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }
  if (recurrence === "weekly") {
    const day = now.getDay();
    const diff = day === 0 ? 6 : day - 1;
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return { start, end };
  }
  // monthly
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id || null;
    const { id } = await params;

    const task = await taskRepository.findById(id);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Register completion
    const completion = await completionRepository.create(id, userId);

    // For recurrent tasks, check if quantity is met
    if (task.recurrence) {
      const { start, end } = getPeriodBounds(task.recurrence);
      const count = await completionRepository.countInPeriod(id, start, end);

      if (count >= task.recurrenceQuantity) {
        await taskRepository.update(id, { status: "done" });
      } else {
        await taskRepository.update(id, { status: "in_progress" });
      }
    } else {
      await taskRepository.update(id, { status: "done" });
    }

    // Get updated completions count for response
    let completionsInPeriod = 1;
    if (task.recurrence) {
      const { start, end } = getPeriodBounds(task.recurrence);
      completionsInPeriod = await completionRepository.countInPeriod(id, start, end);
    }

    return NextResponse.json({
      completion: {
        id: completion.id,
        taskId: completion.taskId,
        completedBy: completion.completedBy,
        completedAt: completion.completedAt.toISOString(),
      },
      completionsInPeriod,
    });
  } catch (error) {
    console.error("Error completing task:", error);
    return NextResponse.json(
      { error: "Failed to complete task" },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get task to determine period
    const task = await taskRepository.findById(id);
    let completionsInPeriod = 0;

    if (task?.recurrence) {
      const { start, end } = getPeriodBounds(task.recurrence);
      completionsInPeriod = await completionRepository.countInPeriod(id, start, end);
    }

    const completions = await completionRepository.findByTask(id);
    return NextResponse.json({
      completionsInPeriod,
      completions: completions.map((c) => ({
        id: c.id,
        taskId: c.taskId,
        completedBy: c.completedBy,
        completedAt: c.completedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching completions:", error);
    return NextResponse.json(
      { error: "Failed to fetch completions" },
      { status: 500 }
    );
  }
}
