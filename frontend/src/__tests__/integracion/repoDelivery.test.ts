import { describe, it, expect, vi, beforeEach } from 'vitest';

// ═══════════════════════════════════════════════════════════
// Integration tests: deliveryRepository (always API, no demo mode)
// ═══════════════════════════════════════════════════════════

vi.mock('@/infraestructura/api/httpClient', () => ({
  apiGet: vi.fn().mockResolvedValue([]),
  apiPost: vi.fn().mockResolvedValue({}),
  apiPut: vi.fn().mockResolvedValue({}),
  apiPatch: vi.fn().mockResolvedValue({}),
  apiDelete: vi.fn().mockResolvedValue(undefined),
}));

import { deliveryRepository } from '@/infraestructura/repositorios';
import * as httpClient from '@/infraestructura/api/httpClient';

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── ZONAS ─────────────────────────────────────────────────

describe('deliveryRepository — zonas', () => {
  it('listarZonas llama GET /delivery/zonas', async () => {
    (httpClient.apiGet as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    await deliveryRepository.listarZonas();
    expect(httpClient.apiGet).toHaveBeenCalledWith('/delivery/zonas');
  });

  it('crearZona llama POST /delivery/zonas con datos', async () => {
    const data = { nombre: 'Surco', radio_km: 5, costo_envio: 8 };
    (httpClient.apiPost as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1, ...data });
    await deliveryRepository.crearZona(data);
    expect(httpClient.apiPost).toHaveBeenCalledWith('/delivery/zonas', data);
  });

  it('actualizarZona llama PUT /delivery/zonas/:id', async () => {
    (httpClient.apiPut as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 2 });
    await deliveryRepository.actualizarZona('2', { costo_envio: 10 });
    expect(httpClient.apiPut).toHaveBeenCalledWith('/delivery/zonas/2', { costo_envio: 10 });
  });

  it('eliminarZona llama DELETE /delivery/zonas/:id', async () => {
    (httpClient.apiDelete as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    await deliveryRepository.eliminarZona('3');
    expect(httpClient.apiDelete).toHaveBeenCalledWith('/delivery/zonas/3');
  });
});

// ─── ÓRDENES DELIVERY ─────────────────────────────────────

describe('deliveryRepository — órdenes delivery', () => {
  it('listarDeliveryOrdenes llama GET /delivery/ordenes', async () => {
    (httpClient.apiGet as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    await deliveryRepository.listarDeliveryOrdenes({ estado: 'pendiente' });
    expect(httpClient.apiGet).toHaveBeenCalledWith('/delivery/ordenes', { estado: 'pendiente' });
  });

  it('listarDeliveryOrdenes sin filtros llama apiGet sin params', async () => {
    (httpClient.apiGet as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    await deliveryRepository.listarDeliveryOrdenes();
    expect(httpClient.apiGet).toHaveBeenCalledWith('/delivery/ordenes', undefined);
  });

  it('obtenerDeliveryOrden llama GET /delivery/ordenes/:id', async () => {
    (httpClient.apiGet as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 7 });
    await deliveryRepository.obtenerDeliveryOrden('7');
    expect(httpClient.apiGet).toHaveBeenCalledWith('/delivery/ordenes/7');
  });

  it('crearDeliveryOrden llama POST /delivery/ordenes con datos', async () => {
    const data = { orden_id: 10, zona_delivery_id: 1, direccion_entrega: 'Jr. Test 123' };
    (httpClient.apiPost as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 20, ...data });
    await deliveryRepository.crearDeliveryOrden(data);
    expect(httpClient.apiPost).toHaveBeenCalledWith('/delivery/ordenes', data);
  });

  it('asignarRepartidor llama POST /delivery/ordenes/:id/asignar', async () => {
    (httpClient.apiPost as ReturnType<typeof vi.fn>).mockResolvedValue({});
    await deliveryRepository.asignarRepartidor('5', { repartidor_id: '3' });
    expect(httpClient.apiPost).toHaveBeenCalledWith('/delivery/ordenes/5/asignar', { repartidor_id: '3' });
  });

  it('actualizarEstadoDelivery llama PATCH /delivery/ordenes/:id/estado', async () => {
    (httpClient.apiPatch as ReturnType<typeof vi.fn>).mockResolvedValue({});
    await deliveryRepository.actualizarEstadoDelivery('8', 'en_camino');
    expect(httpClient.apiPatch).toHaveBeenCalledWith('/delivery/ordenes/8/estado', { estado: 'en_camino' });
  });

  it('obtenerSeguimiento llama GET /delivery/ordenes/:id/seguimiento', async () => {
    (httpClient.apiGet as ReturnType<typeof vi.fn>).mockResolvedValue({ estado: 'en_camino' });
    await deliveryRepository.obtenerSeguimiento('4');
    expect(httpClient.apiGet).toHaveBeenCalledWith('/delivery/ordenes/4/seguimiento');
  });
});
