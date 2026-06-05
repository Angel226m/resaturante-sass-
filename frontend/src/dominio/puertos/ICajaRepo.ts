import type { TurnoCaja, MetodoPago, Pago, Comprobante } from '@/dominio/entidades';

// ═══════════════════════════════════════════════════════════
// Puerto: ICajaRepo — contrato de caja
// ═══════════════════════════════════════════════════════════

export interface ICajaRepo {
  obtenerTurnoActivo(): Promise<TurnoCaja>;
  abrirTurno(data: { monto_apertura: number }): Promise<TurnoCaja>;
  cerrarTurno(id: string, data: { monto_cierre: number; observaciones?: string }): Promise<TurnoCaja>;
  obtenerResumenTurno(id: string): Promise<TurnoCaja>;

  listarMetodosPago(): Promise<MetodoPago[]>;
  crearMetodoPago(data: Partial<MetodoPago>): Promise<MetodoPago>;

  crearPago(turnoId: string, data: Partial<Pago>): Promise<Pago>;
  anularPago(id: string): Promise<void>;
  listarPagosPorTurno(turnoId: string): Promise<Pago[]>;

  crearComprobante(data: Partial<Comprobante>): Promise<Comprobante>;
  anularComprobante(id: string): Promise<void>;
}
