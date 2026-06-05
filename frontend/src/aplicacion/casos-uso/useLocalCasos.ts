import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { localRepository } from '@/infraestructura/repositorios';
import type { Local, Zona, Mesa, ConfiguracionRestaurante } from '@/dominio/entidades';

// ═══════════════════════════════════════════════════════════
// Caso de uso: Locales, Zonas, Mesas y Configuración
// ═══════════════════════════════════════════════════════════

export const LOCAL_KEYS = {
  locales: ['locales'] as const,
  local: (id: string) => ['locales', id] as const,
  zonas: (p?: Record<string, unknown>) => ['zonas', p] as const,
  mesas: (p?: Record<string, unknown>) => ['mesas', p] as const,
  configuracion: ['configuracion'] as const,
};

export function useLocales() {
  return useQuery({ queryKey: LOCAL_KEYS.locales, queryFn: () => localRepository.listarLocales() });
}

export function useLocal(id: string) {
  return useQuery({ queryKey: LOCAL_KEYS.local(id), queryFn: () => localRepository.obtenerLocal(id), enabled: !!id });
}

export function useZonas(params?: Record<string, unknown>) {
  return useQuery({ queryKey: LOCAL_KEYS.zonas(params), queryFn: () => localRepository.listarZonas(params) });
}

export function useMesas(params?: Record<string, unknown>) {
  return useQuery({ queryKey: LOCAL_KEYS.mesas(params), queryFn: () => localRepository.listarMesas(params) });
}

export function useConfiguracion() {
  return useQuery({ queryKey: LOCAL_KEYS.configuracion, queryFn: () => localRepository.obtenerConfiguracion() });
}

export function useCrearLocal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Local>) => localRepository.crearLocal(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: LOCAL_KEYS.locales }),
  });
}

export function useActualizarLocal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Local> }) => localRepository.actualizarLocal(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['locales'] }),
  });
}

export function useCrearZona() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Zona>) => localRepository.crearZona(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['zonas'] }),
  });
}

export function useActualizarZona() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Zona> }) => localRepository.actualizarZona(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['zonas'] }),
  });
}

export function useCrearMesa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Mesa>) => localRepository.crearMesa(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mesas'] }),
  });
}

export function useActualizarMesa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Mesa> }) => localRepository.actualizarMesa(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mesas'] }),
  });
}

export function useCambiarEstadoMesa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: string }) => localRepository.cambiarEstadoMesa(id, estado),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mesas'] }),
  });
}

export function useActualizarConfiguracion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ConfiguracionRestaurante>) => localRepository.actualizarConfiguracion(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: LOCAL_KEYS.configuracion }),
  });
}
