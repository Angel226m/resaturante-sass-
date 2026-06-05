import type { Orden, ItemOrden, TicketCocina } from '@/dominio/entidades';

// ═══════════════════════════════════════════════════════════
// Puerto: IOrdenesRepo — contrato de órdenes y cocina
// ═══════════════════════════════════════════════════════════

export interface IOrdenesRepo {
  listarOrdenes(params?: Record<string, unknown>): Promise<Orden[]>;
  obtenerOrden(id: string): Promise<Orden>;
  crearOrden(data: Partial<Orden>): Promise<Orden>;
  cambiarEstadoOrden(id: string, estado: string): Promise<Orden>;
  agregarItemOrden(id: string, data: Partial<ItemOrden>): Promise<ItemOrden>;
  contarOrdenesActivas(): Promise<{ total: number }>;

  // Cocina
  listarTicketsCocina(params?: Record<string, unknown>): Promise<TicketCocina[]>;
  crearTicketCocina(data: Partial<TicketCocina>): Promise<TicketCocina>;
  cambiarEstadoTicket(id: string, estado: string): Promise<TicketCocina>;
}
