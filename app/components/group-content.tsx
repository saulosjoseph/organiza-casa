"use client";

import { useState } from "react";
import { CreateTaskForm } from "@/app/components/create-task-form";
import { CreateTaskGroupForm } from "@/app/components/create-task-group-form";

interface TaskGroup {
  id: string;
  name: string;
  description: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  groupId: string | null;
  dueDate: string | null;
  recurrence: string | null;
  overdue: boolean;
}

interface Member {
  id: string;
  name: string;
}

interface GroupContentProps {
  userGroupId: string;
  members: Member[];
  tasks: Task[];
  taskGroups: TaskGroup[];
}

export function GroupContent({
  userGroupId,
  members,
  tasks,
  taskGroups,
}: GroupContentProps) {
  const [showForm, setShowForm] = useState<"task" | "task-group" | null>(null);

  const ungroupedTasks = tasks.filter((t) => !t.groupId);
  const groupedTasks = taskGroups.map((g) => ({
    ...g,
    tasks: tasks.filter((t) => t.groupId === g.id),
  }));

  const statusOrder = ["pending", "in_progress", "done"] as const;
  const statusLabels: Record<string, string> = {
    pending: "Pendente",
    in_progress: "Em andamento",
    done: "Concluída",
  };
  const statusColors: Record<string, string> = {
    pending: "text-yellow-600 dark:text-yellow-400",
    in_progress: "text-blue-600 dark:text-blue-400",
    done: "text-green-600 dark:text-green-400",
  };

  function groupByStatus(taskList: Task[]) {
    return statusOrder
      .map((status) => ({
        status,
        label: statusLabels[status],
        color: statusColors[status],
        tasks: taskList.filter((t) => t.status === status),
      }))
      .filter((g) => g.tasks.length > 0);
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Action buttons */}
      {!showForm && (
        <div className="flex gap-3">
          <button
            onClick={() => setShowForm("task")}
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
            Nova Tarefa
          </button>
          <button
            onClick={() => setShowForm("task-group")}
            className="flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
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
                d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
              />
            </svg>
            Novo Grupo de Tarefas
          </button>
        </div>
      )}

      {/* Forms */}
      {showForm === "task" && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-4 text-lg font-medium text-zinc-900 dark:text-zinc-50">
            Nova Tarefa
          </h2>
          <CreateTaskForm
            userGroupId={userGroupId}
            taskGroups={taskGroups.map((g) => ({ id: g.id, name: g.name }))}
            members={members}
            onCancel={() => setShowForm(null)}
          />
        </div>
      )}

      {showForm === "task-group" && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-4 text-lg font-medium text-zinc-900 dark:text-zinc-50">
            Novo Grupo de Tarefas
          </h2>
          <CreateTaskGroupForm
            userGroupId={userGroupId}
            members={members}
            onCancel={() => setShowForm(null)}
          />
        </div>
      )}

      {/* Task Groups */}
      {groupedTasks.map((group) => (
        <div key={group.id}>
          <a
            href={`/grupo-tarefas/${group.id}`}
            className="mb-3 flex items-center gap-2 text-base font-medium text-zinc-900 transition-colors hover:text-zinc-600 dark:text-zinc-50 dark:hover:text-zinc-300"
          >
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
            {group.name}
            {group.description && (
              <span className="text-sm font-normal text-zinc-400 dark:text-zinc-500">
                — {group.description}
              </span>
            )}
          </a>
          {group.tasks.length === 0 ? (
            <p className="ml-6 text-sm text-zinc-400 dark:text-zinc-500">
              Nenhuma tarefa neste grupo.
            </p>
          ) : (
            <div className="ml-2 flex flex-col gap-4">
              {groupByStatus(group.tasks).map((statusGroup) => (
                <div key={statusGroup.status}>
                  <h4 className={`mb-2 text-xs font-semibold uppercase tracking-wide ${statusGroup.color}`}>
                    {statusGroup.label}
                  </h4>
                  <div className="grid gap-2">
                    {statusGroup.tasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Ungrouped Tasks */}
      {ungroupedTasks.length > 0 && (
        <div>
          {taskGroups.length > 0 && (
            <h3 className="mb-3 text-base font-medium text-zinc-900 dark:text-zinc-50">
              Tarefas sem grupo
            </h3>
          )}
          <div className="flex flex-col gap-4">
            {groupByStatus(ungroupedTasks).map((statusGroup) => (
              <div key={statusGroup.status}>
                <h4 className={`mb-2 text-xs font-semibold uppercase tracking-wide ${statusGroup.color}`}>
                  {statusGroup.label}
                </h4>
                <div className="grid gap-2">
                  {statusGroup.tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {tasks.length === 0 && taskGroups.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 py-12 dark:border-zinc-700">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Nenhuma tarefa ou grupo de tarefas ainda.
          </p>
          <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
            Comece criando uma tarefa ou um grupo de tarefas.
          </p>
        </div>
      )}
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  const statusLabels: Record<string, string> = {
    pending: "Pendente",
    in_progress: "Em andamento",
    done: "Concluída",
  };

  const statusColors: Record<string, string> = {
    pending:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    in_progress:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    done: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  };

  const recurrenceLabels: Record<string, string> = {
    daily: "Diária",
    weekly: "Semanal",
    monthly: "Mensal",
  };

  return (
    <a
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
            {new Date(task.dueDate).toLocaleDateString("pt-BR")}
          </span>
        )}
        {task.recurrence && (
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            🔄 {recurrenceLabels[task.recurrence]}
          </span>
        )}
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[task.status] || ""}`}
        >
          {statusLabels[task.status] || task.status}
        </span>
      </div>
    </a>
  );
}
