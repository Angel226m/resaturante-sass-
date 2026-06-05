import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

// ═══════════════════════════════════════════════════════════
// Integration tests: useOrdenesCasos hooks
// ═══════════════════════════════════════════════════════════

vi.mock('@/infraestructura/repositorios', () => ({
  ordenesRepository: {
    listarOrdenes: vi.fn(),
    obtenerOrden: vi.fn(),
    crearOrden: vi.fn(),
    cambiarEstadoOrden: vi.fn(),
    agregarItemOrden: vi.fn(),
    contarOrdenesActivas: vi.fn(),
    listarTicketsCocina: vi.fn(),
    crearTicketCocina: vi.fn(),
    cambiarEstadoTicket: vi.fn(),
  },
}));

import { ordenesRepository } from '@/infraestructura/repositorios';
import {
  useOrdenes, useOrden, useCrearOrden,
  useCambiarEstadoOrden, useAgregarItemOrden,
  useOrdenesActivasTotal, useTicketsCocina,
  useCrearTicketCocina, useCambiarEstadoTicket,
} from '@/aplicacion/casos-uso/useOrdenesCasos';

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

beforeEach(() => vi.clearAllMocks());

// ─── QUERIES ──────────────────────────────────────────────

describe('useOrdenes — query', () => {
  it('llama a ordenesRepository.listarOrdenes', async () => {
    (ordenesRepository.listarOrdenes as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    const { result } = renderHook(() => useOrdenes(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(ordenesRepository.listarOrdenes).toHaveBeenCalledTimes(1);
  });

  it('pasa filtros al repositorio', async () => {
    (ordenesRepository.listarOrdenes as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    const { result } = renderHook(() => useOrdenes({ estado: 'pendiente' }), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(ordenesRepository.listarOrdenes).toHaveBeenCalledWith({ estado: 'pendiente' });
  });
});

describe('useOrden — query por ID', () => {
  it('queda idle si id es undefined', () => {
    const { result } = renderHook(() => useOrden(''), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
    expect(ordenesRepository.obtenerOrden).not.toHaveBeenCalled();
  });

  it('carga la orden cuando se pasa id', async () => {
    const mockOrden = { id: 5, numero_orden: 'ORD-005', estado: 'pendiente' };
    (ordenesRepository.obtenerOrden as ReturnType<typeof vi.fn>).mockResolvedValue(mockOrden);
    const { result } = renderHook(() => useOrden('5'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(ordenesRepository.obtenerOrden).toHaveBeenCalledWith('5');
  });
});

describe('useOrdenesActivasTotal — query', () => {
  it('llama a ordenesRepository.contarOrdenesActivas', async () => {
    (ordenesRepository.contarOrdenesActivas as ReturnType<typeof vi.fn>).mockResolvedValue({ total: 4 });
    const { result } = renderHook(() => useOrdenesActivasTotal(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ total: 4 });
  });
});

describe('useTicketsCocina — query', () => {
  it('llama a ordenesRepository.listarTicketsCocina', async () => {
    (ordenesRepository.listarTicketsCocina as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    const { result } = renderHook(() => useTicketsCocina(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(ordenesRepository.listarTicketsCocina).toHaveBeenCalledTimes(1);
  });
});

// ─── MUTACIONES ───────────────────────────────────────────

describe('useCrearOrden — mutation', () => {
  it('llama a ordenesRepository.crearOrden con datos', async () => {
    const nueva = { id: 10, numero_orden: 'ORD-010', tipo_orden: 'mesa', estado: 'pendiente' };
    (ordenesRepository.crearOrden as ReturnType<typeof vi.fn>).mockResolvedValue(nueva);
    const { result } = renderHook(() => useCrearOrden(), { wrapper: createWrapper() });
    await act(async () => {
      result.current.mutate({ tipo_orden: 'mesa', mesa_id: 3 });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(ordenesRepository.crearOrden).toHaveBeenCalledWith({ tipo_orden: 'mesa', mesa_id: 3 });
    expect(result.current.data).toEqual(nueva);
  });

  it('pone isError=true si falla', async () => {
    (ordenesRepository.crearOrden as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Error'));
    const { result } = renderHook(() => useCrearOrden(), { wrapper: createWrapper() });
    await act(async () => {
      result.current.mutate({ tipo_orden: 'para_llevar' });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useCambiarEstadoOrden — mutation', () => {
  it('llama al repositorio con id y estado', async () => {
    (ordenesRepository.cambiarEstadoOrden as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 3, estado: 'lista' });
    const { result } = renderHook(() => useCambiarEstadoOrden(), { wrapper: createWrapper() });
    await act(async () => {
      result.current.mutate({ id: '3', estado: 'lista' });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(ordenesRepository.cambiarEstadoOrden).toHaveBeenCalledWith('3', 'lista');
  });
});

describe('useAgregarItemOrden — mutation', () => {
  it('llama a ordenesRepository.agregarItemOrden', async () => {
    (ordenesRepository.agregarItemOrden as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 50, cantidad: 2 });
    const { result } = renderHook(() => useAgregarItemOrden(), { wrapper: createWrapper() });
    await act(async () => {
      result.current.mutate({ id: '3', data: { producto_menu_id: 5, cantidad: 2 } });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(ordenesRepository.agregarItemOrden).toHaveBeenCalledWith('3', { producto_menu_id: 5, cantidad: 2 });
  });
});

describe('useCrearTicketCocina — mutation', () => {
  it('llama a ordenesRepository.crearTicketCocina', async () => {
    (ordenesRepository.crearTicketCocina as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1 });
    const { result } = renderHook(() => useCrearTicketCocina(), { wrapper: createWrapper() });
    await act(async () => {
      result.current.mutate({ orden_id: 5, estacion_cocina: 'Parrilla' });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(ordenesRepository.crearTicketCocina).toHaveBeenCalledWith({ orden_id: 5, estacion_cocina: 'Parrilla' });
  });
});

describe('useCambiarEstadoTicket — mutation', () => {
  it('llama al repositorio con id y estado', async () => {
    (ordenesRepository.cambiarEstadoTicket as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 2, estado: 'listo' });
    const { result } = renderHook(() => useCambiarEstadoTicket(), { wrapper: createWrapper() });
    await act(async () => {
      result.current.mutate({ id: '2', estado: 'listo' });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(ordenesRepository.cambiarEstadoTicket).toHaveBeenCalledWith('2', 'listo');
  });
});
