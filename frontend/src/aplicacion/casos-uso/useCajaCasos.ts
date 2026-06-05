import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cajaRepository } from '@/infraestructura/repositorios';
import type { MetodoPago, Pago, Comprobante } from '@/dominio/entidades';

// ═══════════════════════════════════════════════════════════
// Caso de uso: Caja
// ═══════════════════════════════════════════════════════════

export const CAJA_KEYS = {
  turnoActivo: ['caja', 'turno-activo'] as const,
  resumenTurno: (id: string) => ['caja', 'turno', id, 'resumen'] as const,
  metodosPago: ['caja', 'metodos-pago'] as const,
  pagosPorTurno: (turnoId: string) => ['caja', 'pagos', turnoId] as const,
};

export function useTurnoActivo() {
  return useQuery({ queryKey: CAJA_KEYS.turnoActivo, queryFn: () => cajaRepository.obtenerTurnoActivo() });
}

export function useResumenTurno(id: string) {
  return useQuery({ queryKey: CAJA_KEYS.resumenTurno(id), queryFn: () => cajaRepository.obtenerResumenTurno(id), enabled: !!id });
}

export function useMetodosPago() {
  return useQuery({ queryKey: CAJA_KEYS.metodosPago, queryFn: () => cajaRepository.listarMetodosPago() });
}

export function usePagosPorTurno(turnoId: string) {
  return useQuery({ queryKey: CAJA_KEYS.pagosPorTurno(turnoId), queryFn: () => cajaRepository.listarPagosPorTurno(turnoId), enabled: !!turnoId });
}

export function useAbrirTurno() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { monto_apertura: number }) => cajaRepository.abrirTurno(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['caja'] }),
  });
}

export function useCerrarTurno() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { monto_cierre: number; observaciones?: string } }) =>
      cajaRepository.cerrarTurno(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['caja'] }),
  });
}

export function useCrearMetodoPago() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<MetodoPago>) => cajaRepository.crearMetodoPago(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: CAJA_KEYS.metodosPago }),
  });
}

export function useCrearPago() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ turnoId, data }: { turnoId: string; data: Partial<Pago> }) => cajaRepository.crearPago(turnoId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['caja'] }),
  });
}

export function useAnularPago() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cajaRepository.anularPago(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['caja'] }),
  });
}

export function useCrearComprobante() {
  return useMutation({ mutationFn: (data: Partial<Comprobante>) => cajaRepository.crearComprobante(data) });
}
