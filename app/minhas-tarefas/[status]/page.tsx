import { auth } from "@/src/infrastructure/auth/auth";
import { MongoTaskRepository } from "@/src/infrastructure/database/mongoose/repositories/task.repository";
import { MongoTaskGroupRepository } from "@/src/infrastructure/database/mongoose/repositories/task-group.repository";
import { MongoTaskCompletionRepository } from "@/src/infrastructure/database/mongoose/repositories/task-completion.repository";
import { ListTasksUseCase } from "@/src/core/application/use-cases/list-tasks.use-case";
import { ListTaskGroupsUseCase } from "@/src/core/application/use-cases/list-task-groups.use-case";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ status: string }>;
}

const STATUS_CONFIG: Record<
  string,
  {
    dbStatus: string | null;
    title: string;
    color: string;
    bgColor: string;
  }
> = {
  pendentes: {
    dbStatus: "pending",
    title: "Tarefas Pendentes",
    color: "text-yellow-800 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
  },
  "em-progresso": {
    dbStatus: "in_progress",
    title: "Tarefas em Progresso",
    color: "text-blue-800 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  concluidas: {
    dbStatus: null,
    title: "Tarefas Concluídas",
    color: "text-green-800 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
};

export default async function MinhasTarefasPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { status } = await params;
  const config = STATUS_CONFIG[status];
  if (!config) {
    notFound();
  }

  const taskRepository = new MongoTaskRepository();
  const taskGroupRepository = new MongoTaskGroupRepository();

  const listTasksUseCase = new ListTasksUseCase(taskRepository);
  const listTaskGroupsUseCase = new ListTaskGroupsUseCase(taskGroupRepository);

  const [allTasks, allTaskGroups] = await Promise.all([
    listTasksUseCase.execute(),
    listTaskGroupsUseCase.execute(),
  ]);

  let filteredTasks;
  if (status === "concluidas") {
    const completionRepo = new MongoTaskCompletionRepository();
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);

    // Get all tasks assigned to user that are done
    const doneTasks = allTasks.filter(
      (t) => t.assignedTo === session.user!.id && t.status === "done"
    );

    // Also find completions by this user in the current year
    const { TaskCompletionModel } = await import(
      "@/src/infrastructure/database/mongoose/models/task-completion.model"
    );
    const { connectToDatabase } = await import(
      "@/src/infrastructure/database/mongoose/connection"
    );
    await connectToDatabase();

    const completions = await TaskCompletionModel.find({
      completedBy: session.user!.id,
      completedAt: { $gte: yearStart },
    }).lean();

    const completedTaskIds = new Set(
      completions.map((c: { taskId: { toString(): string } }) =>
        c.taskId.toString()
      )
    );

    // Include done tasks assigned to user + tasks completed by user this year
    filteredTasks = allTasks.filter(
      (t) =>
        (t.assignedTo === session.user!.id && t.status === "done") ||
        completedTaskIds.has(t.id)
    );
  } else {
    filteredTasks = allTasks.filter(
      (t) =>
        t.assignedTo === session.user!.id && t.status === config.dbStatus
    );
  }

  const taskGroupMap = new Map(allTaskGroups.map((g) => [g.id, g.name]));

  // Group tasks by task group
  const grouped = new Map<string | null, typeof filteredTasks>();
  for (const task of filteredTasks) {
    const key = task.groupId;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(task);
  }

  // Sort: grouped first, then ungrouped
  const sortedGroups = Array.from(grouped.entries()).sort(([a], [b]) => {
    if (a === null) return 1;
    if (b === null) return -1;
    return (taskGroupMap.get(a) ?? "").localeCompare(taskGroupMap.get(b) ?? "");
  });

  const recurrenceLabels: Record<string, string> = {
    daily: "Diária",
    weekly: "Semanal",
    monthly: "Mensal",
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-transparent">
      <main className="flex flex-1 w-full max-w-3xl flex-col gap-8 py-12 px-6">
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          </a>
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {config.title}
            </h1>
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
              {filteredTasks.length}{" "}
              {filteredTasks.length === 1 ? "tarefa" : "tarefas"}
            </p>
          </div>
        </div>

        {filteredTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 py-12 dark:border-zinc-700">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Nenhuma tarefa encontrada.
            </p>
          </div>
        )}

        {sortedGroups.map(([groupId, tasks]) => (
          <div key={groupId ?? "ungrouped"}>
            <div className="mb-3 flex items-center gap-2">
              <svg
                className="h-4 w-4 text-zinc-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
                />
              </svg>
              {groupId ? (
                <a
                  href={`/grupo-tarefas/${groupId}`}
                  className="text-base font-medium text-zinc-900 transition-colors hover:text-zinc-600 dark:text-zinc-50 dark:hover:text-zinc-300"
                >
                  {taskGroupMap.get(groupId) ?? "Grupo desconhecido"}
                </a>
              ) : (
                <span className="text-base font-medium text-zinc-900 dark:text-zinc-50">
                  Sem grupo
                </span>
              )}
              <span className="text-sm text-zinc-400 dark:text-zinc-500">
                ({tasks.length})
              </span>
            </div>

            <div className="grid gap-2">
              {tasks.map((task) => (
                <a
                  key={task.id}
                  href={`/tarefa/${task.id}`}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {task.title}
                    </span>
                    {task.description && (
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {task.description}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {task.overdue && (
                      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        Em atraso
                      </span>
                    )}
                    {task.dueDate && (
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        {task.dueDate.toLocaleDateString("pt-BR")}
                      </span>
                    )}
                    {task.recurrence && (
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        🔄 {recurrenceLabels[task.recurrence]}{" "}
                        {task.recurrenceQuantity}x
                      </span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
