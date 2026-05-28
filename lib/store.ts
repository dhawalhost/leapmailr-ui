import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Project } from '@/types/project';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  plan_type: string;
  api_key: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setAuth: (user) => {
        set({ user, isAuthenticated: true });
      },
      clearAuth: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        // Fallback for SSR
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
    }
  )
);

interface ProjectState {
  currentProject: Project | null;
  projects: Project[];
  isLoading: boolean;
  setCurrentProject: (project: Project) => void;
  setProjects: (projects: Project[]) => void;
  setLoading: (loading: boolean) => void;
  clearProjects: () => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      currentProject: null,
      projects: [],
      isLoading: false,
      setCurrentProject: (project) => set({ currentProject: project }),
      setProjects: (projects) => {
        const defaultProject = projects.find(p => p.is_default) || projects[0] || null;
        set({ 
          projects, 
          currentProject: defaultProject 
        });
      },
      setLoading: (loading) => set({ isLoading: loading }),
      clearProjects: () => set({ currentProject: null, projects: [], isLoading: false }),
    }),
    {
      name: 'project-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      skipHydration: false,
    }
  )
);