import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordenesRepository } from '@/infraestructura/repositorios';
import type { Orden, ItemOrden, TicketCocina } from '@/dominio/entidades';

// ═══════════════════════════════════════════════════════════
// Caso de uso: Órdenes y Cocina
// ═══════════════════════════════════════════════════════════

export const ORDENES_KEYS = {
  ordenes: (p?: Record<string, unknown>) => ['ordenes', p] as const,
  orden: (id: string) => ['ordenes', id] as const,
  activas: ['ordenes', 'activas'] as const,
  tickets: (p?: Record<string, unknown>) => ['cocina', 'tickets', p] as const,
};

export function useOrdenes(params?: Record<string, unknown>) {
  return useQuery({ queryKey: ORDENES_KEYS.ordenes(params), queryFn: () => ordenesRepository.listarOrdenes(params) });
}

export function useOrden(id: string) {
  return useQuery({ queryKey: ORDENES_KEYS.orden(id), queryFn: () => ordenesRepository.obtenerOrden(id), enabled: !!id });
}

export function useOrdenesActivasTotal() {
  return useQuery({ queryKey: ORDENES_KEYS.activas, queryFn: () => ordenesRepository.contarOrdenesActivas() });
}

export function useTicketsCocina(params?: Record<string, unknown>) {
  return useQuery({ queryKey: ORDENES_KEYS.tickets(params), queryFn: () => ordenesRepository.listarTicketsCocina(params) });
}

export function useCrearOrden() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Orden>) => ordenesRepository.crearOrden(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ordenes'] }),
  });
}

export function useCambiarEstadoOrden() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: string }) => ordenesRepository.cambiarEstadoOrden(id, estado),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ordenes'] }),
  });
}

export function useAgregarItemOrden() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ItemOrden> }) => ordenesRepository.agregarItemOrden(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ordenes'] }),
  });
}

export function useCrearTicketCocina() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<TicketCocina>) => ordenesRepository.crearTicketCocina(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cocina'] }),
  });
}

export function useCambiarEstadoTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: string }) => ordenesRepository.cambiarEstadoTicket(id, estado),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cocina'] }),
  });
}
