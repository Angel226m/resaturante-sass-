// ── Local / Zonas / Mesas / Config ──
export interface Local {
  id: number;
  tenant_id: string;
  nombre: string;
  direccion: string;
  distrito: string;
  provincia: string;
  departamento: string;
  telefono: string;
  latitud: number | null;
  longitud: number | null;
  es_principal: boolean;
  numero_pisos: number;
  horarios: string | null;
  acepta_reservas: boolean;
  acepta_delivery: boolean;
  radio_delivery_km: number | null;
  activo: boolean;
  total_mesas?: number;
  total_zonas?: number;
  creado_en: string;
  actualizado_en: string;
}

export interface Zona {
  id: number;
  tenant_id: string;
  local_id: number;
  nombre: string;
  descripcion: string;
  piso: number;
  color: string;
  orden: number;
  activo: boolean;
  total_mesas?: number;
  creado_en: string;
  actualizado_en: string;
}

export type EstadoMesa = 'disponible' | 'ocupada' | 'reservada' | 'fuera_servicio';
export type FormaMesa = 'cuadrada' | 'redonda' | 'rectangular';

export interface Mesa {
  id: number;
  tenant_id: string;
  local_id: number;
  zona_id: number;
  numero: number;
  capacidad: number;
  estado: EstadoMesa;
  forma: FormaMesa;
  posicion_x: number | null;
  posicion_y: number | null;
  qr_codigo: string;
  qr_url: string;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface ConfiguracionRestaurante {
  id: number;
  tenant_id: string;
  local_id: number;
  moneda: string;
  zona_horaria: string;
  porcentaje_igv: number;
  incluye_igv: boolean;
  acepta_propina: boolean;
  porcentaje_propina: number;
  cobro_cubierto: boolean;
  monto_cubierto: number;
  mensaje_bienvenida: string;
  mensaje_ticket: string;
  mensaje_factura: string;
  email_envio_factura: string;
  tiempo_preparacion_base: number;
  alerta_stock_minimo: number;
  alerta_vencimiento: number;
  permite_pedido_sin_mesa: boolean;
  permite_descuentos: boolean;
  max_descuento: number;
  creado_en: string;
  actualizado_en: string;
}
