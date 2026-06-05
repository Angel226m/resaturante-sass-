import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authRepository } from '@/infraestructura/repositorios';
import type { NuevoUsuarioRequest, ActualizarUsuarioRequest } from '@/dominio/entidades';

// ═══════════════════════════════════════════════════════════
// Caso de uso: Auth — perfil y gestión de usuarios
// ═══════════════════════════════════════════════════════════

export const AUTH_KEYS = {
  perfil: ['auth', 'perfil'] as const,
  usuarios: (params?: Record<string, unknown>) => ['auth', 'usuarios', params] as const,
  usuario: (id: string) => ['auth', 'usuarios', id] as const,
};

export function useMiPerfil() {
  return useQuery({
    queryKey: AUTH_KEYS.perfil,
    queryFn: () => authRepository.miPerfil(),
  });
}

export function useUsuarios(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: AUTH_KEYS.usuarios(params),
    queryFn: () => authRepository.listarUsuarios(params),
  });
}

export function useCrearUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: NuevoUsuarioRequest) => authRepository.crearUsuario(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['auth', 'usuarios'] }),
  });
}

export function useActualizarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ActualizarUsuarioRequest }) =>
      authRepository.actualizarUsuario(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['auth', 'usuarios'] }),
  });
}

export function useEliminarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => authRepository.eliminarUsuario(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['auth', 'usuarios'] }),
  });
}
