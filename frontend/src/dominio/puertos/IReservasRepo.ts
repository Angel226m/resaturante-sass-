import type { Reserva } from '@/dominio/entidades';

// ═══════════════════════════════════════════════════════════
// Puerto: IReservasRepo — contrato de reservas
// ═══════════════════════════════════════════════════════════

export interface IReservasRepo {
  listarReservas(params?: Record<string, unknown>): Promise<Reserva[]>;
  obtenerReserva(id: string): Promise<Reserva>;
  crearReserva(data: Partial<Reserva>): Promise<Reserva>;
  cambiarEstadoReserva(id: string, estado: string): Promise<Reserva>;
  consultarDisponibilidad(data: { fecha: string; hora: string; personas: number }): Promise<{ disponible: boolean; mesas_sugeridas: number[] }>;
  contarReservasHoy(): Promise<{ total: number }>;
}
