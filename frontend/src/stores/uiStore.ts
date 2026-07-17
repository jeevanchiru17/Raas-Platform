import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type AppMode = 'landing' | 'login' | 'app';
type PageId = 'dashboard' | 'robots' | 'tasks' | 'billing';

interface UIState {
  mode: AppMode;
  currentPage: PageId;
  setMode: (mode: AppMode) => void;
  setCurrentPage: (page: PageId) => void;
  navigateToApp: () => void;
  navigateToLanding: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      mode: 'landing',
      currentPage: 'dashboard',
      setMode: (mode) => set({ mode }),
      setCurrentPage: (currentPage) => set({ currentPage }),
      navigateToApp: () => set({ mode: 'app' }),
      navigateToLanding: () => set({ mode: 'landing', currentPage: 'dashboard' }),
    }),
    { name: 'UIStore' }
  )
);

export type { AppMode, PageId };
