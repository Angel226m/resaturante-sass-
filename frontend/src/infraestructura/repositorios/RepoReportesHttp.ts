import { apiGet, apiPost } from '../api/httpClient';
import type { DashboardResumen, ResumenDiario, AuditLog } from '@/dominio/entidades';
import { useAuthStore } from '../store/useAuthStore';

// ═══════════════════════════════════════════════════════════
// Repository: Reportes (Dashboard, Resumen Diario, Audit Log)
// ═══════════════════════════════════════════════════════════

const isDemo = () => useAuthStore.getState().isDemoMode;

const DEMO_DASHBOARD: DashboardResumen = {
  ventas_hoy: 2845.50, ventas_ayer: 2210.00, ordenes_totales: 47, ordenes_activas: 6,
  ordenes_hoy: 23, clientes_hoy: 18, ticket_promedio: 123.72, mesas_ocupadas: 3,
  total_mesas: 12, reservas_hoy: 3,
  productos_mas_vendidos: [
    { producto_id: 17, nombre: 'Ceviche Clásico', cantidad: 12, total: 420 },
    { producto_id: 5, nombre: 'Lomo Saltado', cantidad: 9, total: 342 },
    { producto_id: 8, nombre: 'Pollo a la Brasa', cantidad: 7, total: 245 },
    { producto_id: 13, nombre: 'Chicha Morada', cantidad: 15, total: 120 },
    { producto_id: 7, nombre: 'Arroz con Mariscos', cantidad: 5, total: 225 },
  ],
  ventas_por_hora: [
    { hora: 11, total: 120 }, { hora: 12, total: 380 }, { hora: 13, total: 520 },
    { hora: 14, total: 290 }, { hora: 15, total: 80 }, { hora: 18, total: 150 },
    { hora: 19, total: 480 }, { hora: 20, total: 560 }, { hora: 21, total: 265 },
  ],
  ventas_semana: [
    { fecha: '2025-01-20', total: 2100 }, { fecha: '2025-01-21', total: 2450 },
    { fecha: '2025-01-22', total: 1980 }, { fecha: '2025-01-23', total: 2680 },
    { fecha: '2025-01-24', total: 3100 }, { fecha: '2025-01-25', total: 3850 },
    { fecha: '2025-01-26', total: 2845 },
  ],
  top_productos: [
    { nombre: 'Ceviche Clásico', cantidad: 12, total: 420 },
    { nombre: 'Lomo Saltado', cantidad: 9, total: 342 },
    { nombre: 'Pollo a la Brasa', cantidad: 7, total: 245 },
  ],
  metodos_pago: [
    { metodo: 'Efectivo', total: 1250, porcentaje: 44 },
    { metodo: 'Tarjeta', total: 1100, porcentaje: 39 },
    { metodo: 'Yape/Plin', total: 495, porcentaje: 17 },
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
