import type {
  CategoriaMenu,
  ProductoMenu,
  VarianteProducto,
  GrupoModificador,
  Modificador,
  Combo,
  Promocion,
  Cupon,
  ProductoMenuImagen,
} from '@/dominio/entidades';

// ═══════════════════════════════════════════════════════════
// Puerto: IMenuRepo — contrato de menú
// ═══════════════════════════════════════════════════════════

export interface IMenuRepo {
  // Categorías
  listarCategorias(params?: Record<string, unknown>): Promise<CategoriaMenu[]>;
  obtenerCategoria(id: string): Promise<CategoriaMenu>;
  crearCategoria(data: Partial<CategoriaMenu>): Promise<CategoriaMenu>;
  actualizarCategoria(id: string, data: Partial<CategoriaMenu>): Promise<CategoriaMenu>;
  eliminarCategoria(id: string): Promise<void>;

  // Productos
  listarProductos(params?: Record<string, unknown>): Promise<ProductoMenu[]>;
  obtenerProducto(id: string): Promise<ProductoMenu>;
  crearProducto(data: Partial<ProductoMenu>): Promise<ProductoMenu>;
  actualizarProducto(id: string, data: Partial<ProductoMenu>): Promise<ProductoMenu>;
  eliminarProducto(id: string): Promise<void>;
  cambiarDisponibilidad(id: string, disponible: boolean): Promise<ProductoMenu>;

  // Variantes
  listarVariantes(productoId: string): Promise<VarianteProducto[]>;
  crearVariante(data: Partial<VarianteProducto>): Promise<VarianteProducto>;
  eliminarVariante(id: string): Promise<void>;

  // Grupos modificadores
  listarGruposModificadores(): Promise<GrupoModificador[]>;
  obtenerGrupoModificador(id: string): Promise<GrupoModificador>;
  crearGrupoModificador(data: Partial<GrupoModificador>): Promise<GrupoModificador>;
  crearModificador(data: Partial<Modificador>): Promise<Modificador>;
  asignarGrupoAProducto(data: { producto_id: string; grupo_id: string }): Promise<void>;
  desasignarGrupoDeProducto(productoId: string, grupoId: string): Promise<void>;

  // Combos
  listarCombos(): Promise<Combo[]>;
  obtenerCombo(id: string): Promise<Combo>;
  crearCombo(data: Partial<Combo>): Promise<Combo>;

  // Promociones
  listarPromociones(): Promise<Promocion[]>;
  crearPromocion(data: Partial<Promocion>): Promise<Promocion>;

  // Cupones
  listarCupones(): Promise<Cupon[]>;
  crearCupon(data: Partial<Cupon>): Promise<Cupon>;
  validarCupon(data: { codigo: string }): Promise<Cupon>;

  // Imágenes
  agregarImagen(data: Partial<ProductoMenuImagen>): Promise<ProductoMenuImagen>;
  eliminarImagen(id: string): Promise<void>;

  // Horarios
  listarHorarios(): Promise<unknown[]>;
  crearHorario(data: unknown): Promise<unknown>;
  eliminarHorario(id: string): Promise<void>;
}
