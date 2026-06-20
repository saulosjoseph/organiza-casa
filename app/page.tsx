import { auth } from "@/src/infrastructure/auth/auth.config";
import { MongoUserGroupRepository } from "@/src/infrastructure/database/mongoose/repositories/user-group.repository";
import { ListUserGroupsUseCase } from "@/src/core/application/use-cases/list-user-groups.use-case";
import { redirect } from "next/navigation";
import { CreateUserGroupForm } from "@/app/components/create-user-group-form";

export default async function Home() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const repository = new MongoUserGroupRepository();
  const useCase = new ListUserGroupsUseCase(repository);
  const groups = await useCase.execute(session.user.id);

  if (groups.length === 0) {
    return <CreateUserGroupForm />;
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col gap-8 py-12 px-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Meus Grupos
        </h1>
        <div className="grid gap-4">
          {groups.map((group) => (
            <a
              key={group.id}
              href={`/grupo/${group.id}`}
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
            >
              <div>
                <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                  {group.name}
                </h2>
                {group.description && (
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {group.description}
                  </p>
                )}
              </div>
              <span className="text-sm text-zinc-400 dark:text-zinc-500">
                {group.members.length} membro{group.members.length !== 1 ? "s" : ""}
              </span>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
