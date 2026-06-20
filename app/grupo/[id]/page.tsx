import { auth } from "@/src/infrastructure/auth/auth";
import { MongoUserGroupRepository } from "@/src/infrastructure/database/mongoose/repositories/user-group.repository";
import { MongoTaskRepository } from "@/src/infrastructure/database/mongoose/repositories/task.repository";
import { MongoTaskGroupRepository } from "@/src/infrastructure/database/mongoose/repositories/task-group.repository";
import { MongoUserRepository } from "@/src/infrastructure/database/mongoose/repositories/user.repository";
import { GetUserGroupUseCase } from "@/src/core/application/use-cases/get-user-group.use-case";
import { ListTasksUseCase } from "@/src/core/application/use-cases/list-tasks.use-case";
import { ListTaskGroupsUseCase } from "@/src/core/application/use-cases/list-task-groups.use-case";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { GroupContent } from "@/app/components/group-content";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function GrupoPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const userGroupRepository = new MongoUserGroupRepository();
  const getUserGroupUseCase = new GetUserGroupUseCase(userGroupRepository);
  const group = await getUserGroupUseCase.execute(id);

  if (!group) {
    notFound();
  }

  if (!group.members.includes(session.user.id)) {
    redirect("/");
  }

  const taskRepository = new MongoTaskRepository();
  const taskGroupRepository = new MongoTaskGroupRepository();
  const userRepository = new MongoUserRepository();

  const listTasksUseCase = new ListTasksUseCase(taskRepository);
  const listTaskGroupsUseCase = new ListTaskGroupsUseCase(taskGroupRepository);

  const [allTasks, allTaskGroups, ...memberUsers] = await Promise.all([
    listTasksUseCase.execute(),
    listTaskGroupsUseCase.execute(),
    ...group.members.map((memberId) => userRepository.findById(memberId)),
  ]);

  const members = memberUsers
    .filter((u) => u !== null)
    .map((u) => ({ id: u.id, name: u.name }));

  const tasks = allTasks
    .filter((t) => t.userGroupId === id)
    .map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      groupId: t.groupId,
      dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    }));

  const taskGroups = allTaskGroups
    .filter((g) => g.userGroupId === id)
    .map((g) => ({
      id: g.id,
      name: g.name,
      description: g.description,
    }));

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
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
              {group.name}
            </h1>
            {group.description && (
              <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                {group.description}
              </p>
            )}
          </div>
        </div>

        <GroupContent
          userGroupId={id}
          members={members}
          tasks={tasks}
          taskGroups={taskGroups}
        />
      </main>
    </div>
  );
}
