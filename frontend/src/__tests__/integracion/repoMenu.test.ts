import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DEMO_CATEGORIAS, DEMO_PRODUCTOS, DEMO_COMBOS, DEMO_PROMOCIONES, DEMO_CUPONES } from '@/compartidos/demoData';

// ═══════════════════════════════════════════════════════════
// Integration tests: menuRepository (demo + API)
// ═══════════════════════════════════════════════════════════

vi.mock('@/infraestructura/store/useAuthStore', () => ({
  useAuthStore: { getState: vi.fn(() => ({ isDemoMode: false })) },
}));

vi.mock('@/infraestructura/api/httpClient', () => ({
  apiGet: vi.fn().mockResolvedValue([]),
  apiPost: vi.fn().mockResolvedValue({}),
  apiPut: vi.fn().mockResolvedValue({}),
  apiPatch: vi.fn().mockResolvedValue({}),
  apiDelete: vi.fn().mockResolvedValue(undefined),
}));

import { useAuthStore } from '@/infraestructura/store/useAuthStore';
import { menuRepository } from '@/infraestructura/repositorios';
import * as httpClient from '@/infraestructura/api/httpClient';

const setDemo = (val: boolean) =>
  (useAuthStore.getState as ReturnType<typeof vi.fn>).mockReturnValue({ isDemoMode: val });

beforeEach(() => {
  vi.clearAllMocks();
  setDemo(false);
});

// ─── MODO DEMO ─────────────────────────────────────────────

describe('menuRepository — modo demo', () => {
  beforeEach(() => setDemo(true));

  describe('categorías', () => {
    it('listarCategorias retorna DEMO_CATEGORIAS', async () => {
      const result = await menuRepository.listarCategorias();
      expect(result).toEqual(DEMO_CATEGORIAS);
      expect(httpClient.apiGet).not.toHaveBeenCalled();
    });

    it('obtenerCategoria(1) retorna la categoría con id=1', async () => {
      const result = await menuRepository.obtenerCategoria('1');
      expect(result.id).toBe(1);
      expect(httpClient.apiGet).not.toHaveBeenCalled();
    });

    it('crearCategoria retorna objeto con datos ingresados + id', async () => {
      const result = await menuRepository.crearCategoria({ nombre: 'Nueva Cat' });
      expect(result.nombre).toBe('Nueva Cat');
      expect(result.id).toBeTypeOf('number');
    });

    it('actualizarCategoria retorna objeto actualizado', async () => {
      const result = await menuRepository.actualizarCategoria('1', { nombre: 'Cat Actualizada' });
      expect(result.nombre).toBe('Cat Actualizada');
      expect(result.id).toBe(1);
    });

    it('eliminarCategoria no llama al API', async () => {
      await menuRepository.eliminarCategoria('1');
      expect(httpClient.apiDelete).not.toHaveBeenCalled();
    });
  });

  describe('productos', () => {
    it('listarProductos retorna DEMO_PRODUCTOS', async () => {
      const result = await menuRepository.listarProductos();
      expect(result).toEqual(DEMO_PRODUCTOS);
    });

    it('obtenerProducto(id) retorna el producto correspondiente', async () => {
      const demo = DEMO_PRODUCTOS[0]!;
      const result = await menuRepository.obtenerProducto(String(demo.id));
      expect(result.id).toBe(demo.id);
    });

    it('cambiarDisponibilidad retorna producto con nuevo estado', async () => {
      const demo = DEMO_PRODUCTOS[0]!;
      const result = await menuRepository.cambiarDisponibilidad(String(demo.id), false);
      expect(result.disponible).toBe(false);
    });
  });

  describe('combos / promociones / cupones', () => {
    it('listarCombos retorna DEMO_COMBOS', async () => {
      const result = await menuRepository.listarCombos();
      expect(result).toEqual(DEMO_COMBOS);
    });

    it('listarPromociones retorna DEMO_PROMOCIONES', async () => {
      const result = await menuRepository.listarPromociones();
      expect(result).toEqual(DEMO_PROMOCIONES);
    });

    it('listarCupones retorna DEMO_CUPONES', async () => {
      const result = await menuRepository.listarCupones();
      expect(result).toEqual(DEMO_CUPONES);
    });

    it('validarCupon con código válido retorna cupon', async () => {
      const primerCupon = DEMO_CUPONES[0]!;
      const result = await menuRepository.validarCupon({ codigo: primerCupon.codigo });
      expect(result.codigo).toBe(primerCupon.codigo);
    });

    it('validarCupon con código inválido rechaza la promesa', async () => {
      await expect(menuRepository.validarCupon({ codigo: 'INVALIDO_XYZ' })).rejects.toThrow();
    });
  });

  describe('variantes y modificadores', () => {
    it('listarVariantes en demo retorna array vacío', async () => {
      const result = await menuRepository.listarVariantes('1');
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    it('listarGruposModificadores en demo retorna array vacío', async () => {
      const result = await menuRepository.listarGruposModificadores();
      expect(result).toHaveLength(0);
    });
  });
});

// ─── MODO API ─────────────────────────────────────────────

describe('menuRepository — modo API', () => {
  it('listarCategorias llama GET /menu/categorias', async () => {
    (httpClient.apiGet as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    await menuRepository.listarCategorias();
    expect(httpClient.apiGet).toHaveBeenCalledWith('/menu/categorias', undefined);
  });

  it('listarCategorias pasa parámetros a apiGet', async () => {
    (httpClient.apiGet as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    await menuRepository.listarCategorias({ activo: true });
    expect(httpClient.apiGet).toHaveBeenCalledWith('/menu/categorias', { activo: true });
  });

  it('obtenerCategoria(id) llama GET /menu/categorias/:id', async () => {
    (httpClient.apiGet as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 5 });
    await menuRepository.obtenerCategoria('5');
    expect(httpClient.apiGet).toHaveBeenCalledWith('/menu/categorias/5');
  });

  it('crearCategoria llama POST /menu/categorias con datos', async () => {
    const data = { nombre: 'Bebidas', orden: 5 };
    (httpClient.apiPost as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 99, ...data });
    await menuRepository.crearCategoria(data);
    expect(httpClient.apiPost).toHaveBeenCalledWith('/menu/categorias', data);
  });

  it('actualizarCategoria llama PUT /menu/categorias/:id', async () => {
    (httpClient.apiPut as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 2 });
    await menuRepository.actualizarCategoria('2', { nombre: 'Updated' });
    expect(httpClient.apiPut).toHaveBeenCalledWith('/menu/categorias/2', { nombre: 'Updated' });
  });

  it('eliminarCategoria llama DELETE /menu/categorias/:id', async () => {
    (httpClient.apiDelete as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    await menuRepository.eliminarCategoria('3');
    expect(httpClient.apiDelete).toHaveBeenCalledWith('/menu/categorias/3');
  });

  it('listarProductos llama GET /menu/productos', async () => {
    (httpClient.apiGet as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    await menuRepository.listarProductos({ page: 1 });
    expect(httpClient.apiGet).toHaveBeenCalledWith('/menu/productos', { page: 1 });
  });

  it('cambiarDisponibilidad llama PATCH con disponible', async () => {
    (httpClient.apiPatch as ReturnType<typeof vi.fn>).mockResolvedValue({});
    await menuRepository.cambiarDisponibilidad('7', true);
    expect(httpClient.apiPatch).toHaveBeenCalledWith('/menu/productos/7/disponibilidad', { disponible: true });
  });

  it('validarCupon llama POST /menu/cupones/validar', async () => {
    (httpClient.apiPost as ReturnType<typeof vi.fn>).mockResolvedValue({});
    await menuRepository.validarCupon({ codigo: 'DESC10' });
    expect(httpClient.apiPost).toHaveBeenCalledWith('/menu/cupones/validar', { codigo: 'DESC10' });
  });

  it('agregarImagen llama POST /menu/imagenes', async () => {
    (httpClient.apiPost as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1 });
    await menuRepository.agregarImagen({ url: 'img.png', orden: 1 });
    expect(httpClient.apiPost).toHaveBeenCalledWith('/menu/imagenes', { url: 'img.png', orden: 1 });
  });

  it('eliminarHorario llama DELETE /menu/horarios/:id', async () => {
    (httpClient.apiDelete as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    await menuRepository.eliminarHorario('10');
    expect(httpClient.apiDelete).toHaveBeenCalledWith('/menu/horarios/10');
  });
});
