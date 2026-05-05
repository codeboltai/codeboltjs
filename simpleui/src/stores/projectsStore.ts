import { create } from 'zustand';
import type { Project } from '@/types';

interface ProjectsState {
  projects: Project[];
  activeProject: Project | null;
  isLoading: boolean;
  error: string | null;
  
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  setActiveProject: (project: Project | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getProjectById: (id: string) => Project | undefined;
  getActiveProjects: () => Project[];
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  activeProject: null,
  isLoading: false,
  error: null,

  setProjects: (projects) => set({ projects, isLoading: false, error: null }),
  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
    })),
  setActiveProject: (project) => set({ activeProject: project }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
  getProjectById: (id) => get().projects.find((p) => p.id === id),
  getActiveProjects: () => get().projects.filter((p) => p.status === 'active'),
}));
