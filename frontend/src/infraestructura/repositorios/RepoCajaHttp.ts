import { apiGet, apiPost } from '../api/httpClient';
import type { TurnoCaja, MetodoPago, Pago, Comprobante } from '@/dominio/entidades';
import { useAuthStore } from '../store/useAuthStore';

// ═══════════════════════════════════════════════════════════
// Repository: Caja (Turnos, Métodos de Pago, Pagos, Comprobantes)
// ═══════════════════════════════════════════════════════════

const isDemo = () => useAuthStore.getState().isDemoMode;
let nextId = 100;

const DEMO_TURNO: TurnoCaja = {
  id: 1, local_id: 1, usuario_id: 1,
  monto_apertura: 500, monto_cierre: null,
  estado: 'abierto', observaciones: '',
  fecha_apertura: new Date().toISOString(), fecha_cierre: null,
  total_ventas: 2845.50, total_efectivo: 1250, total_tarjeta: 1100,
  total_otros: 495, cantidad_ordenes: 23,
  creado_en: new Date().toISOString(),
};

const DEMO_METODOS_PAGO: MetodoPago[] = [
  { id: 1, local_id: 1, nombre: 'Efectivo', tipo: 'efectivo', comision_porcentaje: 0, requiere_referencia: false, activo: true },
  { id: 2, local_id: 1, nombre: 'Tarjeta Visa/MC', tipo: 'tarjeta', comision_porcentaje: 3.5, requiere_referencia: true, activo: true },
  { id: 3, local_id: 1, nombre: 'Yape', tipo: 'billetera_digital', comision_porcentaje: 0, requiere_referencia: false, activo: true },
  { id: 4, local_id: 1, nombre: 'Plin', tipo: 'billetera_digital', comision_porcentaje: 0, requiere_referencia: false, activo: true },
];

export const cajaRepository = {
  // Turnos
  obtenerTurnoActivo: () => isDemo() ? Promise.resolve(DEMO_TURNO) : apiGet<TurnoCaja>('/caja/turnos/activo'),
  abrirTurno: (data: { monto_apertura: number }) => isDemo() ? Promise.resolve({ ...DEMO_TURNO, monto_apertura: data.monto_apertura } as TurnoCaja) : apiPost<TurnoCaja>('/caja/turnos/abrir', data),
  cerrarTurno: (id: string, data: { monto_cierre: number; observaciones?: string }) => isDemo() ? Promise.resolve({ ...DEMO_TURNO, estado: 'cerrado', monto_cierre: data.monto_cierre } as TurnoCaja) : apiPost<TurnoCaja>(`/caja/turnos/${id}/cerrar`, data),
  obtenerResumenTurno: (id: string) => isDemo() ? Promise.resolve(DEMO_TURNO) : apiGet<TurnoCaja>(`/caja/turnos/${id}/resumen`),

  // Métodos de pago
  listarMetodosPago: () => isDemo() ? Promise.resolve(DEMO_METODOS_PAGO) : apiGet<MetodoPago[]>('/caja/metodos-pago'),
  crearMetodoPago: (data: Partial<MetodoPago>) => isDemo() ? Promise.resolve({ ...data, id: ++nextId } as MetodoPago) : apiPost<MetodoPago>('/caja/metodos-pago', data),

  // Pagos
  crearPago: (turnoId: string, data: Partial<Pago>) => isDemo() ? Promise.resolve({ ...data, id: ++nextId } as Pago) : apiPost<Pago>(`/caja/pagos/turno/${turnoId}`, data),
  anularPago: (id: string) => isDemo() ? Promise.resolve(undefined as never) : apiPost(`/caja/pagos/${id}/anular`),
  listarPagosPorTurno: (turnoId: string) => isDemo() ? Promise.resolve([] as Pago[]) : apiGet<Pago[]>(`/caja/pagos/turno/${turnoId}`),

  // Comprobantes
  crearComprobante: (data: Partial<Comprobante>) => isDemo() ? Promise.resolve({ ...data, id: ++nextId } as Comprobante) : apiPost<Comprobante>('/caja/comprobantes', data),
  anularComprobante: (id: string) => isDemo() ? Promise.resolve(undefined as never) : apiPost(`/caja/comprobantes/${id}/anular`),
};

export default cajaRepository;
