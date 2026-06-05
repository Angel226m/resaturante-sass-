import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { CategoriaMenu, ProductoMenu } from '@/dominio/entidades';

// ═══════════════════════════════════════════════════════════
// Integration tests: useMenuCasos hooks
// ═══════════════════════════════════════════════════════════

vi.mock('@/infraestructura/repositorios', () => ({
  menuRepository: {
    listarCategorias: vi.fn(),
    obtenerCategoria: vi.fn(),
    crearCategoria: vi.fn(),
    actualizarCategoria: vi.fn(),
    eliminarCategoria: vi.fn(),
    listarProductos: vi.fn(),
    obtenerProducto: vi.fn(),
    crearProducto: vi.fn(),
    actualizarProducto: vi.fn(),
    eliminarProducto: vi.fn(),
    cambiarDisponibilidad: vi.fn(),
    listarGruposModificadores: vi.fn(),
    crearGrupoModificador: vi.fn(),
    crearModificador: vi.fn(),
    listarCombos: vi.fn(),
    crearCombo: vi.fn(),
    listarPromociones: vi.fn(),
    crearPromocion: vi.fn(),
    listarCupones: vi.fn(),
    crearCupon: vi.fn(),
    validarCupon: vi.fn(),
    agregarImagen: vi.fn(),
    eliminarImagen: vi.fn(),
    listarHorarios: vi.fn(),
    crearHorario: vi.fn(),
    eliminarHorario: vi.fn(),
    listarVariantes: vi.fn(),
    crearVariante: vi.fn(),
    eliminarVariante: vi.fn(),
  },
}));

import { menuRepository } from '@/infraestructura/repositorios';
import {
  useCategorias, useCrearCategoria,
  useActualizarCategoria, useEliminarCategoria,
  useProductos, useProducto, useCrearProducto,
  useCambiarDisponibilidad, useCombos, usePromociones,
  useCupones, useValidarCupon,
} from '@/aplicacion/casos-uso/useMenuCasos';

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── CONSULTAS: CATEGORÍAS ─────────────────────────────────

describe('useCategorias — query', () => {
  it('llama a menuRepository.listarCategorias', async () => {
    const mockData: CategoriaMenu[] = [
      { id: 1, nombre: 'Entradas', activo: true, orden: 1, tenant_id: 'demo', local_id: 1, descripcion: '', icono: '', color: '', cantidad_productos: 0, creado_en: '', actualizado_en: '' },
    ];
    (menuRepository.listarCategorias as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);
    const { result } = renderHook(() => useCategorias(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
    expect(menuRepository.listarCategorias).toHaveBeenCalledTimes(1);
  });

  it('maneja error de listarCategorias', async () => {
    (menuRepository.listarCategorias as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useCategorias(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});



// ─── MUTACIONES: CATEGORÍAS ────────────────────────────────

describe('useCrearCategoria — mutation', () => {
  it('llama a menuRepository.crearCategoria con los datos provistos', async () => {
    const newCat: CategoriaMenu = { id: 10, nombre: 'Postres', activo: true, orden: 5, tenant_id: 'demo', local_id: 1, descripcion: '', icono: '', color: '', cantidad_productos: 0, creado_en: '', actualizado_en: '' };
    (menuRepository.crearCategoria as ReturnType<typeof vi.fn>).mockResolvedValue(newCat);
    const { result } = renderHook(() => useCrearCategoria(), { wrapper: createWrapper() });
    await act(async () => {
      result.current.mutate({ nombre: 'Postres', orden: 5 });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(menuRepository.crearCategoria).toHaveBeenCalledWith({ nombre: 'Postres', orden: 5 });
  });

  it('pone isError=true si el repositorio rechaza', async () => {
    (menuRepository.crearCategoria as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Error al crear'));
    const { result } = renderHook(() => useCrearCategoria(), { wrapper: createWrapper() });
    await act(async () => {
      result.current.mutate({ nombre: 'Fail' });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useActualizarCategoria — mutation', () => {
  it('llama al repositorio con id y datos', async () => {
    (menuRepository.actualizarCategoria as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 3 });
    const { result } = renderHook(() => useActualizarCategoria(), { wrapper: createWrapper() });
    await act(async () => {
      result.current.mutate({ id: '3', data: { nombre: 'Bebidas' } });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(menuRepository.actualizarCategoria).toHaveBeenCalledWith('3', { nombre: 'Bebidas' });
  });
});

describe('useEliminarCategoria — mutation', () => {
  it('llama a menuRepository.eliminarCategoria con el id', async () => {
    (menuRepository.eliminarCategoria as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    const { result } = renderHook(() => useEliminarCategoria(), { wrapper: createWrapper() });
    await act(async () => {
      result.current.mutate('5');
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(menuRepository.eliminarCategoria).toHaveBeenCalledWith('5');
  });
});

// ─── CONSULTAS: PRODUCTOS ──────────────────────────────────

describe('useProductos — query', () => {
  it('llama a menuRepository.listarProductos', async () => {
    (menuRepository.listarProductos as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    const { result } = renderHook(() => useProductos(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(menuRepository.listarProductos).toHaveBeenCalledTimes(1);
  });

  it('pasa filtros al repositorio', async () => {
    (menuRepository.listarProductos as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    const { result } = renderHook(() => useProductos({ categoria_id: '1' }), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(menuRepository.listarProductos).toHaveBeenCalledWith({ categoria_id: '1' });
  });
});

describe('useProducto — query por ID', () => {
  it('queda idle si id es undefined', () => {
    const { result } = renderHook(() => useProducto(''), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
    expect(menuRepository.obtenerProducto).not.toHaveBeenCalled();
  });

  it('carga producto cuando se pasa un id', async () => {
    const mockP: ProductoMenu = { id: 5, nombre: 'Lomo Saltado', precio_base: 35, disponible: true, activo: true, categoria_menu_id: 1, tenant_id: 'demo', local_id: 1, descripcion: '', imagen_url: null, orden: 1, tiempo_preparacion: 20, calorias: null, alergenos: null, es_vegetariano: false, es_vegano: false, es_sin_gluten: false, es_especialidad: false, creado_en: '', actualizado_en: '' };
    (menuRepository.obtenerProducto as ReturnType<typeof vi.fn>).mockResolvedValue(mockP);
    const { result } = renderHook(() => useProducto('5'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(menuRepository.obtenerProducto).toHaveBeenCalledWith('5');
  });
});

describe('useCambiarDisponibilidad — mutation', () => {
  it('llama al repositorio con id y disponible', async () => {
    (menuRepository.cambiarDisponibilidad as ReturnType<typeof vi.fn>).mockResolvedValue({});
    const { result } = renderHook(() => useCambiarDisponibilidad(), { wrapper: createWrapper() });
    await act(async () => {
      result.current.mutate({ id: '7', disponible: false });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(menuRepository.cambiarDisponibilidad).toHaveBeenCalledWith('7', false);
  });
});

describe('useCrearProducto — mutation', () => {
  it('llama a menuRepository.crearProducto', async () => {
    (menuRepository.crearProducto as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 99 });
    const { result } = renderHook(() => useCrearProducto(), { wrapper: createWrapper() });
    await act(async () => {
      result.current.mutate({ nombre: 'Nuevo Prod', precio_base: 25, categoria_menu_id: 1 });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(menuRepository.crearProducto).toHaveBeenCalled();
  });
});

// ─── COMBOS / PROMOCIONES / CUPONES ───────────────────────

describe('useCombos — query', () => {
  it('llama a menuRepository.listarCombos', async () => {
    (menuRepository.listarCombos as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    const { result } = renderHook(() => useCombos(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(menuRepository.listarCombos).toHaveBeenCalledTimes(1);
  });
});

describe('usePromociones — query', () => {
  it('llama a menuRepository.listarPromociones', async () => {
    (menuRepository.listarPromociones as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    const { result } = renderHook(() => usePromociones(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(menuRepository.listarPromociones).toHaveBeenCalledTimes(1);
  });
});

describe('useCupones — query', () => {
  it('llama a menuRepository.listarCupones', async () => {
    (menuRepository.listarCupones as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    const { result } = renderHook(() => useCupones(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(menuRepository.listarCupones).toHaveBeenCalledTimes(1);
  });
});

describe('useValidarCupon — mutation', () => {
  it('llama a menuRepository.validarCupon con código', async () => {
    (menuRepository.validarCupon as ReturnType<typeof vi.fn>).mockResolvedValue({ codigo: 'DESC10', activo: true });
    const { result } = renderHook(() => useValidarCupon(), { wrapper: createWrapper() });
    await act(async () => {
      result.current.mutate('DESC10');
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(menuRepository.validarCupon).toHaveBeenCalledWith({ codigo: 'DESC10' });
  });
});
