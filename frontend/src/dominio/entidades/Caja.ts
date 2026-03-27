// ── Caja ──
export interface TurnoCaja {
  id: number;
  local_id: number;
  usuario_id: number;
  monto_apertura: number;
  monto_cierre: number | null;
  total_ventas: number;
  total_efectivo: number;
  total_tarjeta: number;
  total_otros: number;
  cantidad_ordenes: number;
  estado: 'abierto' | 'cerrado';
  fecha_apertura: string;
  fecha_cierre: string | null;
  observaciones: string;
  creado_en: string;
}

export interface MetodoPago {
  id: number;
  local_id: number;
  nombre: string;
  tipo: 'efectivo' | 'tarjeta' | 'transferencia' | 'billetera_digital' | 'otro';
  comision_porcentaje: number;
  requiere_referencia: boolean;
  activo: boolean;
}

export interface Pago {
  id: number;
  orden_id: number;
  turno_caja_id: number;
  monto_total: number;
  monto_pagado: number;
  vuelto: number;
  propina: number;
  estado: 'completado' | 'anulado';
  detalle?: DetallePago[];
  creado_en: string;
}

export interface DetallePago {
  id: number;
  metodo_pago_id: number;
  monto: number;
  referencia: string;
}

export interface Comprobante {
  id: number;
  pago_id: number;
  tipo_comprobante: 'boleta' | 'factura' | 'nota_venta';
  serie: string;
  numero: string;
  cliente_nombre: string;
  cliente_documento: string;
  subtotal: number;
  igv: number;
  total: number;
  estado: 'emitido' | 'anulado';
  pdf_url: string | null;
  creado_en: string;
}
