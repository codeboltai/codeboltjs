import { create } from 'zustand';
import type { Task, TaskStatus } from '@/types';

interface TasksState {
  tasks: Task[];
  filteredTasks: Task[];
  selectedTask: Task | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    status: TaskStatus | 'all';
    priority: string | 'all';
    agent: string | 'all';
    search: string;
  };
  
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  selectTask: (task: Task | null) => void;
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<TasksState['filters']>) => void;
  applyFilters: () => void;
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTaskStats: () => { inProgress: number; awaitingReview: number; completedToday: number; blocked: number };
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  filteredTasks: [],
  selectedTask: null,
  isLoading: false,
  error: null,
  filters: {
    status: 'all',
    priority: 'all',
    agent: 'all',
    search: '',
  },

  setTasks: (tasks) => {
    set({ tasks, isLoading: false, error: null });
    get().applyFilters();
  },
  addTask: (task) => {
    set((state) => ({ tasks: [...state.tasks, task] }));
    get().applyFilters();
  },
  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
    get().applyFilters();
  },
  removeTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }));
    get().applyFilters();
  },
  selectTask: (task) => set({ selectedTask: task }),
  moveTask: (taskId, newStatus) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, status: newStatus } : t
      ),
    }));
    get().applyFilters();
  },
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }));
    get().applyFilters();
  },
  applyFilters: () => {
    const { tasks, filters } = get();
    let filtered = [...tasks];

    if (filters.status !== 'all') {
      filtered = filtered.filter((t) => t.status === filters.status);
    }
    if (filters.priority !== 'all') {
      filtered = filtered.filter((t) => t.priority === filters.priority);
    }
    if (filters.agent !== 'all') {
      filtered = filtered.filter((t) => t.assignedAgent?.id === filters.agent);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(search) ||
          t.description?.toLowerCase().includes(search)
      );
    }

    set({ filteredTasks: filtered });
  },
  getTasksByStatus: (status) => get().tasks.filter((t) => t.status === status),
  getTaskStats: () => {
    const tasks = get().tasks;
    const today = new Date().toDateString();
    return {
      inProgress: tasks.filter((t) => t.status === 'in_progress').length,
      awaitingReview: tasks.filter((t) => t.status === 'review').length,
      completedToday: tasks.filter(
        (t) => t.status === 'done' && new Date(t.updatedAt).toDateString() === today
      ).length,
      blocked: tasks.filter((t) => t.status === 'archived').length,
    };
  },
}));
