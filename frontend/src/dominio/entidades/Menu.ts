// ── Menu ──
export interface CategoriaMenu {
  id: number;
  tenant_id: string;
  local_id: number;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  orden: number;
  activo: boolean;
  cantidad_productos: number;
  creado_en: string;
  actualizado_en: string;
}

export interface ProductoMenu {
  id: number;
  tenant_id: string;
  local_id: number;
  categoria_menu_id: number;
  nombre: string;
  descripcion: string;
  precio_base: number;
  imagen_url: string | null;
  tiempo_preparacion: number;
  calorias: number | null;
  alergenos: string | null;
  es_vegetariano: boolean;
  es_vegano: boolean;
  es_sin_gluten: boolean;
  es_especialidad: boolean;
  disponible: boolean;
  orden: number;
  activo: boolean;
  imagenes?: ProductoMenuImagen[];
  variantes?: VarianteProducto[];
  grupos_modificadores?: GrupoModificador[];
  creado_en: string;
  actualizado_en: string;
}

export interface ProductoMenuImagen {
  id: number;
  producto_menu_id: number;
  url: string;
  alt_texto: string;
  orden: number;
  es_principal: boolean;
}

export interface VarianteProducto {
  id: number;
  producto_menu_id: number;
  nombre: string;
  precio_adicional: number;
  disponible: boolean;
  orden: number;
  activo: boolean;
}

export interface GrupoModificador {
  id: number;
  tenant_id: string;
  local_id: number;
  nombre: string;
  tipo_seleccion: 'unico' | 'multiple';
  min_seleccion: number;
  max_seleccion: number;
  es_obligatorio: boolean;
  modificadores?: Modificador[];
  activo: boolean;
}

export interface Modificador {
  id: number;
  grupo_modificador_id: number;
  nombre: string;
  precio_adicional: number;
  disponible: boolean;
  orden: number;
}

export interface Combo {
  id: number;
  nombre: string;
  descripcion: string;
  precio_combo: number;
  imagen_url: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  disponible: boolean;
  activo: boolean;
  detalle?: { id: number; combo_id: number; producto_menu_id: number; cantidad: number }[];
}

export interface Promocion {
  id: number;
  nombre: string;
  descripcion: string;
  tipo_descuento: 'porcentaje' | 'monto_fijo';
  valor_descuento: number;
  fecha_inicio: string;
  fecha_fin: string;
  aplica_a: 'todo' | 'categoria' | 'producto';
  activo: boolean;
}

export interface Cupon {
  id: number;
  codigo: string;
  descripcion: string;
  tipo_descuento: string;
  valor_descuento: number;
  monto_minimo: number | null;
  fecha_inicio: string;
  fecha_fin: string;
  usos_maximos: number | null;
  usos_actuales: number;
  activo: boolean;
}
