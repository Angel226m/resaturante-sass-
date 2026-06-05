import type { DeliveryOrden, ZonaDelivery } from '@/dominio/entidades';

// ═══════════════════════════════════════════════════════════
// Puerto: IDeliveryRepo — contrato de delivery
// ═══════════════════════════════════════════════════════════

export interface IDeliveryRepo {
  listarZonas(): Promise<ZonaDelivery[]>;
  crearZona(data: Partial<ZonaDelivery>): Promise<ZonaDelivery>;
  actualizarZona(id: string, data: Partial<ZonaDelivery>): Promise<ZonaDelivery>;
  eliminarZona(id: string): Promise<void>;

  listarDeliveryOrdenes(params?: Record<string, unknown>): Promise<DeliveryOrden[]>;
  obtenerDeliveryOrden(id: string): Promise<DeliveryOrden>;
  crearDeliveryOrden(data: Partial<DeliveryOrden>): Promise<DeliveryOrden>;
  asignarRepartidor(id: string, data: { repartidor_id: string }): Promise<void>;
  actualizarEstadoDelivery(id: string, estado: string): Promise<DeliveryOrden>;
  obtenerSeguimiento(id: string): Promise<unknown>;
}
