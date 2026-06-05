import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reservasRepository } from '@/infraestructura/repositorios';
import type { Reserva } from '@/dominio/entidades';

// ═══════════════════════════════════════════════════════════
// Caso de uso: Reservas
// ═══════════════════════════════════════════════════════════

export const RESERVAS_KEYS = {
  reservas: (p?: Record<string, unknown>) => ['reservas', p] as const,
  reserva: (id: string) => ['reservas', id] as const,
  totalHoy: ['reservas', 'hoy', 'total'] as const,
};

export function useReservas(params?: Record<string, unknown>) {
  return useQuery({ queryKey: RESERVAS_KEYS.reservas(params), queryFn: () => reservasRepository.listarReservas(params) });
}

export function useReserva(id: string) {
  return useQuery({ queryKey: RESERVAS_KEYS.reserva(id), queryFn: () => reservasRepository.obtenerReserva(id), enabled: !!id });
}

export function useReservasTotalHoy() {
  return useQuery({ queryKey: RESERVAS_KEYS.totalHoy, queryFn: () => reservasRepository.contarReservasHoy() });
}

export function useCrearReserva() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Reserva>) => reservasRepository.crearReserva(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reservas'] }),
  });
}

export function useCambiarEstadoReserva() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: string }) => reservasRepository.cambiarEstadoReserva(id, estado),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reservas'] }),
  });
}

export function useConsultarDisponibilidad() {
  return useMutation({
    mutationFn: (data: { fecha: string; hora: string; personas: number }) =>
      reservasRepository.consultarDisponibilidad(data),
  });
}
