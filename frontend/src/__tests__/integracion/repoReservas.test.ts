import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DEMO_RESERVAS } from '@/compartidos/demoData';

// ═══════════════════════════════════════════════════════════
// Integration tests: reservasRepository (demo + API)
// ═══════════════════════════════════════════════════════════

vi.mock('@/infraestructura/store/useAuthStore', () => ({
  useAuthStore: { getState: vi.fn(() => ({ isDemoMode: false })) },
}));

vi.mock('@/infraestructura/api/httpClient', () => ({
  apiGet: vi.fn().mockResolvedValue([]),
  apiPost: vi.fn().mockResolvedValue({}),
  apiPatch: vi.fn().mockResolvedValue({}),
}));

import { useAuthStore } from '@/infraestructura/store/useAuthStore';
import { reservasRepository } from '@/infraestructura/repositorios';
import * as httpClient from '@/infraestructura/api/httpClient';

const setDemo = (val: boolean) =>
  (useAuthStore.getState as ReturnType<typeof vi.fn>).mockReturnValue({ isDemoMode: val });

beforeEach(() => {
  vi.clearAllMocks();
  setDemo(false);
});

// ─── MODO DEMO ─────────────────────────────────────────────

describe('reservasRepository — modo demo', () => {
  beforeEach(() => setDemo(true));

  it('listarReservas retorna DEMO_RESERVAS (al menos 3)', async () => {
    const result = await reservasRepository.listarReservas();
    expect(result.length).toBeGreaterThanOrEqual(3);
    expect(result).toEqual(DEMO_RESERVAS);
    expect(httpClient.apiGet).not.toHaveBeenCalled();
  });

  it('listarReservas acepta filtros sin llamar API', async () => {
    const result = await reservasRepository.listarReservas({ estado: 'confirmada' });
    // En demo los filtros se ignoran, pero retorna array
    expect(Array.isArray(result)).toBe(true);
  });

  it('obtenerReserva(1) retorna la reserva con id=1', async () => {
    const result = await reservasRepository.obtenerReserva('1');
    expect(result.id).toBe(1);
    expect(httpClient.apiGet).not.toHaveBeenCalled();
  });

  it('obtenerReserva con id no existente retorna primera reserva', async () => {
    const result = await reservasRepository.obtenerReserva('9999');
    expect(result.id).toBe(DEMO_RESERVAS[0]!.id);
  });

  it('crearReserva retorna objeto con id generado', async () => {
    const data = {
      fecha: '2025-12-25', hora: '20:00',
      numero_personas: 4, nombre_contacto: 'Carlos',
      telefono_contacto: '987654321',
    };
    const result = await reservasRepository.crearReserva(data);
    expect(result.id).toBeTruthy();
    expect(result.numero_personas).toBe(4);
    expect(httpClient.apiPost).not.toHaveBeenCalled();
  });

  it('cambiarEstadoReserva retorna reserva con nuevo estado', async () => {
    const result = await reservasRepository.cambiarEstadoReserva('1', 'confirmada');
    expect(result.estado).toBe('confirmada');
    expect(httpClient.apiPatch).not.toHaveBeenCalled();
  });

  it('consultarDisponibilidad retorna { disponible: true, mesas_sugeridas: [...] }', async () => {
    const result = await reservasRepository.consultarDisponibilidad({
      fecha: '2025-12-25', hora: '19:00', personas: 2,
    }) as { disponible: boolean; mesas_sugeridas: number[] };
    expect(result.disponible).toBe(true);
    expect(Array.isArray(result.mesas_sugeridas)).toBe(true);
    expect(result.mesas_sugeridas.length).toBeGreaterThan(0);
  });

  it('contarReservasHoy retorna { total: 3 }', async () => {
    const result = await reservasRepository.contarReservasHoy();
    expect(result.total).toBe(DEMO_RESERVAS.length);
    expect(result.total).toBe(3);
  });
});

// ─── MODO API ─────────────────────────────────────────────

describe('reservasRepository — modo API', () => {
  it('listarReservas llama GET /reservas', async () => {
    (httpClient.apiGet as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    await reservasRepository.listarReservas({ estado: 'pendiente' });
    expect(httpClient.apiGet).toHaveBeenCalledWith('/reservas', { estado: 'pendiente' });
  });

  it('obtenerReserva llama GET /reservas/:id', async () => {
    (httpClient.apiGet as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 5 });
    await reservasRepository.obtenerReserva('5');
    expect(httpClient.apiGet).toHaveBeenCalledWith('/reservas/5');
  });

  it('crearReserva llama POST /reservas con datos', async () => {
    const data = { fecha: '2025-12-25', hora: '20:00', numero_personas: 3, nombre_contacto: 'Ana', telefono_contacto: '9876' };
    (httpClient.apiPost as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 11, ...data });
    await reservasRepository.crearReserva(data);
    expect(httpClient.apiPost).toHaveBeenCalledWith('/reservas', data);
  });

  it('cambiarEstadoReserva llama PATCH /reservas/:id/estado', async () => {
    (httpClient.apiPatch as ReturnType<typeof vi.fn>).mockResolvedValue({});
    await reservasRepository.cambiarEstadoReserva('3', 'confirmada');
    expect(httpClient.apiPatch).toHaveBeenCalledWith('/reservas/3/estado', { estado: 'confirmada' });
  });

  it('consultarDisponibilidad llama POST /reservas/disponibilidad', async () => {
    const data = { fecha: '2025-12-25', hora: '19:00', personas: 4 };
    (httpClient.apiPost as ReturnType<typeof vi.fn>).mockResolvedValue({ disponible: true });
    await reservasRepository.consultarDisponibilidad(data);
    expect(httpClient.apiPost).toHaveBeenCalledWith('/reservas/disponibilidad', data);
  });

  it('contarReservasHoy llama GET /reservas/hoy/total', async () => {
    (httpClient.apiGet as ReturnType<typeof vi.fn>).mockResolvedValue({ total: 7 });
    await reservasRepository.contarReservasHoy();
    expect(httpClient.apiGet).toHaveBeenCalledWith('/reservas/hoy/total');
  });
});
