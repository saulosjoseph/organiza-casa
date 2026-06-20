import { auth } from "@/src/infrastructure/auth/auth";
import { MongoUserGroupRepository } from "@/src/infrastructure/database/mongoose/repositories/user-group.repository";
import { redirect } from "next/navigation";
import { InviteActions } from "@/app/components/invite-actions";

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function ConvitePage({ params }: PageProps) {
  const { code } = await params;
  const session = await auth();

  const repository = new MongoUserGroupRepository();
  const group = await repository.findByInviteCode(code);

  if (!group) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-transparent">
        <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <svg
              className="h-8 w-8 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Convite inválido
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Este link de convite não existe ou expirou.
          </p>
          <a
            href="/"
            className="mt-6 inline-block rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Ir para início
          </a>
        </div>
      </div>
    );
  }

  // If user is logged in and already a member, redirect to the group
  if (session?.user?.id && group.members.includes(session.user.id)) {
    redirect(`/grupo/${group.id}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-transparent">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900">
            <svg
              className="h-8 w-8 text-zinc-600 dark:text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Você foi convidado!
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Você foi convidado para o grupo
          </p>
          <p className="mt-1 text-lg font-medium text-zinc-900 dark:text-zinc-50">
            {group.name}
          </p>
          {group.description && (
            <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
              {group.description}
            </p>
          )}
          <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
            {group.members.length} membro{group.members.length !== 1 ? "s" : ""}
          </p>
        </div>

        <InviteActions isLoggedIn={!!session?.user?.id} inviteCode={code} />
      </div>
    </div>
  );
}
