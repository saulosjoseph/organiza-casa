import { auth } from "@/src/infrastructure/auth/auth";
import { MongoTaskGroupRepository } from "@/src/infrastructure/database/mongoose/repositories/task-group.repository";
import { MongoTaskRepository } from "@/src/infrastructure/database/mongoose/repositories/task.repository";
import { MongoUserGroupRepository } from "@/src/infrastructure/database/mongoose/repositories/user-group.repository";
import { MongoUserRepository } from "@/src/infrastructure/database/mongoose/repositories/user.repository";
import { GetTaskGroupUseCase } from "@/src/core/application/use-cases/get-task-group.use-case";
import { ListTasksUseCase } from "@/src/core/application/use-cases/list-tasks.use-case";
import { GetUserGroupUseCase } from "@/src/core/application/use-cases/get-user-group.use-case";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { TaskGroupDetail } from "@/app/components/task-group-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function GrupoTarefasPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const taskGroupRepository = new MongoTaskGroupRepository();
  const getTaskGroupUseCase = new GetTaskGroupUseCase(taskGroupRepository);
  const taskGroup = await getTaskGroupUseCase.execute(id);

  if (!taskGroup) {
    notFound();
  }

  // Load related data
  let members: { id: string; name: string }[] = [];

  if (taskGroup.userGroupId) {
    const userGroupRepository = new MongoUserGroupRepository();
    const userRepository = new MongoUserRepository();

    const getUserGroupUseCase = new GetUserGroupUseCase(userGroupRepository);
    const userGroup = await getUserGroupUseCase.execute(taskGroup.userGroupId);

    if (!userGroup || !userGroup.members.includes(session.user.id)) {
      redirect("/");
    }

    const memberUsers = await Promise.all(
      userGroup.members.map((memberId) => userRepository.findById(memberId))
    );

    members = memberUsers
      .filter((u) => u !== null)
      .map((u) => ({ id: u.id, name: u.name }));
  }

  // Load tasks in this group
  const taskRepository = new MongoTaskRepository();
  const listTasksUseCase = new ListTasksUseCase(taskRepository);
  const allTasks = await listTasksUseCase.execute();
  const tasks = allTasks
    .filter((t) => t.groupId === id)
    .map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    }));

  const taskGroupData = {
    id: taskGroup.id,
    name: taskGroup.name,
    description: taskGroup.description,
    assignedTo: taskGroup.assignedTo,
    createdAt: taskGroup.createdAt.toISOString(),
  };

  const backUrl = taskGroup.userGroupId
    ? `/grupo/${taskGroup.userGroupId}`
    : "/";

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-transparent">
      <main className="flex flex-1 w-full max-w-3xl flex-col gap-8 py-12 px-6">
        <div className="flex items-center gap-4">
          <a
            href={backUrl}
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
          <h1 className="text-lg font-medium text-zinc-500 dark:text-zinc-400">
            Grupo de Tarefas
          </h1>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <TaskGroupDetail
            taskGroup={taskGroupData}
            tasks={tasks}
            members={members}
            userGroupId={taskGroup.userGroupId}
          />
        </div>
      </main>
    </div>
  );
}
