"use client";

import { useState } from "react";
import { CreateUserGroupInlineForm } from "@/app/components/create-user-group-inline-form";

interface Group {
  id: string;
  name: string;
  description: string;
  members: string[];
}

interface HomeContentProps {
  groups: Group[];
}

export function HomeContent({ groups }: HomeContentProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      {/* Header with create button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Meus Grupos
        </h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
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
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Novo Grupo
          </button>
        )}
      </div>

      {/* Inline form */}
      {showForm && (
        <CreateUserGroupInlineForm onCancel={() => setShowForm(false)} />
      )}

      {/* Group list */}
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
    </div>
  );
}
