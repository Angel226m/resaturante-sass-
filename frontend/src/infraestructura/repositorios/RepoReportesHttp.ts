import { apiGet, apiPost } from '../api/httpClient';
import type { DashboardResumen, ResumenDiario, AuditLog } from '@/dominio/entidades';
import { useAuthStore } from '../store/useAuthStore';

// ═══════════════════════════════════════════════════════════
// Repository: Reportes (Dashboard, Resumen Diario, Audit Log)
// ═══════════════════════════════════════════════════════════

const isDemo = () => useAuthStore.getState().isDemoMode;

const DEMO_DASHBOARD: DashboardResumen = {
  ventas_hoy: 2845.50, ventas_ayer: 2210.00, crecimiento_porc: 28.7,
  ordenes_hoy: 23, ordenes_activas: 6, clientes_hoy: 18,
  ticket_promedio: 123.72, mesas_ocupadas: 3, total_mesas: 12,
  ocupacion_porc: 25.0, reservas_hoy: 3,
  ventas_semana: 18025.00, ventas_mes: 72100.00,
  ordenes_mesa: 16, ordenes_delivery: 3, ordenes_para_llevar: 4,
  productos_mas_vendidos: [
    { producto_id: 17, nombre: 'Ceviche Clásico', cantidad: 12, total: 420 },
    { producto_id: 5, nombre: 'Lomo Saltado', cantidad: 9, total: 342 },
    { producto_id: 8, nombre: 'Pollo a la Brasa', cantidad: 7, total: 245 },
    { producto_id: 13, nombre: 'Chicha Morada', cantidad: 15, total: 120 },
    { producto_id: 7, nombre: 'Arroz con Mariscos', cantidad: 5, total: 225 },
  ],
  ventas_por_hora: [
    { hora: 11, total: 120, cantidad: 2 }, { hora: 12, total: 380, cantidad: 6 },
    { hora: 13, total: 520, cantidad: 8 }, { hora: 14, total: 290, cantidad: 4 },
    { hora: 15, total: 80, cantidad: 1 }, { hora: 18, total: 150, cantidad: 3 },
    { hora: 19, total: 480, cantidad: 7 }, { hora: 20, total: 560, cantidad: 8 },
    { hora: 21, total: 265, cantidad: 4 },
  ],
  ventas_por_categoria: [
    { categoria_id: 1, nombre: 'Entradas', total: 840, cantidad: 18 },
    { categoria_id: 2, nombre: 'Platos de Fondo', total: 1350, cantidad: 12 },
    { categoria_id: 3, nombre: 'Mariscos', total: 1100, cantidad: 8 },
    { categoria_id: 4, nombre: 'Postres', total: 240, cantidad: 10 },
    { categoria_id: 5, nombre: 'Bebidas', total: 315, cantidad: 25 },
  ],
  ventas_por_dia: [
    { fecha: '2025-01-20', total: 2100, ordenes: 18 },
    { fecha: '2025-01-21', total: 2450, ordenes: 21 },
    { fecha: '2025-01-22', total: 1980, ordenes: 17 },
    { fecha: '2025-01-23', total: 2680, ordenes: 23 },
    { fecha: '2025-01-24', total: 3100, ordenes: 26 },
    { fecha: '2025-01-25', total: 3850, ordenes: 32 },
    { fecha: '2025-01-26', total: 2845, ordenes: 23 },
  ],
};

const DEMO_RESUMEN: ResumenDiario = {
  id: 1, local_id: 1, fecha: new Date().toISOString().split('T')[0]!,
  total_ventas: 2845.50, total_ordenes: 23, ordenes_mesa: 16, ordenes_llevar: 4,
  ordenes_delivery: 3, ticket_promedio: 123.72, total_propinas: 142, total_descuentos: 45,
  clientes_nuevos: 3, producto_mas_vendido: 'Ceviche Clásico', clientes_atendidos: 18,
  creado_en: new Date().toISOString(),
};

export const reportesRepository = {
  obtenerDashboard: () => isDemo() ? Promise.resolve(DEMO_DASHBOARD) : apiGet<DashboardResumen>('/reportes/dashboard'),
  obtenerResumenDiario: (params?: Record<string, unknown>) => isDemo() ? Promise.resolve(DEMO_RESUMEN) : apiGet<ResumenDiario>('/reportes/resumen-diario', params),
  listarResumenes: (params?: Record<string, unknown>) => isDemo() ? Promise.resolve([DEMO_RESUMEN]) : apiGet<ResumenDiario[]>('/reportes/resumen-diario/historial', params),
  generarResumenDiario: (data?: { fecha?: string }) => isDemo() ? Promise.resolve(DEMO_RESUMEN) : apiPost<ResumenDiario>('/reportes/resumen-diario/generar', data),
  listarAuditLog: (params?: Record<string, unknown>) => isDemo() ? Promise.resolve([] as AuditLog[]) : apiGet<AuditLog[]>('/reportes/audit-log', params),
};

export default reportesRepository;
