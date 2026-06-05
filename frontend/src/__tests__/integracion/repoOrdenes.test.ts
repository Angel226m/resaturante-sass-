import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DEMO_ORDENES } from '@/compartidos/demoData';

// ═══════════════════════════════════════════════════════════
// Integration tests: ordenesRepository (demo + API)
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
import { ordenesRepository } from '@/infraestructura/repositorios';
import * as httpClient from '@/infraestructura/api/httpClient';

const setDemo = (val: boolean) =>
  (useAuthStore.getState as ReturnType<typeof vi.fn>).mockReturnValue({ isDemoMode: val });

beforeEach(() => {
  vi.clearAllMocks();
  setDemo(false);
});

// ─── MODO DEMO ─────────────────────────────────────────────

describe('ordenesRepository — modo demo', () => {
  beforeEach(() => setDemo(true));

  it('listarOrdenes retorna DEMO_ORDENES', async () => {
    const result = await ordenesRepository.listarOrdenes();
    expect(result).toEqual(DEMO_ORDENES);
    expect(httpClient.apiGet).not.toHaveBeenCalled();
  });

  it('obtenerOrden(1) retorna la orden con id=1', async () => {
    const result = await ordenesRepository.obtenerOrden('1');
    expect(result.id).toBe(1);
  });

  it('obtenerOrden con id inválido retorna primera orden', async () => {
    const result = await ordenesRepository.obtenerOrden('9999');
    expect(result.id).toBe(DEMO_ORDENES[0]!.id);
  });

  it('crearOrden retorna objeto con numero_orden generado', async () => {
    const result = await ordenesRepository.crearOrden({ tipo_orden: 'mesa', notas: '' });
    expect(result.numero_orden).toMatch(/ORD-/);
    expect(result.id).toBeTypeOf('number');
  });

  it('cambiarEstadoOrden retorna orden con nuevo estado', async () => {
    const result = await ordenesRepository.cambiarEstadoOrden('1', 'en_preparacion');
    expect(result.estado).toBe('en_preparacion');
    expect(httpClient.apiPatch).not.toHaveBeenCalled();
  });

  it('agregarItemOrden retorna item con id generado', async () => {
    const result = await ordenesRepository.agregarItemOrden('1', { cantidad: 2, precio_unitario: 35 });
    expect(result.id).toBeTypeOf('number');
    expect(result.cantidad).toBe(2);
  });

  it('contarOrdenesActivas retorna total de órdenes no terminadas', async () => {
    const result = await ordenesRepository.contarOrdenesActivas();
    const activeCount = DEMO_ORDENES.filter(
      o => o.estado !== 'entregada' && o.estado !== 'cancelada',
    ).length;
    expect(result.total).toBe(activeCount);
  });

  it('listarTicketsCocina en demo retorna array vacío', async () => {
    const result = await ordenesRepository.listarTicketsCocina();
    expect(result).toHaveLength(0);
  });

  it('cambiarEstadoTicket en demo retorna objeto con el estado', async () => {
    const result = await ordenesRepository.cambiarEstadoTicket('5', 'listo');
    expect(result.estado).toBe('listo');
    expect(result.id).toBe(5);
  });
});

// ─── MODO API ─────────────────────────────────────────────

describe('ordenesRepository — modo API', () => {
  it('listarOrdenes llama GET /ordenes', async () => {
    (httpClient.apiGet as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    await ordenesRepository.listarOrdenes({ estado: 'pendiente' });
    expect(httpClient.apiGet).toHaveBeenCalledWith('/ordenes', { estado: 'pendiente' });
  });

  it('obtenerOrden llama GET /ordenes/:id', async () => {
    (httpClient.apiGet as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 42 });
    await ordenesRepository.obtenerOrden('42');
    expect(httpClient.apiGet).toHaveBeenCalledWith('/ordenes/42');
  });

  it('crearOrden llama POST /ordenes con datos', async () => {
    const data = { tipo_orden: 'mesa' as const, mesa_id: 3, notas: '' };
    (httpClient.apiPost as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 10, ...data });
    await ordenesRepository.crearOrden(data);
    expect(httpClient.apiPost).toHaveBeenCalledWith('/ordenes', data);
  });

  it('cambiarEstadoOrden llama PATCH /ordenes/:id/estado', async () => {
    (httpClient.apiPatch as ReturnType<typeof vi.fn>).mockResolvedValue({});
    await ordenesRepository.cambiarEstadoOrden('7', 'lista');
    expect(httpClient.apiPatch).toHaveBeenCalledWith('/ordenes/7/estado', { estado: 'lista' });
  });

  it('agregarItemOrden llama POST /ordenes/:id/items', async () => {
    (httpClient.apiPost as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 99 });
    await ordenesRepository.agregarItemOrden('3', { producto_menu_id: 10 });
    expect(httpClient.apiPost).toHaveBeenCalledWith('/ordenes/3/items', { producto_menu_id: 10 });
  });

  it('contarOrdenesActivas llama GET /ordenes/activas/total', async () => {
    (httpClient.apiGet as ReturnType<typeof vi.fn>).mockResolvedValue({ total: 5 });
    await ordenesRepository.contarOrdenesActivas();
    expect(httpClient.apiGet).toHaveBeenCalledWith('/ordenes/activas/total');
  });

  it('listarTicketsCocina llama GET /cocina/tickets', async () => {
    (httpClient.apiGet as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    await ordenesRepository.listarTicketsCocina({ estacion: 'parrilla' });
    expect(httpClient.apiGet).toHaveBeenCalledWith('/cocina/tickets', { estacion: 'parrilla' });
  });

  it('crearTicketCocina llama POST /cocina/tickets', async () => {
    (httpClient.apiPost as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1 });
    await ordenesRepository.crearTicketCocina({ orden_id: 5, estacion_cocina: 'Parrilla' });
    expect(httpClient.apiPost).toHaveBeenCalledWith('/cocina/tickets', { orden_id: 5, estacion_cocina: 'Parrilla' });
  });

  it('cambiarEstadoTicket llama PATCH /cocina/tickets/:id/estado', async () => {
    (httpClient.apiPatch as ReturnType<typeof vi.fn>).mockResolvedValue({});
    await ordenesRepository.cambiarEstadoTicket('8', 'en_preparacion');
    expect(httpClient.apiPatch).toHaveBeenCalledWith('/cocina/tickets/8/estado', { estado: 'en_preparacion' });
  });
});
