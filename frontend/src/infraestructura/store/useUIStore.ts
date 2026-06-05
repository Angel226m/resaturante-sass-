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
  notifications: AppNotification[];

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleCollapsed: () => void;
  setLocalSeleccionado: (id: string | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  pushNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'> & { id?: string }) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  dismissNotification: (id: string) => void;
  clearNotifications: () => void;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  createdAt: string;
  read: boolean;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarOpen: false,
      sidebarCollapsed: false,
      localSeleccionadoId: null,
      theme: 'light',
      notifications: [],

      toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleCollapsed: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      setLocalSeleccionado: (id) => set({ localSeleccionadoId: id }),
      setTheme: () => {
        document.documentElement.classList.remove('dark');
        set({ theme: 'light' });
      },
      toggleTheme: () => {
        document.documentElement.classList.remove('dark');
        set({ theme: 'light' });
      },
      pushNotification: (notification) => set((state) => {
        const id = notification.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const next: AppNotification = {
          id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          createdAt: new Date().toISOString(),
          read: false,
        };

        const deduped = state.notifications.filter((n) => n.id !== id);
        return { notifications: [next, ...deduped].slice(0, 50) };
      }),
      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      })),
      markAllNotificationsRead: () => set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      })),
      dismissNotification: (id) => set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      })),
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'restauflow-ui',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        localSeleccionadoId: state.localSeleccionadoId,
        theme: state.theme,
        notifications: state.notifications,
      }),
    },
  ),
);

export default useUIStore;
