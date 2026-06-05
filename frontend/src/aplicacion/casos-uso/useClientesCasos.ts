import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clientesRepository } from '@/infraestructura/repositorios';
import type { Cliente, DireccionCliente } from '@/dominio/entidades';

// ═══════════════════════════════════════════════════════════
// Caso de uso: Clientes
// ═══════════════════════════════════════════════════════════

export const CLIENTES_KEYS = {
  clientes: (p?: Record<string, unknown>) => ['clientes', p] as const,
  cliente: (id: string) => ['clientes', id] as const,
  busqueda: (q: string) => ['clientes', 'busqueda', q] as const,
};

export function useClientes(params?: Record<string, unknown>) {
  return useQuery({ queryKey: CLIENTES_KEYS.clientes(params), queryFn: () => clientesRepository.listarClientes(params) });
}

export function useCliente(id: string) {
  return useQuery({ queryKey: CLIENTES_KEYS.cliente(id), queryFn: () => clientesRepository.obtenerCliente(id), enabled: !!id });
}

export function useBuscarClientes(q: string) {
  return useQuery({ queryKey: CLIENTES_KEYS.busqueda(q), queryFn: () => clientesRepository.buscarClientes({ q }), enabled: q.length >= 2 });
}

export function useCrearCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Cliente>) => clientesRepository.crearCliente(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  });
}

export function useActualizarCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Cliente> }) => clientesRepository.actualizarCliente(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  });
}

export function useEliminarCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientesRepository.eliminarCliente(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  });
}

export function useCrearDireccion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<DireccionCliente>) => clientesRepository.crearDireccion(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  });
}
