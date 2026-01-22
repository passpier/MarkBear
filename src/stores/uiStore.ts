import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  theme: 'light' | 'dark';
  sidebarVisible: boolean;
  fontSize: number;
  fontFamily: string;
  sidebarWidth: number;
  // Actions
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  setSidebarVisible: (visible: boolean) => void;
  setFontSize: (size: number) => void;
  setFontFamily: (family: string) => void;
  setSidebarWidth: (width: number) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'light',
      sidebarVisible: true,
      fontSize: 16,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      sidebarWidth: 280,

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),

      setTheme: (theme) => set({ theme }),

      toggleSidebar: () =>
        set((state) => ({
          sidebarVisible: !state.sidebarVisible,
        })),

      setSidebarVisible: (visible) => set({ sidebarVisible: visible }),

      setFontSize: (size) => set({ fontSize: size }),

      setFontFamily: (family) => set({ fontFamily: family }),

      setSidebarWidth: (width) => set({ sidebarWidth: width }),
    }),
    {
      name: 'ui-preferences',
    }
  )
);
