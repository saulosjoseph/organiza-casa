import { auth } from "@/src/infrastructure/auth/auth";
import { MongoTaskRepository } from "@/src/infrastructure/database/mongoose/repositories/task.repository";
import { MongoTaskGroupRepository } from "@/src/infrastructure/database/mongoose/repositories/task-group.repository";
import { MongoUserGroupRepository } from "@/src/infrastructure/database/mongoose/repositories/user-group.repository";
import { MongoTaskCompletionRepository } from "@/src/infrastructure/database/mongoose/repositories/task-completion.repository";
import { ListTasksUseCase } from "@/src/core/application/use-cases/list-tasks.use-case";
import { ListTaskGroupsUseCase } from "@/src/core/application/use-cases/list-task-groups.use-case";
import { ListUserGroupsUseCase } from "@/src/core/application/use-cases/list-user-groups.use-case";
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
  const userGroupRepository = new MongoUserGroupRepository();

  const listTasksUseCase = new ListTasksUseCase(taskRepository);
  const listTaskGroupsUseCase = new ListTaskGroupsUseCase(taskGroupRepository);
  const listUserGroupsUseCase = new ListUserGroupsUseCase(userGroupRepository);

  const [allTasks, allTaskGroups, allUserGroups] = await Promise.all([
    listTasksUseCase.execute(),
    listTaskGroupsUseCase.execute(),
    listUserGroupsUseCase.execute(session.user.id),
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

  const taskGroupMap = new Map(allTaskGroups.map((g) => [g.id, g]));
  const userGroupMap = new Map(allUserGroups.map((g) => [g.id, g.name]));

  // Build task group -> user group mapping
  const taskGroupToUserGroup = new Map<string, string | null>();
  for (const tg of allTaskGroups) {
    taskGroupToUserGroup.set(tg.id, tg.userGroupId);
  }

  // Group tasks by user group, then by task group
  // Key: "userGroupId|taskGroupId" or "userGroupId|null" or "null|null"
  interface TaskSection {
    userGroupId: string | null;
    userGroupName: string | null;
    taskGroupId: string | null;
    taskGroupName: string | null;
    tasks: typeof filteredTasks;
  }

  const sectionsMap = new Map<string, TaskSection>();
  for (const task of filteredTasks) {
    const ugId = task.userGroupId;
    const tgId = task.groupId;
    const sectionKey = `${ugId ?? "none"}|${tgId ?? "none"}`;
    if (!sectionsMap.has(sectionKey)) {
      sectionsMap.set(sectionKey, {
        userGroupId: ugId,
        userGroupName: ugId ? (userGroupMap.get(ugId) ?? "Grupo desconhecido") : null,
        taskGroupId: tgId,
        taskGroupName: tgId ? (taskGroupMap.get(tgId)?.name ?? "Grupo desconhecido") : null,
        tasks: [],
      });
    }
    sectionsMap.get(sectionKey)!.tasks.push(task);
  }

  // Sort: by user group name, then task group name, ungrouped last
  const sections = Array.from(sectionsMap.values()).sort((a, b) => {
    if (a.userGroupId === null && b.userGroupId !== null) return 1;
    if (a.userGroupId !== null && b.userGroupId === null) return -1;
    const ugCmp = (a.userGroupName ?? "").localeCompare(b.userGroupName ?? "");
    if (ugCmp !== 0) return ugCmp;
    if (a.taskGroupId === null && b.taskGroupId !== null) return 1;
    if (a.taskGroupId !== null && b.taskGroupId === null) return -1;
    return (a.taskGroupName ?? "").localeCompare(b.taskGroupName ?? "");
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

        {sections.map((section) => (
          <div key={`${section.userGroupId ?? "none"}-${section.taskGroupId ?? "none"}`}>
            <div className="mb-3 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                {section.userGroupId ? (
                  <a
                    href={`/grupo/${section.userGroupId}`}
                    className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                  >
                    {section.userGroupName}
                  </a>
                ) : (
                  <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                    Pessoal
                  </span>
                )}
                <span className="text-xs text-zinc-300 dark:text-zinc-600">›</span>
                <div className="flex items-center gap-1.5">
                  <svg
                    className="h-3.5 w-3.5 text-zinc-400"
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
                  {section.taskGroupId ? (
                    <a
                      href={`/grupo-tarefas/${section.taskGroupId}`}
                      className="text-sm font-medium text-zinc-900 transition-colors hover:text-zinc-600 dark:text-zinc-50 dark:hover:text-zinc-300"
                    >
                      {section.taskGroupName}
                    </a>
                  ) : (
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      Sem grupo de tarefas
                    </span>
                  )}
                </div>
                <span className="text-sm text-zinc-400 dark:text-zinc-500">
                  ({section.tasks.length})
                </span>
              </div>
            </div>

            <div className="grid gap-2">
              {section.tasks.map((task) => (
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
