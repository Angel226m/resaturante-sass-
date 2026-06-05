import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deliveryRepository } from '@/infraestructura/repositorios';
import type { DeliveryOrden, ZonaDelivery } from '@/dominio/entidades';

// ═══════════════════════════════════════════════════════════
// Caso de uso: Delivery
// ═══════════════════════════════════════════════════════════

export const DELIVERY_KEYS = {
  zonas: ['delivery', 'zonas'] as const,
  ordenes: (p?: Record<string, unknown>) => ['delivery', 'ordenes', p] as const,
  orden: (id: string) => ['delivery', 'ordenes', id] as const,
  seguimiento: (id: string) => ['delivery', 'seguimiento', id] as const,
};

export function useZonasDelivery() {
  return useQuery({ queryKey: DELIVERY_KEYS.zonas, queryFn: () => deliveryRepository.listarZonas() });
}

export function useDeliveryOrdenes(params?: Record<string, unknown>) {
  return useQuery({ queryKey: DELIVERY_KEYS.ordenes(params), queryFn: () => deliveryRepository.listarDeliveryOrdenes(params) });
}

export function useDeliveryOrden(id: string) {
  return useQuery({ queryKey: DELIVERY_KEYS.orden(id), queryFn: () => deliveryRepository.obtenerDeliveryOrden(id), enabled: !!id });
}

export function useSeguimientoDelivery(id: string) {
  return useQuery({ queryKey: DELIVERY_KEYS.seguimiento(id), queryFn: () => deliveryRepository.obtenerSeguimiento(id), enabled: !!id });
}

export function useCrearZonaDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ZonaDelivery>) => deliveryRepository.crearZona(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: DELIVERY_KEYS.zonas }),
  });
}

export function useActualizarZonaDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ZonaDelivery> }) => deliveryRepository.actualizarZona(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: DELIVERY_KEYS.zonas }),
  });
}

export function useEliminarZonaDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deliveryRepository.eliminarZona(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: DELIVERY_KEYS.zonas }),
  });
}

export function useCrearDeliveryOrden() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<DeliveryOrden>) => deliveryRepository.crearDeliveryOrden(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['delivery', 'ordenes'] }),
  });
}

export function useAsignarRepartidor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, repartidor_id }: { id: string; repartidor_id: string }) =>
      deliveryRepository.asignarRepartidor(id, { repartidor_id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['delivery', 'ordenes'] }),
  });
}

export function useActualizarEstadoDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: string }) => deliveryRepository.actualizarEstadoDelivery(id, estado),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['delivery', 'ordenes'] }),
  });
}
