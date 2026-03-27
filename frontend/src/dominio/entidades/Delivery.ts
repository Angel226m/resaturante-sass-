// ── Delivery ──
export type EstadoDelivery = 'pendiente' | 'asignado' | 'recogido' | 'en_camino' | 'entregado' | 'cancelado';

export interface DeliveryOrden {
  id: number;
  orden_id: number;
  repartidor_id: number | null;
  repartidor_nombre?: string;
  cliente_nombre?: string;
  estado_delivery: EstadoDelivery;
  costo_envio: number;
  distancia_km: number | null;
  direccion_entrega: string;
  referencia_entrega: string;
  instrucciones: string;
  codigo_confirmacion: string;
  tiempo_estimado: number | null;
  creado_en: string;
  actualizado_en: string;
}

export interface ZonaDelivery {
  id: number;
  local_id: number;
  nombre: string;
  radio_km: number;
  costo_envio: number;
  tiempo_estimado_min: number;
  activo: boolean;
}
