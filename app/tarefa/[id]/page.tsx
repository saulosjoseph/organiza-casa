import { auth } from "@/src/infrastructure/auth/auth";
import { MongoTaskRepository } from "@/src/infrastructure/database/mongoose/repositories/task.repository";
import { MongoTaskGroupRepository } from "@/src/infrastructure/database/mongoose/repositories/task-group.repository";
import { MongoUserGroupRepository } from "@/src/infrastructure/database/mongoose/repositories/user-group.repository";
import { MongoUserRepository } from "@/src/infrastructure/database/mongoose/repositories/user.repository";
import { GetTaskUseCase } from "@/src/core/application/use-cases/get-task.use-case";
import { ListTaskGroupsUseCase } from "@/src/core/application/use-cases/list-task-groups.use-case";
import { GetUserGroupUseCase } from "@/src/core/application/use-cases/get-user-group.use-case";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { TaskDetail } from "@/app/components/task-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TarefaPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const taskRepository = new MongoTaskRepository();
  const getTaskUseCase = new GetTaskUseCase(taskRepository);
  const task = await getTaskUseCase.execute(id);

  if (!task) {
    notFound();
  }

  // Load related data
  let members: { id: string; name: string }[] = [];
  let taskGroups: { id: string; name: string }[] = [];

  if (task.userGroupId) {
    const userGroupRepository = new MongoUserGroupRepository();
    const userRepository = new MongoUserRepository();
    const taskGroupRepository = new MongoTaskGroupRepository();

    const getUserGroupUseCase = new GetUserGroupUseCase(userGroupRepository);
    const listTaskGroupsUseCase = new ListTaskGroupsUseCase(taskGroupRepository);

    const userGroup = await getUserGroupUseCase.execute(task.userGroupId);

    if (!userGroup || !userGroup.members.includes(session.user.id)) {
      redirect("/");
    }

    const [allTaskGroups, ...memberUsers] = await Promise.all([
      listTaskGroupsUseCase.execute(),
      ...userGroup.members.map((memberId) => userRepository.findById(memberId)),
    ]);

    members = memberUsers
      .filter((u) => u !== null)
      .map((u) => ({ id: u.id, name: u.name }));

    taskGroups = allTaskGroups
      .filter((g) => g.userGroupId === task.userGroupId)
      .map((g) => ({ id: g.id, name: g.name }));
  }

  const taskData = {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    groupId: task.groupId,
    assignedTo: task.assignedTo,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };

  const backUrl = task.userGroupId ? `/grupo/${task.userGroupId}` : "/";

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
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
            Tarefa
          </h1>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <TaskDetail
            task={taskData}
            members={members}
            taskGroups={taskGroups}
            userGroupId={task.userGroupId}
          />
        </div>
      </main>
    </div>
  );
}
