import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { menuRepository } from '@/infraestructura/repositorios';
import type { CategoriaMenu, ProductoMenu, Combo, Promocion, Cupon } from '@/dominio/entidades';

// ═══════════════════════════════════════════════════════════
// Caso de uso: Menú
// ═══════════════════════════════════════════════════════════

export const MENU_KEYS = {
  categorias: (p?: Record<string, unknown>) => ['menu', 'categorias', p] as const,
  productos: (p?: Record<string, unknown>) => ['menu', 'productos', p] as const,
  producto: (id: string) => ['menu', 'productos', id] as const,
  variantes: (productoId: string) => ['menu', 'variantes', productoId] as const,
  modificadores: ['menu', 'modificadores'] as const,
  combos: ['menu', 'combos'] as const,
  promociones: ['menu', 'promociones'] as const,
  cupones: ['menu', 'cupones'] as const,
  horarios: ['menu', 'horarios'] as const,
};

export function useCategorias(params?: Record<string, unknown>) {
  return useQuery({ queryKey: MENU_KEYS.categorias(params), queryFn: () => menuRepository.listarCategorias(params) });
}

export function useProductos(params?: Record<string, unknown>) {
  return useQuery({ queryKey: MENU_KEYS.productos(params), queryFn: () => menuRepository.listarProductos(params) });
}

export function useProducto(id: string) {
  return useQuery({ queryKey: MENU_KEYS.producto(id), queryFn: () => menuRepository.obtenerProducto(id), enabled: !!id });
}

export function useVariantes(productoId: string) {
  return useQuery({ queryKey: MENU_KEYS.variantes(productoId), queryFn: () => menuRepository.listarVariantes(productoId), enabled: !!productoId });
}

export function useGruposModificadores() {
  return useQuery({ queryKey: MENU_KEYS.modificadores, queryFn: () => menuRepository.listarGruposModificadores() });
}

export function useCombos() {
  return useQuery({ queryKey: MENU_KEYS.combos, queryFn: () => menuRepository.listarCombos() });
}

export function usePromociones() {
  return useQuery({ queryKey: MENU_KEYS.promociones, queryFn: () => menuRepository.listarPromociones() });
}

export function useCupones() {
  return useQuery({ queryKey: MENU_KEYS.cupones, queryFn: () => menuRepository.listarCupones() });
}

export function useCrearCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CategoriaMenu>) => menuRepository.crearCategoria(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menu', 'categorias'] }),
  });
}

export function useActualizarCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CategoriaMenu> }) => menuRepository.actualizarCategoria(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menu', 'categorias'] }),
  });
}

export function useEliminarCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => menuRepository.eliminarCategoria(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menu', 'categorias'] }),
  });
}

export function useCrearProducto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ProductoMenu>) => menuRepository.crearProducto(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menu', 'productos'] }),
  });
}

export function useActualizarProducto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductoMenu> }) => menuRepository.actualizarProducto(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menu', 'productos'] }),
  });
}

export function useEliminarProducto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => menuRepository.eliminarProducto(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menu', 'productos'] }),
  });
}

export function useCambiarDisponibilidad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, disponible }: { id: string; disponible: boolean }) => menuRepository.cambiarDisponibilidad(id, disponible),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menu', 'productos'] }),
  });
}

export function useCrearCombo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Combo>) => menuRepository.crearCombo(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: MENU_KEYS.combos }),
  });
}

export function useCrearPromocion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Promocion>) => menuRepository.crearPromocion(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: MENU_KEYS.promociones }),
  });
}

export function useValidarCupon() {
  return useMutation({ mutationFn: (codigo: string) => menuRepository.validarCupon({ codigo }) });
}

export function useCrearCupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Cupon>) => menuRepository.crearCupon(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: MENU_KEYS.cupones }),
  });
}
