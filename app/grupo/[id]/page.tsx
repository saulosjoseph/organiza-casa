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
import { GroupHeader } from "@/app/components/group-header";

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
      recurrence: t.recurrence,
      recurrenceQuantity: t.recurrenceQuantity,
      overdue: t.overdue,
    }));

  const taskGroups = allTaskGroups
    .filter((g) => g.userGroupId === id)
    .map((g) => ({
      id: g.id,
      name: g.name,
      description: g.description,
    }));

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-transparent">
      <main className="flex flex-1 w-full max-w-3xl flex-col gap-8 py-12 px-6">
        <GroupHeader
          groupId={id}
          name={group.name}
          description={group.description}
          inviteCode={group.inviteCode}
          isOwner={group.ownerId === session.user.id}
        />

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
