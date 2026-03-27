import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from '../api/httpClient';
import type {
  CategoriaMenu, ProductoMenu, VarianteProducto,
  GrupoModificador, Modificador, Combo, Promocion, Cupon, ProductoMenuImagen,
} from '@/dominio/entidades';
import { useAuthStore } from '../store/useAuthStore';
import {
  DEMO_CATEGORIAS, DEMO_PRODUCTOS, DEMO_COMBOS, DEMO_PROMOCIONES, DEMO_CUPONES,
} from '@/compartidos/demoData';

// ═══════════════════════════════════════════════════════════
// Repository: Menú (Categorías, Productos, Variantes, Modificadores, Combos, Promos, Cupones)
// ═══════════════════════════════════════════════════════════

const isDemo = () => useAuthStore.getState().isDemoMode;
let nextId = 100;

export const menuRepository = {
  // Categorías
  listarCategorias: (params?: Record<string, unknown>) => isDemo() ? Promise.resolve(DEMO_CATEGORIAS) : apiGet<CategoriaMenu[]>('/menu/categorias', params),
  obtenerCategoria: (id: string) => isDemo() ? Promise.resolve(DEMO_CATEGORIAS.find(c => String(c.id) === id) ?? DEMO_CATEGORIAS[0]) : apiGet<CategoriaMenu>(`/menu/categorias/${id}`),
  crearCategoria: (data: Partial<CategoriaMenu>) => isDemo() ? Promise.resolve({ ...data, id: ++nextId } as CategoriaMenu) : apiPost<CategoriaMenu>('/menu/categorias', data),
  actualizarCategoria: (id: string, data: Partial<CategoriaMenu>) => isDemo() ? Promise.resolve({ ...data, id: Number(id) } as CategoriaMenu) : apiPut<CategoriaMenu>(`/menu/categorias/${id}`, data),
  eliminarCategoria: (id: string) => isDemo() ? Promise.resolve(undefined as never) : apiDelete(`/menu/categorias/${id}`),

  // Productos
  listarProductos: (params?: Record<string, unknown>) => isDemo() ? Promise.resolve(DEMO_PRODUCTOS) : apiGet<ProductoMenu[]>('/menu/productos', params),
  obtenerProducto: (id: string) => isDemo() ? Promise.resolve(DEMO_PRODUCTOS.find(p => String(p.id) === id) ?? DEMO_PRODUCTOS[0]) : apiGet<ProductoMenu>(`/menu/productos/${id}`),
  crearProducto: (data: Partial<ProductoMenu>) => isDemo() ? Promise.resolve({ ...data, id: ++nextId } as ProductoMenu) : apiPost<ProductoMenu>('/menu/productos', data),
  actualizarProducto: (id: string, data: Partial<ProductoMenu>) => isDemo() ? Promise.resolve({ ...data, id: Number(id) } as ProductoMenu) : apiPut<ProductoMenu>(`/menu/productos/${id}`, data),
  eliminarProducto: (id: string) => isDemo() ? Promise.resolve(undefined as never) : apiDelete(`/menu/productos/${id}`),
  cambiarDisponibilidad: (id: string, disponible: boolean) => {
    if (isDemo()) {
      const prod = DEMO_PRODUCTOS.find(p => String(p.id) === id);
      return Promise.resolve({ ...prod, disponible } as ProductoMenu);
    }
    return apiPatch<ProductoMenu>(`/menu/productos/${id}/disponibilidad`, { disponible });
  },

  // Variantes
  listarVariantes: (productoId: string) => isDemo() ? Promise.resolve([] as VarianteProducto[]) : apiGet<VarianteProducto[]>(`/menu/variantes/producto/${productoId}`),
  crearVariante: (data: Partial<VarianteProducto>) => isDemo() ? Promise.resolve({ ...data, id: ++nextId } as VarianteProducto) : apiPost<VarianteProducto>('/menu/variantes', data),
  eliminarVariante: (id: string) => isDemo() ? Promise.resolve(undefined as never) : apiDelete(`/menu/variantes/${id}`),

  // Grupos modificadores
  listarGruposModificadores: () => isDemo() ? Promise.resolve([] as GrupoModificador[]) : apiGet<GrupoModificador[]>('/menu/modificadores'),
  obtenerGrupoModificador: (id: string) => isDemo() ? Promise.resolve({} as GrupoModificador) : apiGet<GrupoModificador>(`/menu/modificadores/${id}`),
  crearGrupoModificador: (data: Partial<GrupoModificador>) => isDemo() ? Promise.resolve({ ...data, id: ++nextId } as GrupoModificador) : apiPost<GrupoModificador>('/menu/modificadores/grupos', data),
  crearModificador: (data: Partial<Modificador>) => isDemo() ? Promise.resolve({ ...data, id: ++nextId } as Modificador) : apiPost<Modificador>('/menu/modificadores/items', data),
  asignarGrupoAProducto: (data: { producto_id: string; grupo_id: string }) => isDemo() ? Promise.resolve(undefined as never) : apiPost('/menu/modificadores/asignar', data),
  desasignarGrupoDeProducto: (productoId: string, grupoId: string) => isDemo() ? Promise.resolve(undefined as never) : apiDelete(`/menu/modificadores/producto/${productoId}/grupo/${grupoId}`),

  // Combos
  listarCombos: () => isDemo() ? Promise.resolve(DEMO_COMBOS) : apiGet<Combo[]>('/menu/combos'),
  obtenerCombo: (id: string) => isDemo() ? Promise.resolve(DEMO_COMBOS.find(c => String(c.id) === id) ?? DEMO_COMBOS[0]) : apiGet<Combo>(`/menu/combos/${id}`),
  crearCombo: (data: Partial<Combo>) => isDemo() ? Promise.resolve({ ...data, id: ++nextId } as Combo) : apiPost<Combo>('/menu/combos', data),

  // Promociones
  listarPromociones: () => isDemo() ? Promise.resolve(DEMO_PROMOCIONES) : apiGet<Promocion[]>('/menu/promociones'),
  crearPromocion: (data: Partial<Promocion>) => isDemo() ? Promise.resolve({ ...data, id: ++nextId } as Promocion) : apiPost<Promocion>('/menu/promociones', data),

  // Cupones
  listarCupones: () => isDemo() ? Promise.resolve(DEMO_CUPONES) : apiGet<Cupon[]>('/menu/cupones'),
  crearCupon: (data: Partial<Cupon>) => isDemo() ? Promise.resolve({ ...data, id: ++nextId } as Cupon) : apiPost<Cupon>('/menu/cupones', data),
  validarCupon: (data: { codigo: string }) => {
    if (isDemo()) {
      const cupon = DEMO_CUPONES.find(c => c.codigo === data.codigo);
      return cupon ? Promise.resolve(cupon) : Promise.reject(new Error('Cupón no válido'));
    }
    return apiPost<Cupon>('/menu/cupones/validar', data);
  },

  // Imágenes
  agregarImagen: (data: Partial<ProductoMenuImagen>) => isDemo() ? Promise.resolve({ ...data, id: ++nextId } as ProductoMenuImagen) : apiPost<ProductoMenuImagen>('/menu/imagenes', data),
  eliminarImagen: (id: string) => isDemo() ? Promise.resolve(undefined as never) : apiDelete(`/menu/imagenes/${id}`),

  // Horarios
  listarHorarios: () => isDemo() ? Promise.resolve([]) : apiGet('/menu/horarios'),
  crearHorario: (data: unknown) => isDemo() ? Promise.resolve(data) : apiPost('/menu/horarios', data),
  eliminarHorario: (id: string) => isDemo() ? Promise.resolve(undefined as never) : apiDelete(`/menu/horarios/${id}`),
};

export default menuRepository;
