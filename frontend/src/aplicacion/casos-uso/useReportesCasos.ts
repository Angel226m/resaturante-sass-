import { useMutation, useQuery } from '@tanstack/react-query';
import { reportesRepository } from '@/infraestructura/repositorios';

// ═══════════════════════════════════════════════════════════
// Caso de uso: Reportes y Dashboard
// ═══════════════════════════════════════════════════════════

export const REPORTES_KEYS = {
  dashboard: ['reportes', 'dashboard'] as const,
  resumenDiario: (p?: Record<string, unknown>) => ['reportes', 'resumen-diario', p] as const,
  resumenHistorial: (p?: Record<string, unknown>) => ['reportes', 'historial', p] as const,
  auditLog: (p?: Record<string, unknown>) => ['reportes', 'audit-log', p] as const,
};

export function useDashboard() {
  return useQuery({ queryKey: REPORTES_KEYS.dashboard, queryFn: () => reportesRepository.obtenerDashboard() });
}

export function useResumenDiario(params?: Record<string, unknown>) {
  return useQuery({ queryKey: REPORTES_KEYS.resumenDiario(params), queryFn: () => reportesRepository.obtenerResumenDiario(params) });
}

export function useHistorialResumenes(params?: Record<string, unknown>) {
  return useQuery({ queryKey: REPORTES_KEYS.resumenHistorial(params), queryFn: () => reportesRepository.listarResumenes(params) });
}

export function useAuditLog(params?: Record<string, unknown>) {
  return useQuery({ queryKey: REPORTES_KEYS.auditLog(params), queryFn: () => reportesRepository.listarAuditLog(params) });
}

export function useGenerarResumenDiario() {
  return useMutation({ mutationFn: (data?: { fecha?: string }) => reportesRepository.generarResumenDiario(data) });
}
