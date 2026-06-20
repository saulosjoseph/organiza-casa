"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  dueDate: string | null;
}

interface TaskGroupDetailProps {
  taskGroup: {
    id: string;
    name: string;
    description: string;
    assignedTo: string | null;
    createdAt: string;
  };
  tasks: Task[];
  members: { id: string; name: string }[];
  userGroupId: string | null;
}

export function TaskGroupDetail({
  taskGroup,
  tasks,
  members,
  userGroupId,
}: TaskGroupDetailProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(taskGroup.name);
  const [description, setDescription] = useState(taskGroup.description);
  const [assignedTo, setAssignedTo] = useState(taskGroup.assignedTo || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

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

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/task-groups/${taskGroup.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || undefined,
          assignedTo: assignedTo || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao atualizar grupo de tarefas");
        return;
      }

      setEditing(false);
      router.refresh();
    } catch {
      setError("Erro ao atualizar grupo de tarefas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir este grupo de tarefas?")) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/task-groups/${taskGroup.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setError("Erro ao excluir grupo de tarefas");
        return;
      }
      if (userGroupId) {
        router.push(`/grupo/${userGroupId}`);
      } else {
        router.push("/");
      }
    } catch {
      setError("Erro ao excluir grupo de tarefas. Tente novamente.");
    } finally {
      setDeleting(false);
    }
  }

  const assignedMember = members.find((m) => m.id === taskGroup.assignedTo);

  if (editing) {
    return (
      <form onSubmit={handleSave} className="flex flex-col gap-5">
        <div>
          <label
            htmlFor="edit-name"
            className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Nome
          </label>
          <input
            id="edit-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
          />
        </div>

        <div>
          <label
            htmlFor="edit-description"
            className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Descrição
          </label>
          <textarea
            id="edit-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
          />
        </div>

        {members.length > 0 && (
          <div>
            <label
              htmlFor="edit-assigned"
              className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Responsável
            </label>
            <select
              id="edit-assigned"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
            >
              <option value="">Ninguém</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Cancelar
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {taskGroup.name}
        </h2>
        {taskGroup.description && (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            {taskGroup.description}
          </p>
        )}
      </div>

      {/* Metadata */}
      <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
        {assignedMember && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Responsável</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {assignedMember.name}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">Tarefas</span>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">Criado em</span>
          <span className="text-zinc-600 dark:text-zinc-300">
            {new Date(taskGroup.createdAt).toLocaleDateString("pt-BR")}
          </span>
        </div>
      </div>

      {/* Members */}
      {members.length > 0 && (
        <div>
          <h3 className="mb-3 text-base font-medium text-zinc-900 dark:text-zinc-50">
            Membros
          </h3>
          <div className="grid gap-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-sm font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {member.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tasks list */}
      {tasks.length > 0 && (
        <div>
          <h3 className="mb-3 text-base font-medium text-zinc-900 dark:text-zinc-50">
            Tarefas
          </h3>
          <div className="grid gap-2">
            {tasks.map((task) => (
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
                  {task.dueDate && (
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                      {new Date(task.dueDate).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[task.status] || ""}`}
                  >
                    {statusLabels[task.status] || task.status}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 py-8 dark:border-zinc-700">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Nenhuma tarefa neste grupo.
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => setEditing(true)}
          className="flex-1 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Editar
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
        >
          {deleting ? "Excluindo..." : "Excluir"}
        </button>
      </div>
    </div>
  );
}
