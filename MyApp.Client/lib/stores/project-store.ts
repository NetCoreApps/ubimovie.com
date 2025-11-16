import { create } from 'zustand';
import { Project } from '@/lib/types/project';
import { db } from '@/lib/services/storage/indexeddb';
import { createDefaultProject, updateProjectMetadata } from '@/lib/utils/project-helpers';

interface ProjectStoreState {
  projects: Project[];
  activeProjectId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  createProject: (name: string) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setActiveProject: (id: string) => void;
  loadProjects: () => Promise<void>;
  getActiveProject: () => Project | null;
}

export const useProjectStore = create<ProjectStoreState>((set, get) => ({
  projects: [],
  activeProjectId: null,
  isLoading: false,
  error: null,

  createProject: async (name: string) => {
    try {
      set({ isLoading: true, error: null });
      const project = createDefaultProject(name);
      await db.saveProject(project);
      set(state => ({
        projects: [...state.projects, project],
        activeProjectId: project.id,
        isLoading: false,
      }));
      return project;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updateProject: async (id: string, updates: Partial<Project>) => {
    try {
      set({ isLoading: true, error: null });
      const project = get().projects.find(p => p.id === id);
      if (!project) throw new Error('Project not found');

      const updatedProject = updateProjectMetadata({ ...project, ...updates });
      await db.saveProject(updatedProject);

      set(state => ({
        projects: state.projects.map(p => p.id === id ? updatedProject : p),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  deleteProject: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await db.deleteProject(id);
      set(state => ({
        projects: state.projects.filter(p => p.id !== id),
        activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  setActiveProject: (id: string) => {
    set({ activeProjectId: id });
  },

  loadProjects: async () => {
    try {
      set({ isLoading: true, error: null });
      const projects = await db.getAllProjects();
      set({ projects, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  getActiveProject: () => {
    const { projects, activeProjectId } = get();
    return projects.find(p => p.id === activeProjectId) || null;
  },
}));
