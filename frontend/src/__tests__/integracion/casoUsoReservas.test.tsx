import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

// ═══════════════════════════════════════════════════════════
// Integration tests: useReservasCasos hooks
// ═══════════════════════════════════════════════════════════

vi.mock('@/infraestructura/repositorios', () => ({
  reservasRepository: {
    listarReservas: vi.fn(),
    obtenerReserva: vi.fn(),
    crearReserva: vi.fn(),
    cambiarEstadoReserva: vi.fn(),
    consultarDisponibilidad: vi.fn(),
    contarReservasHoy: vi.fn(),
  },
}));

import { reservasRepository } from '@/infraestructura/repositorios';
import {
  useReservas, useReserva, useCrearReserva,
  useCambiarEstadoReserva, useConsultarDisponibilidad,
  useReservasTotalHoy,
} from '@/aplicacion/casos-uso/useReservasCasos';

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

describe('useReservas — query', () => {
  it('llama a reservasRepository.listarReservas', async () => {
    (reservasRepository.listarReservas as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    const { result } = renderHook(() => useReservas(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(reservasRepository.listarReservas).toHaveBeenCalledTimes(1);
  });

  it('pasa filtros al repositorio', async () => {
    (reservasRepository.listarReservas as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    const { result } = renderHook(() => useReservas({ estado: 'confirmada' }), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(reservasRepository.listarReservas).toHaveBeenCalledWith({ estado: 'confirmada' });
  });

  it('retorna los datos del repositorio', async () => {
    const mockData = [
      { id: 1, nombre_contacto: 'Ana', numero_personas: 4, estado: 'confirmada' },
    ];
    (reservasRepository.listarReservas as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);
    const { result } = renderHook(() => useReservas(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });
});

describe('useReserva — query por ID', () => {
  it('queda idle si id es undefined', () => {
    const { result } = renderHook(() => useReserva(''), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
    expect(reservasRepository.obtenerReserva).not.toHaveBeenCalled();
  });

  it('queda idle si id es cadena vacía', () => {
    const { result } = renderHook(() => useReserva(''), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
    expect(reservasRepository.obtenerReserva).not.toHaveBeenCalled();
  });

  it('llama al repositorio cuando id está definido', async () => {
    const mockReserva = { id: 3, nombre_contacto: 'Carlos', estado: 'pendiente' };
    (reservasRepository.obtenerReserva as ReturnType<typeof vi.fn>).mockResolvedValue(mockReserva);
    const { result } = renderHook(() => useReserva('3'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(reservasRepository.obtenerReserva).toHaveBeenCalledWith('3');
    expect(result.current.data?.id).toBe(3);
  });

  it('maneja error del repositorio', async () => {
    (reservasRepository.obtenerReserva as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('No encontrada'));
    const { result } = renderHook(() => useReserva('99'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useReservasTotalHoy — query', () => {
  it('llama a reservasRepository.contarReservasHoy', async () => {
    (reservasRepository.contarReservasHoy as ReturnType<typeof vi.fn>).mockResolvedValue({ total: 5 });
    const { result } = renderHook(() => useReservasTotalHoy(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.total).toBe(5);
  });
});

// ─── MUTACIONES ───────────────────────────────────────────

describe('useCrearReserva — mutation', () => {
  it('llama a reservasRepository.crearReserva con datos', async () => {
    const nueva = {
      id: 10, codigo_confirmacion: 'RES-001',
      nombre_contacto: 'María', numero_personas: 3,
    };
    (reservasRepository.crearReserva as ReturnType<typeof vi.fn>).mockResolvedValue(nueva);
    const { result } = renderHook(() => useCrearReserva(), { wrapper: createWrapper() });
    const data = { fecha_reserva: '2025-12-25', hora_inicio: '20:00', numero_personas: 3, nombre_contacto: 'María', telefono_contacto: '987654321' };
    await act(async () => {
      result.current.mutate(data);
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(reservasRepository.crearReserva).toHaveBeenCalledWith(data);
    expect(result.current.data?.codigo_confirmacion).toBe('RES-001');
  });

  it('pone isError=true si falla', async () => {
    (reservasRepository.crearReserva as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Sin disponibilidad'));
    const { result } = renderHook(() => useCrearReserva(), { wrapper: createWrapper() });
    await act(async () => {
      result.current.mutate({ fecha_reserva: '2025-12-25', hora_inicio: '22:00', numero_personas: 10, nombre_contacto: 'X', telefono_contacto: '0' });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useCambiarEstadoReserva — mutation', () => {
  it('llama al repositorio con id y estado', async () => {
    (reservasRepository.cambiarEstadoReserva as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 2, estado: 'confirmada' });
    const { result } = renderHook(() => useCambiarEstadoReserva(), { wrapper: createWrapper() });
    await act(async () => {
      result.current.mutate({ id: '2', estado: 'confirmada' });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(reservasRepository.cambiarEstadoReserva).toHaveBeenCalledWith('2', 'confirmada');
  });

  it('todos los estados válidos pueden ser pasados', async () => {
    const estados = ['pendiente', 'confirmada', 'en_curso', 'completada', 'cancelada', 'no_show'] as const;
    for (const estado of estados) {
      vi.clearAllMocks();
      (reservasRepository.cambiarEstadoReserva as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1, estado });
      const { result } = renderHook(() => useCambiarEstadoReserva(), { wrapper: createWrapper() });
      await act(async () => {
        result.current.mutate({ id: '1', estado });
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(reservasRepository.cambiarEstadoReserva).toHaveBeenCalledWith('1', estado);
    }
  });
});

describe('useConsultarDisponibilidad — mutation', () => {
  it('llama a reservasRepository.consultarDisponibilidad con datos', async () => {
    const mockResult = { disponible: true, mesas_sugeridas: [3, 7, 8] };
    (reservasRepository.consultarDisponibilidad as ReturnType<typeof vi.fn>).mockResolvedValue(mockResult);
    const { result } = renderHook(() => useConsultarDisponibilidad(), { wrapper: createWrapper() });
    const data = { fecha: '2025-12-25', hora: '19:00', personas: 4 };
    await act(async () => {
      result.current.mutate(data);
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(reservasRepository.consultarDisponibilidad).toHaveBeenCalledWith(data);
    expect(result.current.data?.disponible).toBe(true);
    expect(result.current.data?.mesas_sugeridas).toHaveLength(3);
  });

  it('retorna disponible=false si no hay mesas', async () => {
    (reservasRepository.consultarDisponibilidad as ReturnType<typeof vi.fn>).mockResolvedValue({ disponible: false, mesas_sugeridas: [] });
    const { result } = renderHook(() => useConsultarDisponibilidad(), { wrapper: createWrapper() });
    await act(async () => {
      result.current.mutate({ fecha: '2025-12-31', hora: '21:00', personas: 10 });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.disponible).toBe(false);
    expect(result.current.data?.mesas_sugeridas).toHaveLength(0);
  });
});
