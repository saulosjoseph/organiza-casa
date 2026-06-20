import { auth } from "@/src/infrastructure/auth/auth";
import { TaskModel } from "@/src/infrastructure/database/mongoose/models/task.model";
import { TaskCompletionModel } from "@/src/infrastructure/database/mongoose/models/task-completion.model";
import { connectToDatabase } from "@/src/infrastructure/database/mongoose/connection";

function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function getTotalWeeks(year: number): number {
  const dec28 = new Date(Date.UTC(year, 11, 28));
  return getWeekNumber(dec28);
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

function getTotalDays(year: number): number {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function getTaskStats(userId: string) {
  await connectToDatabase();

  const [pendingCount, inProgressCount] = await Promise.all([
    TaskModel.countDocuments({ assignedTo: userId, status: "pending" }),
    TaskModel.countDocuments({ assignedTo: userId, status: "in_progress" }),
  ]);

  const now = new Date();
  const weekStart = getWeekStart(now);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const [completedWeek, completedYear] = await Promise.all([
    TaskCompletionModel.countDocuments({
      completedBy: userId,
      completedAt: { $gte: weekStart },
    }),
    TaskCompletionModel.countDocuments({
      completedBy: userId,
      completedAt: { $gte: yearStart },
    }),
  ]);

  return { pendingCount, inProgressCount, completedWeek, completedYear };
}

export async function AppHeader() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const now = new Date();
  const week = getWeekNumber(now);
  const totalWeeks = getTotalWeeks(now.getFullYear());
  const dayOfYear = getDayOfYear(now);
  const totalDays = getTotalDays(now.getFullYear());

  const stats = session.user.id
    ? await getTaskStats(session.user.id)
    : { pendingCount: 0, inProgressCount: 0, completedWeek: 0, completedYear: 0 };

  return (
    <header className="w-full border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
        <a
          href="/"
          className="text-sm font-semibold text-zinc-900 dark:text-zinc-50"
        >
          Organiza
        </a>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            Sem. {week}/{totalWeeks}
          </span>
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            Dia {dayOfYear}/{totalDays}
          </span>

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700" />

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" title="Tarefas pendentes">
              {stats.pendingCount} pend.
            </span>
            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" title="Tarefas em progresso">
              {stats.inProgressCount} prog.
            </span>
            <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400" title="Concluídas na semana / no ano">
              ✓ {stats.completedWeek} sem · {stats.completedYear} ano
            </span>
          </div>

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700" />

          <div className="flex items-center gap-2">
            {session.user.image ? (
              <img
                src={session.user.image}
                alt={session.user.name ?? ""}
                className="h-7 w-7 rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-200 text-xs font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                {session.user.name?.charAt(0).toUpperCase() ?? "?"}
              </div>
            )}
            <span className="text-sm text-zinc-700 dark:text-zinc-300">
              {session.user.name}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
