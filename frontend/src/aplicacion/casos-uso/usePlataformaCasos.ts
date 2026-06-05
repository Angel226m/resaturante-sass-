import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { plataformaRepository } from '@/infraestructura/repositorios';
import type { Plan, Tenant } from '@/dominio/entidades';

// ═══════════════════════════════════════════════════════════
// Caso de uso: SuperAdmin / Plataforma
// ═══════════════════════════════════════════════════════════

export const PLATAFORMA_KEYS = {
  planes: ['plataforma', 'planes'] as const,
  plan: (id: string) => ['plataforma', 'planes', id] as const,
  tenants: (p?: Record<string, unknown>) => ['plataforma', 'tenants', p] as const,
  tenant: (id: string) => ['plataforma', 'tenants', id] as const,
  suscripcion: (id: string) => ['plataforma', 'suscripciones', id] as const,
  facturas: (p?: Record<string, unknown>) => ['plataforma', 'facturas', p] as const,
};

export function usePlanes() {
  return useQuery({ queryKey: PLATAFORMA_KEYS.planes, queryFn: () => plataformaRepository.listarPlanes() });
}

export function useTenants(params?: Record<string, unknown>) {
  return useQuery({ queryKey: PLATAFORMA_KEYS.tenants(params), queryFn: () => plataformaRepository.listarTenants(params) });
}

export function useTenant(id: string) {
  return useQuery({ queryKey: PLATAFORMA_KEYS.tenant(id), queryFn: () => plataformaRepository.obtenerTenant(id), enabled: !!id });
}

export function useSuscripcion(id: string) {
  return useQuery({ queryKey: PLATAFORMA_KEYS.suscripcion(id), queryFn: () => plataformaRepository.obtenerSuscripcion(id), enabled: !!id });
}

export function useFacturas(params?: Record<string, unknown>) {
  return useQuery({ queryKey: PLATAFORMA_KEYS.facturas(params), queryFn: () => plataformaRepository.listarFacturas(params) });
}

export function useCrearPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Plan>) => plataformaRepository.crearPlan(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: PLATAFORMA_KEYS.planes }),
  });
}

export function useActualizarPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Plan> }) => plataformaRepository.actualizarPlan(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: PLATAFORMA_KEYS.planes }),
  });
}

export function useEliminarPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => plataformaRepository.eliminarPlan(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: PLATAFORMA_KEYS.planes }),
  });
}

export function useCrearTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Tenant>) => plataformaRepository.crearTenant(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plataforma', 'tenants'] }),
  });
}

export function useActualizarTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Tenant> }) => plataformaRepository.actualizarTenant(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plataforma', 'tenants'] }),
  });
}

export function useCambiarPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, nuevo_plan_id }: { id: string; nuevo_plan_id: string }) =>
      plataformaRepository.cambiarPlan(id, { nuevo_plan_id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plataforma'] }),
  });
}
