import { describe, it, expect, vi, beforeEach } from 'vitest';

// ═══════════════════════════════════════════════════════════
// Integration tests: cajaRepository (demo + API)
// ═══════════════════════════════════════════════════════════

vi.mock('@/infraestructura/store/useAuthStore', () => ({
  useAuthStore: { getState: vi.fn(() => ({ isDemoMode: false })) },
}));

vi.mock('@/infraestructura/api/httpClient', () => ({
  apiGet: vi.fn().mockResolvedValue([]),
  apiPost: vi.fn().mockResolvedValue({}),
  apiPut: vi.fn().mockResolvedValue({}),
  apiPatch: vi.fn().mockResolvedValue({}),
  apiDelete: vi.fn().mockResolvedValue(undefined),
}));

import { useAuthStore } from '@/infraestructura/store/useAuthStore';
import { cajaRepository } from '@/infraestructura/repositorios';
import * as httpClient from '@/infraestructura/api/httpClient';

const setDemo = (val: boolean) =>
  (useAuthStore.getState as ReturnType<typeof vi.fn>).mockReturnValue({ isDemoMode: val });

beforeEach(() => {
  vi.clearAllMocks();
  setDemo(false);
});

// ─── MODO DEMO ─────────────────────────────────────────────

describe('cajaRepository — modo demo', () => {
  beforeEach(() => setDemo(true));

  it('obtenerTurnoActivo retorna turno en estado "abierto"', async () => {
    const result = await cajaRepository.obtenerTurnoActivo();
    expect(result.estado).toBe('abierto');
    expect(httpClient.apiGet).not.toHaveBeenCalled();
  });

  it('listarMetodosPago retorna 4 métodos', async () => {
    const result = await cajaRepository.listarMetodosPago();
    expect(result.length).toBeGreaterThanOrEqual(4);
    const tipos = result.map((m) => m.tipo);
    expect(tipos).toContain('efectivo');
    expect(tipos).toContain('tarjeta');
  });

  it('abrirTurno retorna turno con monto_apertura provisto', async () => {
    const result = await cajaRepository.abrirTurno({ monto_apertura: 300 });
    expect(result.monto_apertura).toBe(300);
    expect(result.estado).toBe('abierto');
    expect(httpClient.apiPost).not.toHaveBeenCalled();
  });

  it('cerrarTurno retorna turno con estado "cerrado"', async () => {
    const result = await cajaRepository.cerrarTurno('1', { monto_cierre: 1500, observaciones: '' });
    expect(result.estado).toBe('cerrado');
    expect(result.monto_cierre).toBe(1500);
  });

  it('obtenerResumenTurno retorna objeto con total_ventas', async () => {
    const result = await cajaRepository.obtenerResumenTurno('1');
    expect(result).toHaveProperty('total_ventas');
    expect(typeof result.total_ventas).toBe('number');
  });

  it('crearPago retorna objeto con id', async () => {
    const result = await cajaRepository.crearPago('1', {
      orden_id: 1, monto_total: 50,
    });
    expect(result.id).toBeTypeOf('number');
    expect(httpClient.apiPost).not.toHaveBeenCalled();
  });

  it('anularPago en demo retorna undefined', async () => {
    const result = await cajaRepository.anularPago('1');
    expect(result).toBeUndefined();
  });

  it('crearComprobante en demo retorna comprobante con id', async () => {
    const result = await cajaRepository.crearComprobante({
      pago_id: 1, tipo_comprobante: 'boleta', cliente_nombre: 'Juan',
    });
    expect(result.id).toBeTypeOf('number');
  });
});

// ─── MODO API ─────────────────────────────────────────────

describe('cajaRepository — modo API', () => {
  it('obtenerTurnoActivo llama GET /caja/turnos/activo', async () => {
    (httpClient.apiGet as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1, estado: 'abierto' });
    await cajaRepository.obtenerTurnoActivo();
    expect(httpClient.apiGet).toHaveBeenCalledWith('/caja/turnos/activo');
  });

  it('abrirTurno llama POST /caja/turnos/abrir con datos', async () => {
    const data = { monto_apertura: 200, observaciones: 'Apertura mañana' };
    (httpClient.apiPost as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 5, ...data });
    await cajaRepository.abrirTurno(data);
    expect(httpClient.apiPost).toHaveBeenCalledWith('/caja/turnos/abrir', data);
  });

  it('cerrarTurno llama POST /caja/turnos/:id/cerrar', async () => {
    (httpClient.apiPost as ReturnType<typeof vi.fn>).mockResolvedValue({});
    await cajaRepository.cerrarTurno('3', { monto_cierre: 1000, observaciones: '' });
    expect(httpClient.apiPost).toHaveBeenCalledWith('/caja/turnos/3/cerrar', { monto_cierre: 1000, observaciones: '' });
  });

  it('obtenerResumenTurno llama GET /caja/turnos/:id/resumen', async () => {
    (httpClient.apiGet as ReturnType<typeof vi.fn>).mockResolvedValue({ total_ventas: 500 });
    await cajaRepository.obtenerResumenTurno('2');
    expect(httpClient.apiGet).toHaveBeenCalledWith('/caja/turnos/2/resumen');
  });

  it('listarMetodosPago llama GET /caja/metodos-pago', async () => {
    (httpClient.apiGet as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    await cajaRepository.listarMetodosPago();
    expect(httpClient.apiGet).toHaveBeenCalledWith('/caja/metodos-pago');
  });

  it('crearPago llama POST /caja/pagos/turno/:id', async () => {
    const data = { orden_id: 2, metodo_pago_id: 1, monto: 80 };
    (httpClient.apiPost as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 88, ...data });
    await cajaRepository.crearPago('1', data);
    expect(httpClient.apiPost).toHaveBeenCalledWith('/caja/pagos/turno/1', data);
  });

  it('anularPago llama POST /caja/pagos/:id/anular', async () => {
    (httpClient.apiPost as ReturnType<typeof vi.fn>).mockResolvedValue({});
    await cajaRepository.anularPago('4');
    expect(httpClient.apiPost).toHaveBeenCalledWith('/caja/pagos/4/anular');
  });

  it('listarPagosPorTurno llama GET /caja/pagos/turno/:id', async () => {
    (httpClient.apiGet as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    await cajaRepository.listarPagosPorTurno('1');
    expect(httpClient.apiGet).toHaveBeenCalledWith('/caja/pagos/turno/1');
  });

  it('crearComprobante llama POST /caja/comprobantes', async () => {
    const data = { pago_id: 1, tipo_comprobante: 'boleta' as const, cliente_nombre: 'Test' };
    (httpClient.apiPost as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1 });
    await cajaRepository.crearComprobante(data);
    expect(httpClient.apiPost).toHaveBeenCalledWith('/caja/comprobantes', data);
  });

  it('anularComprobante llama POST /caja/comprobantes/:id/anular', async () => {
    (httpClient.apiPost as ReturnType<typeof vi.fn>).mockResolvedValue({});
    await cajaRepository.anularComprobante('9');
    expect(httpClient.apiPost).toHaveBeenCalledWith('/caja/comprobantes/9/anular');
  });
});
