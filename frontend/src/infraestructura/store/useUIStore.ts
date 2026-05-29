import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════
// Store: UI — sidebar, theme, local seleccionado, modals
// ═══════════════════════════════════════════════════════════

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  localSeleccionadoId: string | null;
  theme: 'light' | 'dark';

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleCollapsed: () => void;
  setLocalSeleccionado: (id: string | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

/** Resolves initial theme: persisted → system preference → light */
function resolveInitialTheme(): 'light' | 'dark' {
  try {
    const stored = JSON.parse(localStorage.getItem('restauflow-ui') || '{}');
    if (stored?.state?.theme) return stored.state.theme;
  } catch (_) {}
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarOpen: false,
      sidebarCollapsed: false,
      localSeleccionadoId: null,
      theme: resolveInitialTheme(),

      toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleCollapsed: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      setLocalSeleccionado: (id) => set({ localSeleccionadoId: id }),
      setTheme: (theme) => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        set({ theme });
      },
      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', next === 'dark');
        set({ theme: next });
      },
    }),
    {
      name: 'restauflow-ui',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        localSeleccionadoId: state.localSeleccionadoId,
        theme: state.theme,
      }),
    },
  ),
);

export default useUIStore;
