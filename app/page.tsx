import { auth } from "@/src/infrastructure/auth/auth";
import { MongoUserGroupRepository } from "@/src/infrastructure/database/mongoose/repositories/user-group.repository";
import { ListUserGroupsUseCase } from "@/src/core/application/use-cases/list-user-groups.use-case";
import { redirect } from "next/navigation";
import { CreateUserGroupForm } from "@/app/components/create-user-group-form";
import { HomeContent } from "@/app/components/home-content";

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
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-transparent">
      <main className="flex flex-1 w-full max-w-3xl flex-col gap-8 py-12 px-6">
        <HomeContent groups={groups} />
      </main>
    </div>
  );
}
