import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useUIStore } from '@/infraestructura/store/useUIStore';

// ═══════════════════════════════════════════════════════════
// Integration tests: useUIStore
// ═══════════════════════════════════════════════════════════

const INITIAL: Parameters<typeof useUIStore.setState>[0] = {
  sidebarOpen: false,
  sidebarCollapsed: false,
  localSeleccionadoId: null,
  theme: 'light',
};

beforeEach(() => {
  useUIStore.setState(INITIAL);
  localStorage.clear();
});

// ─── Sidebar ──────────────────────────────────────────────────────────────────

describe('useUIStore — sidebar', () => {
  it('estado inicial: sidebarOpen=false', () => {
    expect(useUIStore.getState().sidebarOpen).toBe(false);
  });

  it('toggleSidebar abre el sidebar', () => {
    act(() => useUIStore.getState().toggleSidebar());
    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });

  it('toggleSidebar dos veces cierra de nuevo', () => {
    act(() => {
      useUIStore.getState().toggleSidebar();
      useUIStore.getState().toggleSidebar();
    });
    expect(useUIStore.getState().sidebarOpen).toBe(false);
  });

  it('setSidebarOpen(true) abre', () => {
    act(() => useUIStore.getState().setSidebarOpen(true));
    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });

  it('setSidebarOpen(false) cierra', () => {
    useUIStore.setState({ sidebarOpen: true });
    act(() => useUIStore.getState().setSidebarOpen(false));
    expect(useUIStore.getState().sidebarOpen).toBe(false);
  });

  it('toggleCollapsed cambia sidebarCollapsed', () => {
    act(() => useUIStore.getState().toggleCollapsed());
    expect(useUIStore.getState().sidebarCollapsed).toBe(true);
    act(() => useUIStore.getState().toggleCollapsed());
    expect(useUIStore.getState().sidebarCollapsed).toBe(false);
  });
});

// ─── Local seleccionado ──────────────────────────────────────────────────────

describe('useUIStore — local seleccionado', () => {
  it('estado inicial: null', () => {
    expect(useUIStore.getState().localSeleccionadoId).toBeNull();
  });

  it('setLocalSeleccionado guarda el id', () => {
    act(() => useUIStore.getState().setLocalSeleccionado('local-abc'));
    expect(useUIStore.getState().localSeleccionadoId).toBe('local-abc');
  });

  it('setLocalSeleccionado(null) limpia el id', () => {
    useUIStore.setState({ localSeleccionadoId: 'x' });
    act(() => useUIStore.getState().setLocalSeleccionado(null));
    expect(useUIStore.getState().localSeleccionadoId).toBeNull();
  });

  it('admite múltiples cambios consecutivos', () => {
    act(() => {
      useUIStore.getState().setLocalSeleccionado('local-1');
      useUIStore.getState().setLocalSeleccionado('local-2');
    });
    expect(useUIStore.getState().localSeleccionadoId).toBe('local-2');
  });
});

// ─── Theme ───────────────────────────────────────────────────────────────────

describe('useUIStore — theme', () => {
  it('estado inicial: light', () => {
    expect(useUIStore.getState().theme).toBe('light');
  });

  it('setTheme("dark") cambia el tema', () => {
    act(() => useUIStore.getState().setTheme('dark'));
    expect(useUIStore.getState().theme).toBe('dark');
  });

  it('setTheme("light") cambia de vuelta a light', () => {
    useUIStore.setState({ theme: 'dark' });
    act(() => useUIStore.getState().setTheme('light'));
    expect(useUIStore.getState().theme).toBe('light');
  });

  it('toggleTheme alterna entre light y dark', () => {
    act(() => useUIStore.getState().toggleTheme());
    expect(useUIStore.getState().theme).toBe('dark');
    act(() => useUIStore.getState().toggleTheme());
    expect(useUIStore.getState().theme).toBe('light');
  });
});
