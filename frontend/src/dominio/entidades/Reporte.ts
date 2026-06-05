// ── Reportes ──
export interface ResumenDiario {
  id: number;
  local_id: number;
  fecha: string;
  total_ventas: number;
  total_ordenes: number;
  ordenes_mesa: number;
  ordenes_llevar: number;
  ordenes_delivery: number;
  ticket_promedio: number;
  total_propinas: number;
  total_descuentos: number;
  clientes_nuevos: number;
  producto_mas_vendido: string;
  clientes_atendidos?: number;
  creado_en: string;
}

export interface DashboardResumen {
  ventas_hoy: number;
  ventas_ayer: number;
  crecimiento_porc: number;
  ordenes_hoy: number;
  ticket_promedio: number;
  ordenes_activas: number;
  mesas_ocupadas: number;
  total_mesas: number;
  ocupacion_porc: number;
  reservas_hoy: number;
  clientes_hoy: number;
  ventas_semana: number;
  ventas_mes: number;
  productos_mas_vendidos: { producto_id: number; nombre: string; cantidad: number; total: number }[];
  ventas_por_hora: { hora: number; total: number; cantidad: number }[];
  ventas_por_categoria: { categoria_id: number; nombre: string; total: number; cantidad: number }[];
  ventas_por_dia: { fecha: string; total: number; ordenes: number }[];
  ordenes_mesa: number;
  ordenes_delivery: number;
  ordenes_para_llevar: number;
}

export interface AuditLog {
  id: number;
  usuario_id: number | null;
  accion: string;
  tabla_afectada: string;
  registro_id: string | null;
  ip: string;
  method: string;
  path: string;
  status_code: number;
  duracion_ms: number;
  creado_en: string;
}
