import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/src/infrastructure/database/mongoose/connection";
import { TaskModel } from "@/src/infrastructure/database/mongoose/models/task.model";
import { TaskCompletionModel } from "@/src/infrastructure/database/mongoose/models/task-completion.model";

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
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end };
}

function getPreviousPeriodBounds(recurrence: string): { start: Date; end: Date } {
  const now = new Date();
  if (recurrence === "daily") {
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start = new Date(end);
    start.setDate(start.getDate() - 1);
    return { start, end };
  }
  if (recurrence === "weekly") {
    const day = now.getDay();
    const diff = day === 0 ? 6 : day - 1;
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
    const start = new Date(end);
    start.setDate(start.getDate() - 7);
    return { start, end };
  }
  const end = new Date(now.getFullYear(), now.getMonth(), 1);
  const start = new Date(end.getFullYear(), end.getMonth() - 1, 1);
  return { start, end };
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();

    const now = new Date();
    let markedOverdue = 0;

    // 1. Non-recurrent tasks: overdue if dueDate < now and not done
    const dueDateResult = await TaskModel.updateMany(
      {
        status: { $ne: "done" },
        recurrence: null,
        dueDate: { $ne: null, $lt: now },
        overdue: { $ne: true },
      },
      { $set: { overdue: true } }
    );
    markedOverdue += dueDateResult.modifiedCount;

    // 2. Recurrent tasks: check if previous period was incomplete
    const recurrentTasks = await TaskModel.find({
      recurrence: { $ne: null },
    });

    for (const task of recurrentTasks) {
      const { start, end } = getPreviousPeriodBounds(task.recurrence!);
      const completions = await TaskCompletionModel.countDocuments({
        taskId: task._id,
        completedAt: { $gte: start, $lt: end },
      });

      if (completions < (task.recurrenceQuantity ?? 1)) {
        if (!task.overdue) {
          await TaskModel.findByIdAndUpdate(task._id, { overdue: true });
          markedOverdue++;
        }
      }

      // Reset status for new period (recurrent tasks restart each period)
      if (task.status === "done") {
        const currentPeriod = getPeriodBounds(task.recurrence!);
        const currentCompletions = await TaskCompletionModel.countDocuments({
          taskId: task._id,
          completedAt: { $gte: currentPeriod.start, $lt: currentPeriod.end },
        });
        if (currentCompletions < (task.recurrenceQuantity ?? 1)) {
          await TaskModel.findByIdAndUpdate(task._id, {
            status: "pending",
            overdue: false,
          });
        }
      }
    }

    // 3. Reset overdue for done non-recurrent tasks
    const resetResult = await TaskModel.updateMany(
      {
        status: "done",
        recurrence: null,
        overdue: true,
      },
      { $set: { overdue: false } }
    );

    return NextResponse.json({
      success: true,
      markedOverdue,
      resetOverdue: resetResult.modifiedCount,
      checkedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("Error running overdue check cron:", error);
    return NextResponse.json(
      { error: "Failed to run overdue check" },
      { status: 500 }
    );
  }
}
