import { apiGet, apiPost } from '../api/httpClient';
import type { TurnoCaja, MetodoPago, Pago, Comprobante } from '@/dominio/entidades';
import { useAuthStore } from '../store/useAuthStore';

// ═══════════════════════════════════════════════════════════
// Repository: Caja (Turnos, Métodos de Pago, Pagos, Comprobantes)
// ═══════════════════════════════════════════════════════════

const isDemo = () => useAuthStore.getState().isDemoMode;
let nextId = 100;

function normalizeMetodo(raw: any): MetodoPago {
  return {
    id: Number(raw?.id ?? raw?.id_metodo_pago ?? 0),
    local_id: Number(raw?.local_id ?? 0),
    nombre: String(raw?.nombre ?? ''),
    tipo: String(raw?.tipo ?? 'efectivo') as MetodoPago['tipo'],
    comision_porcentaje: Number(raw?.comision_porcentaje ?? 0),
    requiere_referencia: Boolean(raw?.requiere_referencia ?? false),
    activo: Boolean(raw?.activo ?? true),
  };
}

function normalizeTurno(raw: any): TurnoCaja {
  return {
    id: Number(raw?.id ?? raw?.id_turno_caja ?? 0),
    local_id: Number(raw?.local_id ?? 0),
    usuario_id: Number(raw?.usuario_id ?? 0),
    monto_apertura: Number(raw?.monto_apertura ?? 0),
    monto_cierre: raw?.monto_cierre ?? null,
    total_ventas: Number(raw?.total_ventas ?? 0),
    total_efectivo: Number(raw?.total_efectivo ?? 0),
    total_tarjeta: Number(raw?.total_tarjeta ?? 0),
    total_otros: Number(raw?.total_otros ?? 0),
    cantidad_ordenes: Number(raw?.cantidad_ordenes ?? 0),
    estado: String(raw?.estado ?? 'abierto') as TurnoCaja['estado'],
    fecha_apertura: String(raw?.fecha_apertura ?? raw?.created_at ?? ''),
    fecha_cierre: raw?.fecha_cierre ?? null,
    observaciones: String(raw?.observaciones ?? ''),
    creado_en: String(raw?.creado_en ?? raw?.created_at ?? ''),
  };
}

function normalizePago(raw: any): Pago {
  return {
    id: Number(raw?.id ?? raw?.id_pago ?? 0),
    orden_id: Number(raw?.orden_id ?? 0),
    turno_caja_id: Number(raw?.turno_caja_id ?? 0),
    monto_total: Number(raw?.monto_total ?? 0),
    monto_pagado: Number(raw?.monto_pagado ?? 0),
    vuelto: Number(raw?.vuelto ?? 0),
    propina: Number(raw?.propina ?? 0),
    estado: String(raw?.estado ?? 'completado') as Pago['estado'],
    detalle: raw?.detalle,
    creado_en: String(raw?.creado_en ?? raw?.created_at ?? ''),
  };
}

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
  obtenerTurnoActivo: () => isDemo() ? Promise.resolve(DEMO_TURNO) : apiGet<any>('/caja/turnos/activo').then(normalizeTurno),
  abrirTurno: (data: { monto_apertura: number }) => isDemo() ? Promise.resolve({ ...DEMO_TURNO, monto_apertura: data.monto_apertura } as TurnoCaja) : apiPost<any>('/caja/turnos/abrir', data).then(normalizeTurno),
  cerrarTurno: (id: string, data: { monto_cierre: number; observaciones?: string }) => isDemo() ? Promise.resolve({ ...DEMO_TURNO, estado: 'cerrado', monto_cierre: data.monto_cierre } as TurnoCaja) : apiPost<any>(`/caja/turnos/${id}/cerrar`, data).then(normalizeTurno),
  obtenerResumenTurno: (id: string) => isDemo() ? Promise.resolve(DEMO_TURNO) : apiGet<any>(`/caja/turnos/${id}/resumen`).then(normalizeTurno),

  // Métodos de pago
  listarMetodosPago: () => isDemo() ? Promise.resolve(DEMO_METODOS_PAGO) : apiGet<any[]>('/caja/metodos-pago').then((items) => (items ?? []).map(normalizeMetodo)),
  crearMetodoPago: (data: Partial<MetodoPago>) => isDemo() ? Promise.resolve({ ...data, id: ++nextId } as MetodoPago) : apiPost<MetodoPago>('/caja/metodos-pago', data),

  // Pagos
  crearPago: (turnoId: string, data: Partial<Pago>) => isDemo() ? Promise.resolve({ ...data, id: ++nextId } as Pago) : apiPost<Pago>(`/caja/pagos/turno/${turnoId}`, data),
  anularPago: (id: string) => isDemo() ? Promise.resolve(undefined as never) : apiPost(`/caja/pagos/${id}/anular`),
  listarPagosPorTurno: (turnoId: string) => isDemo() ? Promise.resolve([] as Pago[]) : apiGet<any[]>(`/caja/pagos/turno/${turnoId}`).then((items) => (items ?? []).map(normalizePago)),

  // Comprobantes
  crearComprobante: (data: Partial<Comprobante>) => isDemo() ? Promise.resolve({ ...data, id: ++nextId } as Comprobante) : apiPost<Comprobante>('/caja/comprobantes', data),
  anularComprobante: (id: string) => isDemo() ? Promise.resolve(undefined as never) : apiPost(`/caja/comprobantes/${id}/anular`),
};

export default cajaRepository;
