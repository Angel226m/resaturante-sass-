import type { DashboardResumen, ResumenDiario, AuditLog } from '@/dominio/entidades';

// ═══════════════════════════════════════════════════════════
// Puerto: IReportesRepo — contrato de reportes y dashboard
// ═══════════════════════════════════════════════════════════

export interface IReportesRepo {
  obtenerDashboard(): Promise<DashboardResumen>;
  obtenerResumenDiario(params?: Record<string, unknown>): Promise<ResumenDiario>;
  listarResumenes(params?: Record<string, unknown>): Promise<ResumenDiario[]>;
  generarResumenDiario(data?: { fecha?: string }): Promise<ResumenDiario>;
  listarAuditLog(params?: Record<string, unknown>): Promise<AuditLog[]>;
}
