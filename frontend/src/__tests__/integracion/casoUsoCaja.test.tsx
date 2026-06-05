import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

// ═══════════════════════════════════════════════════════════
// Integration tests: useCajaCasos hooks
// ═══════════════════════════════════════════════════════════

vi.mock('@/infraestructura/repositorios', () => ({
  cajaRepository: {
    obtenerTurnoActivo: vi.fn(),
    abrirTurno: vi.fn(),
    cerrarTurno: vi.fn(),
    obtenerResumenTurno: vi.fn(),
    listarMetodosPago: vi.fn(),
    crearMetodoPago: vi.fn(),
    crearPago: vi.fn(),
    anularPago: vi.fn(),
    listarPagosPorTurno: vi.fn(),
    crearComprobante: vi.fn(),
    anularComprobante: vi.fn(),
  },
}));

import { cajaRepository } from '@/infraestructura/repositorios';
import {
  useTurnoActivo, useAbrirTurno, useCerrarTurno,
  useResumenTurno, useMetodosPago, useCrearMetodoPago,
  useCrearPago, useAnularPago, usePagosPorTurno,
  useCrearComprobante,
} from '@/aplicacion/casos-uso/useCajaCasos';

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

describe('useTurnoActivo — query', () => {
  it('llama a cajaRepository.obtenerTurnoActivo', async () => {
    const mockTurno = { id: 1, estado: 'abierto', monto_apertura: 300 };
    (cajaRepository.obtenerTurnoActivo as ReturnType<typeof vi.fn>).mockResolvedValue(mockTurno);
    const { result } = renderHook(() => useTurnoActivo(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(cajaRepository.obtenerTurnoActivo).toHaveBeenCalledTimes(1);
    expect(result.current.data?.estado).toBe('abierto');
  });

  it('maneja error de repositorio', async () => {
    (cajaRepository.obtenerTurnoActivo as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('No turno'));
    const { result } = renderHook(() => useTurnoActivo(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useMetodosPago — query', () => {
  it('llama a cajaRepository.listarMetodosPago', async () => {
    (cajaRepository.listarMetodosPago as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 1, nombre: 'Efectivo', tipo: 'efectivo' },
    ]);
    const { result } = renderHook(() => useMetodosPago(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(cajaRepository.listarMetodosPago).toHaveBeenCalledTimes(1);
    expect(result.current.data).toHaveLength(1);
  });
});

describe('useResumenTurno — query', () => {
  it('queda idle si turnoId es undefined', () => {
    const { result } = renderHook(() => useResumenTurno(''), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
    expect(cajaRepository.obtenerResumenTurno).not.toHaveBeenCalled();
  });

  it('llama al repositorio cuando hay turnoId', async () => {
    (cajaRepository.obtenerResumenTurno as ReturnType<typeof vi.fn>).mockResolvedValue({ total_ventas: 1200 });
    const { result } = renderHook(() => useResumenTurno('3'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(cajaRepository.obtenerResumenTurno).toHaveBeenCalledWith('3');
  });
});

describe('usePagosPorTurno — query', () => {
  it('queda idle si turnoId es undefined', () => {
    const { result } = renderHook(() => usePagosPorTurno(''), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
    expect(cajaRepository.listarPagosPorTurno).not.toHaveBeenCalled();
  });

  it('carga los pagos cuando turnoId está definido', async () => {
    (cajaRepository.listarPagosPorTurno as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: 1, monto: 50 }]);
    const { result } = renderHook(() => usePagosPorTurno('2'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});

// ─── MUTACIONES ───────────────────────────────────────────

describe('useAbrirTurno — mutation', () => {
  it('llama a cajaRepository.abrirTurno con datos', async () => {
    const turno = { id: 5, estado: 'abierto', monto_apertura: 500 };
    (cajaRepository.abrirTurno as ReturnType<typeof vi.fn>).mockResolvedValue(turno);
    const { result } = renderHook(() => useAbrirTurno(), { wrapper: createWrapper() });
    await act(async () => {
      result.current.mutate({ monto_apertura: 500 });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(cajaRepository.abrirTurno).toHaveBeenCalledWith({ monto_apertura: 500 });
  });
});

describe('useCerrarTurno — mutation', () => {
  it('llama a cajaRepository.cerrarTurno con id y datos', async () => {
    (cajaRepository.cerrarTurno as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 2, estado: 'cerrado' });
    const { result } = renderHook(() => useCerrarTurno(), { wrapper: createWrapper() });
    await act(async () => {
      result.current.mutate({ id: '2', data: { monto_cierre: 1800, observaciones: '' } });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(cajaRepository.cerrarTurno).toHaveBeenCalledWith('2', { monto_cierre: 1800, observaciones: '' });
  });
});

describe('useCrearPago — mutation', () => {
  it('llama a cajaRepository.crearPago con datos', async () => {
    (cajaRepository.crearPago as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 10, monto: 75 });
    const { result } = renderHook(() => useCrearPago(), { wrapper: createWrapper() });
    await act(async () => {
      result.current.mutate({ turnoId: '1', data: { orden_id: 5, monto_total: 75 } });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(cajaRepository.crearPago).toHaveBeenCalledWith('1', { orden_id: 5, monto_total: 75 });
  });
});

describe('useAnularPago — mutation', () => {
  it('llama a cajaRepository.anularPago con id', async () => {
    (cajaRepository.anularPago as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    const { result } = renderHook(() => useAnularPago(), { wrapper: createWrapper() });
    await act(async () => {
      result.current.mutate('3');
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(cajaRepository.anularPago).toHaveBeenCalledWith('3');
  });
});

describe('useCrearMetodoPago — mutation', () => {
  it('llama a cajaRepository.crearMetodoPago', async () => {
    (cajaRepository.crearMetodoPago as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 5 });
    const { result } = renderHook(() => useCrearMetodoPago(), { wrapper: createWrapper() });
    await act(async () => {
      result.current.mutate({ nombre: 'Yape', tipo: 'billetera_digital' });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(cajaRepository.crearMetodoPago).toHaveBeenCalledWith({ nombre: 'Yape', tipo: 'billetera_digital' });
  });
});

describe('useCrearComprobante — mutation', () => {
  it('llama a cajaRepository.crearComprobante', async () => {
    (cajaRepository.crearComprobante as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1, estado: 'emitido' });
    const { result } = renderHook(() => useCrearComprobante(), { wrapper: createWrapper() });
    const data = { pago_id: 3, tipo_comprobante: 'boleta' as const, cliente_nombre: 'Luis' };
    await act(async () => {
      result.current.mutate(data);
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(cajaRepository.crearComprobante).toHaveBeenCalledWith(data);
  });
});
