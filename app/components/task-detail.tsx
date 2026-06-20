"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface TaskDetailProps {
  task: {
    id: string;
    title: string;
    description: string;
    status: string;
    groupId: string | null;
    assignedTo: string | null;
    dueDate: string | null;
    recurrence: string | null;
    recurrenceQuantity: number;
    overdue: boolean;
    createdAt: string;
    updatedAt: string;
  };
  members: { id: string; name: string }[];
  taskGroups: { id: string; name: string }[];
  userGroupId: string | null;
}

export function TaskDetail({ task, members, taskGroups, userGroupId }: TaskDetailProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(task.status);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState(task.status);
  const [assignedTo, setAssignedTo] = useState(task.assignedTo || "");
  const [groupId, setGroupId] = useState(task.groupId || "");
  const [dueDate, setDueDate] = useState(
    task.dueDate ? task.dueDate.split("T")[0] : ""
  );
  const [recurrence, setRecurrence] = useState(task.recurrence || "");
  const [recurrenceQuantity, setRecurrenceQuantity] = useState(task.recurrenceQuantity || 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completionsInPeriod, setCompletionsInPeriod] = useState(0);

  const fetchCompletions = useCallback(async () => {
    if (!task.recurrence) return;
    try {
      const res = await fetch(`/api/tasks/${task.id}/complete`);
      if (res.ok) {
        const data = await res.json();
        setCompletionsInPeriod(data.completionsInPeriod);
      }
    } catch { /* ignore */ }
  }, [task.id, task.recurrence]);

  useEffect(() => {
    fetchCompletions();
  }, [fetchCompletions]);

  const statusLabels: Record<string, string> = {
    pending: "Pendente",
    in_progress: "Em andamento",
    done: "Concluída",
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    done: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          status,
          assignedTo: assignedTo || null,
          groupId: groupId || null,
          dueDate: dueDate || null,
          recurrence: recurrence || null,
          recurrenceQuantity: recurrence ? recurrenceQuantity : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao atualizar tarefa");
        return;
      }

      setEditing(false);
      router.refresh();
    } catch {
      setError("Erro ao atualizar tarefa. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
      if (!res.ok) {
        setError("Erro ao excluir tarefa");
        return;
      }
      if (userGroupId) {
        router.push(`/grupo/${userGroupId}`);
      } else {
        router.push("/");
      }
    } catch {
      setError("Erro ao excluir tarefa. Tente novamente.");
    } finally {
      setDeleting(false);
    }
  }

  const assignedMember = members.find((m) => m.id === task.assignedTo);
  const taskGroup = taskGroups.find((g) => g.id === task.groupId);

  async function handleStatusChange(newStatus: string) {
    setChangingStatus(true);
    setError("");

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao atualizar status");
        return;
      }

      setCurrentStatus(newStatus);
      setStatus(newStatus);
      router.refresh();
    } catch {
      setError("Erro ao atualizar status. Tente novamente.");
    } finally {
      setChangingStatus(false);
    }
  }

  async function handleComplete() {
    setCompleting(true);
    setError("");

    try {
      const res = await fetch(`/api/tasks/${task.id}/complete`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao registrar conclusão");
        return;
      }

      const data = await res.json();
      setCompletionsInPeriod(data.completionsInPeriod);

      if (task.recurrence) {
        if (data.completionsInPeriod >= task.recurrenceQuantity) {
          setCurrentStatus("done");
          setStatus("done");
        } else {
          setCurrentStatus("in_progress");
          setStatus("in_progress");
        }
      } else {
        setCurrentStatus("done");
        setStatus("done");
      }

      router.refresh();
    } catch {
      setError("Erro ao registrar conclusão. Tente novamente.");
    } finally {
      setCompleting(false);
    }
  }

  const isRecurrentComplete = task.recurrence && completionsInPeriod >= task.recurrenceQuantity;
  const showActionButton = currentStatus !== "done" || (task.recurrence && !isRecurrentComplete);

  function getActionButtonLabel() {
    if (completing) return "Registrando...";
    if (currentStatus === "pending") return "Iniciar tarefa";
    if (task.recurrence) {
      return `Marcar como feito (${completionsInPeriod}/${task.recurrenceQuantity})`;
    }
    return "Marcar como feito";
  }

  if (editing) {
    return (
      <form onSubmit={handleSave} className="flex flex-col gap-5">
        <div>
          <label
            htmlFor="edit-title"
            className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Título
          </label>
          <input
            id="edit-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
            rows={4}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
          />
        </div>

        <div>
          <label
            htmlFor="edit-status"
            className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Status
          </label>
          <select
            id="edit-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
          >
            <option value="pending">Pendente</option>
            <option value="in_progress">Em andamento</option>
            <option value="done">Concluída</option>
          </select>
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

        {taskGroups.length > 0 && (
          <div>
            <label
              htmlFor="edit-group"
              className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Grupo de Tarefas
            </label>
            <select
              id="edit-group"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
            >
              <option value="">Nenhum</option>
              {taskGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label
            htmlFor="edit-due-date"
            className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Data limite
          </label>
          <input
            id="edit-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => {
              setDueDate(e.target.value);
              if (e.target.value) setRecurrence("");
            }}
            disabled={!!recurrence}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
          />
        </div>

        <div>
          <label
            htmlFor="edit-recurrence"
            className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Recorrência
          </label>
          <select
            id="edit-recurrence"
            value={recurrence}
            onChange={(e) => {
              setRecurrence(e.target.value);
              if (e.target.value) setDueDate("");
            }}
            disabled={!!dueDate}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
          >
            <option value="">Nenhuma</option>
            <option value="daily">Diária</option>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensal</option>
          </select>
        </div>

        {recurrence && (
          <div>
            <label
              htmlFor="edit-recurrence-quantity"
              className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Quantidade por período
            </label>
            <input
              id="edit-recurrence-quantity"
              type="number"
              min={1}
              value={recurrenceQuantity}
              onChange={(e) => setRecurrenceQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
            />
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
      {/* Title and status */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            {task.title}
          </h2>
          {task.overdue && (
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
              Em atraso
            </span>
          )}
        </div>
        <select
          value={currentStatus}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={changingStatus}
          className={`rounded-full px-3 py-1 text-xs font-medium border-0 cursor-pointer disabled:opacity-50 ${statusColors[currentStatus] || ""}`}
        >
          <option value="pending">Pendente</option>
          <option value="in_progress">Em andamento</option>
          <option value="done">Concluída</option>
        </select>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap">
          {task.description}
        </p>
      )}

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
        {taskGroup && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Grupo de Tarefas</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {taskGroup.name}
            </span>
          </div>
        )}
        {task.dueDate && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Data limite</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {new Date(task.dueDate).toLocaleDateString("pt-BR")}
            </span>
          </div>
        )}
        {task.recurrence && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Recorrência</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {task.recurrence === "daily" ? "Diária" : task.recurrence === "weekly" ? "Semanal" : "Mensal"} — {task.recurrenceQuantity}x
            </span>
          </div>
        )}
        {task.recurrence && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">Progresso no período</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {completionsInPeriod}/{task.recurrenceQuantity}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div
                className="h-2 rounded-full bg-green-500 transition-all dark:bg-green-400"
                style={{ width: `${Math.min(100, (completionsInPeriod / task.recurrenceQuantity) * 100)}%` }}
              />
            </div>
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">Criada em</span>
          <span className="text-zinc-600 dark:text-zinc-300">
            {new Date(task.createdAt).toLocaleDateString("pt-BR")}
          </span>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Action button */}
      {showActionButton && (
        <button
          onClick={handleComplete}
          disabled={completing}
          className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-green-500 disabled:opacity-50 dark:bg-green-500 dark:hover:bg-green-400"
        >
          {getActionButtonLabel()}
        </button>
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
