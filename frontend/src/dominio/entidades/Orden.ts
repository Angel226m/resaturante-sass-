// ── Órdenes ──
export type TipoOrden = 'mesa' | 'para_llevar' | 'delivery';
export type EstadoOrden = 'nueva' | 'en_cocina' | 'listo' | 'servida' | 'pagada' | 'cancelada' | 'pendiente' | 'en_preparacion' | 'lista' | 'entregada';

export interface Orden {
  id: number;
  tenant_id: string;
  local_id: number;
  numero_orden: string;
  tipo_orden: TipoOrden;
  estado: EstadoOrden;
  mesa_id: number | null;
  cliente_id: number | null;
  mesero_id: number | null;
  numero_personas: number | null;
  subtotal: number;
  descuento: number;
  igv: number;
  total: number;
  notas: string;
  tiempo_estimado: number | null;
  items?: ItemOrden[];
  creado_en: string;
  actualizado_en: string;
}

export interface ItemOrden {
  id: number;
  orden_id: number;
  producto_menu_id: number;
  variante_id: number | null;
  cantidad: number;
  precio_unitario: number;
  precio_modificadores: number;
  descuento: number;
  subtotal: number;
  estado: string;
  notas: string;
  nombre_producto?: string;
  modificadores?: { id: number; nombre: string; precio: number; cantidad: number }[];
}

export interface TicketCocina {
  id: number;
  orden_id: number;
  estacion_cocina: string;
  estado: 'pendiente' | 'en_preparacion' | 'listo';
  prioridad: number;
  tiempo_estimado: number | null;
  cocinero_id: number | null;
  items?: ItemOrden[];
  creado_en: string;
  actualizado_en: string;
}
