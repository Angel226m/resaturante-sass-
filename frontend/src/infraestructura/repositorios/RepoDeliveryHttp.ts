import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from '../api/httpClient';
import type { DeliveryOrden, ZonaDelivery } from '@/dominio/entidades';

// ═══════════════════════════════════════════════════════════
// Repository: Delivery (Zonas + Órdenes)
// ═══════════════════════════════════════════════════════════

export const deliveryRepository = {
  // Zonas
  listarZonas: () => apiGet<ZonaDelivery[]>('/delivery/zonas'),
  crearZona: (data: Partial<ZonaDelivery>) => apiPost<ZonaDelivery>('/delivery/zonas', data),
  actualizarZona: (id: string, data: Partial<ZonaDelivery>) => apiPut<ZonaDelivery>(`/delivery/zonas/${id}`, data),
  eliminarZona: (id: string) => apiDelete(`/delivery/zonas/${id}`),

  // Órdenes delivery
  listarDeliveryOrdenes: (params?: Record<string, unknown>) => apiGet<DeliveryOrden[]>('/delivery/ordenes', params),
  obtenerDeliveryOrden: (id: string) => apiGet<DeliveryOrden>(`/delivery/ordenes/${id}`),
  crearDeliveryOrden: (data: Partial<DeliveryOrden>) => apiPost<DeliveryOrden>('/delivery/ordenes', data),
  asignarRepartidor: (id: string, data: { repartidor_id: string }) => apiPost(`/delivery/ordenes/${id}/asignar`, data),
  actualizarEstadoDelivery: (id: string, estado: string) => apiPatch<DeliveryOrden>(`/delivery/ordenes/${id}/estado`, { estado }),
  obtenerSeguimiento: (id: string) => apiGet(`/delivery/ordenes/${id}/seguimiento`),
};

export default deliveryRepository;
