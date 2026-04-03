import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Plus, LogOut, X, Calendar, CheckCircle2, Circle, Clock,
  MoreVertical, Pencil, Trash2, ChevronRight, LayoutDashboard,
  CheckSquare, TrendingUp, Loader2, AlertCircle,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext.jsx';

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api`;

/* ─── Status config ─────────────────────────────────────── */
const STATUS_CONFIG = {
  todo: {
    label: 'À faire',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/30',
    dot: 'bg-amber-400',
    headerBg: 'bg-amber-400/5',
    headerBorder: 'border-amber-400/20',
    icon: Circle,
    count_color: 'text-amber-300',
  },
  in_progress: {
    label: 'En cours',
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
    border: 'border-sky-400/30',
    dot: 'bg-sky-400',
    headerBg: 'bg-sky-400/5',
    headerBorder: 'border-sky-400/20',
    icon: Clock,
    count_color: 'text-sky-300',
  },
  done: {
    label: 'Terminé',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/30',
    dot: 'bg-emerald-400',
    headerBg: 'bg-emerald-400/5',
    headerBorder: 'border-emerald-400/20',
    icon: CheckCircle2,
    count_color: 'text-emerald-300',
  },
};

const STATUSES = ['todo', 'in_progress', 'done'];

/* ─── Helpers ───────────────────────────────────────────── */
function fmtDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

/* ─── Badge ─────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.todo;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

/* ─── Task card ─────────────────────────────────────────── */
function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const due = fmtDate(task.dueDate);
  const overdue = task.status !== 'done' && isOverdue(task.dueDate);

  /* Next-status shortcut */
  const nextStatus =
    task.status === 'todo' ? 'in_progress'
    : task.status === 'in_progress' ? 'done'
    : null;

  return (
    <div className="group relative rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-sm transition-all duration-200 hover:border-slate-700 hover:shadow-md hover:shadow-slate-950/40 hover:-translate-y-0.5">
      {/* Top row: title + menu */}
      <div className="flex items-start justify-between gap-2">
        <p className={`flex-1 text-sm font-medium leading-snug ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-100'}`}>
          {task.title}
        </p>
        <div className="relative" ref={menuRef}>
          <button
            id={`task-menu-${task.id}`}
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded-md p-1 text-slate-500 opacity-0 transition group-hover:opacity-100 hover:bg-slate-800 hover:text-slate-200"
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-6 z-30 w-36 rounded-xl border border-slate-700 bg-slate-900 py-1 shadow-xl shadow-slate-950/60">
              <button
                onClick={() => { setMenuOpen(false); onEdit(task); }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <Pencil className="h-3 w-3" /> Modifier
              </button>
              <button
                onClick={() => { setMenuOpen(false); onDelete(task.id); }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300"
              >
                <Trash2 className="h-3 w-3" /> Supprimer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="mt-1.5 line-clamp-2 pl-0 text-[11px] leading-relaxed text-slate-400">
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <StatusBadge status={task.status} />
          {due && (
            <span className={`inline-flex items-center gap-1 text-[10px] ${overdue ? 'text-red-400' : 'text-slate-500'}`}>
              <Calendar className="h-2.5 w-2.5" />
              {due}
            </span>
          )}
        </div>

        {nextStatus && (
          <button
            onClick={() => onStatusChange(task.id, nextStatus)}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition
              ${STATUS_CONFIG[nextStatus].bg} ${STATUS_CONFIG[nextStatus].color}
              border ${STATUS_CONFIG[nextStatus].border} hover:opacity-80`}
          >
            {STATUS_CONFIG[nextStatus].label}
            <ChevronRight className="h-2.5 w-2.5" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Kanban column ─────────────────────────────────────── */
function KanbanColumn({ status, tasks, onAdd, onEdit, onDelete, onStatusChange }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;

  return (
    <div className={`flex flex-col rounded-2xl border ${cfg.headerBorder} ${cfg.headerBg} overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${cfg.color}`} />
          <span className="text-sm font-semibold text-slate-100">{cfg.label}</span>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${cfg.bg} ${cfg.count_color} border ${cfg.border}`}>
            {tasks.length}
          </span>
        </div>
        <button
          id={`add-task-${status}`}
          onClick={() => onAdd(status)}
          className={`rounded-lg p-1.5 transition ${cfg.bg} ${cfg.color} border ${cfg.border} hover:opacity-80`}
          title={`Ajouter une tâche ${cfg.label}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-2.5 overflow-y-auto px-3 pb-4 pt-1" style={{ maxHeight: '62vh' }}>
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-800 py-8 text-center">
            <Icon className="h-5 w-5 text-slate-700" />
            <p className="text-[11px] text-slate-600">Aucune tâche</p>
          </div>
        )}
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Task Modal ─────────────────────────────────────────── */
function TaskModal({ open, onClose, onSave, initial = null, defaultStatus = 'todo' }) {
  const [form, setForm] = useState({ title: '', description: '', status: defaultStatus, dueDate: '' });
  const [saving, setSaving] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              title: initial.title || '',
              description: initial.description || '',
              status: initial.status || 'todo',
              dueDate: initial.dueDate ? initial.dueDate.slice(0, 10) : '',
            }
          : { title: '', description: '', status: defaultStatus, dueDate: '' }
      );
      setTimeout(() => titleRef.current?.focus(), 80);
    }
  }, [open, initial, defaultStatus]);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    await onSave({ ...form, dueDate: form.dueDate || null });
    setSaving(false);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-slate-950/80">
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-100">
            {initial ? 'Modifier la tâche' : 'Nouvelle tâche'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Titre *</label>
            <input
              id="task-title-input"
              ref={titleRef}
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Ex : Finaliser le rapport Q1"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Description</label>
            <textarea
              id="task-description-input"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Détails, checklist, lien…"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition resize-none"
            />
          </div>

          {/* Status + Due date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Statut</label>
              <select
                id="task-status-select"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs text-slate-100 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition"
              >
                <option value="todo">À faire</option>
                <option value="in_progress">En cours</option>
                <option value="done">Terminé</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Date d'échéance</label>
              <input
                id="task-duedate-input"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs text-slate-100 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-700 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 transition"
            >
              Annuler
            </button>
            <button
              id="task-save-btn"
              type="submit"
              disabled={saving || !form.title.trim()}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-500 py-2.5 text-sm font-medium text-white shadow-md shadow-indigo-500/30 transition hover:bg-indigo-400 disabled:opacity-50"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {initial ? 'Enregistrer' : 'Créer la tâche'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Stat card ─────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, colorClass, subtext }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400">{label}</p>
          <p className={`mt-1 text-3xl font-bold tracking-tight ${colorClass}`}>{value}</p>
          {subtext && <p className="mt-0.5 text-[10px] text-slate-500">{subtext}</p>}
        </div>
        <div className={`rounded-xl p-2.5 ${colorClass} bg-current/10`} style={{ background: 'rgba(255,255,255,0.04)' }}>
          <Icon className={`h-5 w-5 ${colorClass}`} />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   DASHBOARD PAGE
───────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { user, token, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultStatus, setDefaultStatus] = useState('todo');

  /* ── Fetch ── */
  const fetchTasks = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur lors du chargement');
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  /* ── Stats ── */
  const stats = useMemo(() => ({
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  }), [tasks]);

  const donePercent = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;

  /* ── Grouped tasks ── */
  const grouped = useMemo(() => ({
    todo: tasks.filter((t) => t.status === 'todo'),
    in_progress: tasks.filter((t) => t.status === 'in_progress'),
    done: tasks.filter((t) => t.status === 'done'),
  }), [tasks]);

  /* ── Create / Update ── */
  async function handleSave(form) {
    setError('');
    if (editingTask) {
      // UPDATE
      try {
        const res = await fetch(`${API_BASE}/tasks/${editingTask.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Erreur lors de la mise à jour');
        setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? data : t)));
      } catch (err) {
        setError(err.message || 'Erreur réseau');
      }
    } else {
      // CREATE
      try {
        const res = await fetch(`${API_BASE}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Erreur lors de la création');
        setTasks((prev) => [data, ...prev]);
      } catch (err) {
        setError(err.message || 'Erreur réseau');
      }
    }
    setEditingTask(null);
  }

  /* ── Quick status change ── */
  async function handleStatusChange(id, status) {
    // Optimistic
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status, isCompleted: status === 'done' } : t)));
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setTasks((prev) => prev.map((t) => (t.id === id ? data : t)));
    } catch (err) {
      setError(err.message || 'Erreur réseau');
      fetchTasks(); // rollback
    }
  }

  /* ── Delete ── */
  async function handleDelete(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id)); // optimistic
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Erreur lors de la suppression');
      }
    } catch (err) {
      setError(err.message || 'Erreur réseau');
      fetchTasks(); // rollback
    }
  }

  /* ── Open modal helpers ── */
  function openCreate(status = 'todo') {
    setEditingTask(null);
    setDefaultStatus(status);
    setModalOpen(true);
  }

  function openEdit(task) {
    setEditingTask(task);
    setModalOpen(true);
  }

  /* ── Greeting ── */
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
  const todayStr = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  /* ───────────────── RENDER ───────────────── */
  return (
    <>
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {greeting}, <span className="bg-gradient-to-r from-indigo-400 to-sky-400 bg-clip-text text-transparent">{user?.name || 'Utilisateur'}</span> 👋
            </h1>
            <p className="mt-0.5 text-xs capitalize text-slate-400">{todayStr}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="create-task-btn"
              onClick={() => openCreate()}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-indigo-500/30 transition hover:bg-indigo-400 hover:shadow-indigo-500/40"
            >
              <Plus className="h-4 w-4" />
              Nouvelle tâche
            </button>
            <button
              id="logout-btn"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-red-500/60 hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="h-3.5 w-3.5" />
              Déconnexion
            </button>
          </div>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/8 px-4 py-3 text-sm text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-200">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* ── Stats ── */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total" value={stats.total} icon={LayoutDashboard} colorClass="text-slate-300" subtext={`${donePercent}% complété`} />
          <StatCard label="À faire" value={stats.todo} icon={CheckSquare} colorClass="text-amber-400" />
          <StatCard label="En cours" value={stats.in_progress} icon={TrendingUp} colorClass="text-sky-400" />
          <StatCard label="Terminées" value={stats.done} icon={CheckCircle2} colorClass="text-emerald-400" />
        </div>

        {/* ── Progress bar ── */}
        {stats.total > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Progression globale</span>
              <span className="font-medium text-emerald-400">{donePercent}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-700"
                style={{ width: `${donePercent}%` }}
              />
            </div>
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Chargement des tâches…</span>
          </div>
        )}

        {/* ── Kanban ── */}
        {!loading && (
          <div className="grid gap-4 lg:grid-cols-3">
            {STATUSES.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                tasks={grouped[status] || []}
                onAdd={openCreate}
                onEdit={openEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Task Modal ── */}
      <TaskModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTask(null); }}
        onSave={handleSave}
        initial={editingTask}
        defaultStatus={defaultStatus}
      />
    </>
  );
}