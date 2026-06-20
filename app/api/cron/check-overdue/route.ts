import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/src/infrastructure/database/mongoose/connection";
import { TaskModel } from "@/src/infrastructure/database/mongoose/models/task.model";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();

    const now = new Date();

    const result = await TaskModel.updateMany(
      {
        status: { $ne: "done" },
        dueDate: { $ne: null, $lt: now },
        overdue: { $ne: true },
      },
      { $set: { overdue: true } }
    );

    // Also reset overdue for tasks that are now done
    const resetResult = await TaskModel.updateMany(
      {
        status: "done",
        overdue: true,
      },
      { $set: { overdue: false } }
    );

    return NextResponse.json({
      success: true,
      markedOverdue: result.modifiedCount,
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
