// ═══════════════════════════════════════════════════════════
// Demo Data — datos simulados cuando el backend no responde
// ═══════════════════════════════════════════════════════════

import type {
  Zona, Mesa, CategoriaMenu, ProductoMenu, Combo, Promocion, Cupon,
  Orden, ItemOrden,
} from '@/dominio/entidades';

// ── Zonas ────────────────────────────────────────────────
export const DEMO_ZONAS: Zona[] = [
  { id: 1, tenant_id: 'demo', local_id: 1, piso: 1, nombre: 'Salón Principal', descripcion: 'Área principal del restaurante', color: '#0d9488', orden: 1, activo: true, creado_en: '2025-01-01T00:00:00Z', actualizado_en: '2025-01-01T00:00:00Z' },
  { id: 2, tenant_id: 'demo', local_id: 1, piso: 1, nombre: 'Terraza', descripcion: 'Zona exterior con vista', color: '#f59e0b', orden: 2, activo: true, creado_en: '2025-01-01T00:00:00Z', actualizado_en: '2025-01-01T00:00:00Z' },
  { id: 3, tenant_id: 'demo', local_id: 1, piso: 2, nombre: 'VIP Segundo Piso', descripcion: 'Zona exclusiva privada', color: '#8b5cf6', orden: 3, activo: true, creado_en: '2025-01-01T00:00:00Z', actualizado_en: '2025-01-01T00:00:00Z' },
  { id: 4, tenant_id: 'demo', local_id: 1, piso: 1, nombre: 'Barra', descripcion: 'Área del bar', color: '#ec4899', orden: 4, activo: true, creado_en: '2025-01-01T00:00:00Z', actualizado_en: '2025-01-01T00:00:00Z' },
];

// ── Mesas ────────────────────────────────────────────────
const baseMesa = { tenant_id: 'demo' as const, local_id: 1, qr_codigo: '', qr_url: '', activo: true, creado_en: '2025-01-01T00:00:00Z', actualizado_en: '2025-01-01T00:00:00Z' };

export const DEMO_MESAS: Mesa[] = [
  { ...baseMesa, id: 1, zona_id: 1, numero: 1, capacidad: 4, estado: 'disponible', forma: 'cuadrada', posicion_x: 0, posicion_y: 0 },
  { ...baseMesa, id: 2, zona_id: 1, numero: 2, capacidad: 4, estado: 'ocupada', forma: 'cuadrada', posicion_x: 1, posicion_y: 0 },
  { ...baseMesa, id: 3, zona_id: 1, numero: 3, capacidad: 6, estado: 'disponible', forma: 'rectangular', posicion_x: 2, posicion_y: 0 },
  { ...baseMesa, id: 4, zona_id: 1, numero: 4, capacidad: 2, estado: 'reservada', forma: 'redonda', posicion_x: 0, posicion_y: 1 },
  { ...baseMesa, id: 5, zona_id: 2, numero: 5, capacidad: 4, estado: 'disponible', forma: 'cuadrada', posicion_x: 0, posicion_y: 0 },
  { ...baseMesa, id: 6, zona_id: 2, numero: 6, capacidad: 6, estado: 'ocupada', forma: 'rectangular', posicion_x: 1, posicion_y: 0 },
  { ...baseMesa, id: 7, zona_id: 3, numero: 7, capacidad: 8, estado: 'disponible', forma: 'rectangular', posicion_x: 0, posicion_y: 0 },
  { ...baseMesa, id: 8, zona_id: 3, numero: 8, capacidad: 4, estado: 'disponible', forma: 'redonda', posicion_x: 1, posicion_y: 0 },
  { ...baseMesa, id: 9, zona_id: 4, numero: 9, capacidad: 2, estado: 'ocupada', forma: 'redonda', posicion_x: 0, posicion_y: 0 },
  { ...baseMesa, id: 10, zona_id: 4, numero: 10, capacidad: 2, estado: 'disponible', forma: 'redonda', posicion_x: 1, posicion_y: 0 },
  { ...baseMesa, id: 11, zona_id: 1, numero: 11, capacidad: 4, estado: 'fuera_servicio', forma: 'cuadrada', posicion_x: 1, posicion_y: 1 },
  { ...baseMesa, id: 12, zona_id: 1, numero: 12, capacidad: 8, estado: 'disponible', forma: 'rectangular', posicion_x: 2, posicion_y: 1 },
];

// ── Categorías ───────────────────────────────────────────
export const DEMO_CATEGORIAS: CategoriaMenu[] = [
  { id: 1, tenant_id: 'demo', local_id: 1, nombre: 'Entradas', descripcion: 'Platos para abrir el apetito', icono: '🥗', color: '#10b981', orden: 1, activo: true, cantidad_productos: 4, creado_en: '2025-01-01T00:00:00Z', actualizado_en: '2025-01-01T00:00:00Z' },
  { id: 2, tenant_id: 'demo', local_id: 1, nombre: 'Platos Principales', descripcion: 'Los favoritos de la casa', icono: '🍽️', color: '#f59e0b', orden: 2, activo: true, cantidad_productos: 5, creado_en: '2025-01-01T00:00:00Z', actualizado_en: '2025-01-01T00:00:00Z' },
  { id: 3, tenant_id: 'demo', local_id: 1, nombre: 'Postres', descripcion: 'Para cerrar con broche de oro', icono: '🍰', color: '#ec4899', orden: 3, activo: true, cantidad_productos: 3, creado_en: '2025-01-01T00:00:00Z', actualizado_en: '2025-01-01T00:00:00Z' },
  { id: 4, tenant_id: 'demo', local_id: 1, nombre: 'Bebidas', descripcion: 'Refrescos, jugos y más', icono: '🥤', color: '#3b82f6', orden: 4, activo: true, cantidad_productos: 4, creado_en: '2025-01-01T00:00:00Z', actualizado_en: '2025-01-01T00:00:00Z' },
  { id: 5, tenant_id: 'demo', local_id: 1, nombre: 'Ceviches', descripcion: 'Frescos del mar', icono: '🐟', color: '#06b6d4', orden: 5, activo: true, cantidad_productos: 3, creado_en: '2025-01-01T00:00:00Z', actualizado_en: '2025-01-01T00:00:00Z' },
];

// ── Productos ────────────────────────────────────────────
const baseProd = { tenant_id: 'demo', local_id: 1, imagen_url: null, calorias: null, alergenos: null, es_vegetariano: false, es_vegano: false, es_sin_gluten: false, es_especialidad: false, disponible: true, activo: true, orden: 0, creado_en: '2025-01-01T00:00:00Z', actualizado_en: '2025-01-01T00:00:00Z' };

export const DEMO_PRODUCTOS: ProductoMenu[] = [
  { ...baseProd, id: 1, categoria_menu_id: 1, nombre: 'Causa Limeña', descripcion: 'Papa amarilla con relleno de pollo o atún', precio_base: 22, tiempo_preparacion: 12, orden: 1 },
  { ...baseProd, id: 2, categoria_menu_id: 1, nombre: 'Tequeños de Queso', descripcion: 'Crujientes tequeños con salsa huancaína', precio_base: 18, tiempo_preparacion: 8, orden: 2 },
  { ...baseProd, id: 3, categoria_menu_id: 1, nombre: 'Anticuchos', descripcion: 'Brochetas de corazón con papas doradas', precio_base: 28, tiempo_preparacion: 15, orden: 3 },
  { ...baseProd, id: 4, categoria_menu_id: 1, nombre: 'Papa a la Huancaína', descripcion: 'Papas con crema de ají amarillo', precio_base: 16, tiempo_preparacion: 10, es_vegetariano: true, orden: 4 },
  { ...baseProd, id: 5, categoria_menu_id: 2, nombre: 'Lomo Saltado', descripcion: 'Lomo fino saltado con papas fritas y arroz', precio_base: 38, tiempo_preparacion: 20, es_especialidad: true, orden: 1 },
  { ...baseProd, id: 6, categoria_menu_id: 2, nombre: 'Ají de Gallina', descripcion: 'Pechuga deshilachada en crema de ají', precio_base: 32, tiempo_preparacion: 18, orden: 2 },
  { ...baseProd, id: 7, categoria_menu_id: 2, nombre: 'Arroz con Mariscos', descripcion: 'Arroz al fuego con variedad de mariscos', precio_base: 45, tiempo_preparacion: 25, orden: 3 },
  { ...baseProd, id: 8, categoria_menu_id: 2, nombre: 'Pollo a la Brasa', descripcion: 'Medio pollo con papas y ensalada', precio_base: 35, tiempo_preparacion: 30, orden: 4 },
  { ...baseProd, id: 9, categoria_menu_id: 2, nombre: 'Tacu Tacu con Lomo', descripcion: 'Arroz con frijoles refritos y lomo fino', precio_base: 42, tiempo_preparacion: 22, orden: 5 },
  { ...baseProd, id: 10, categoria_menu_id: 3, nombre: 'Suspiro Limeño', descripcion: 'Dulce de manjar con merengue', precio_base: 14, tiempo_preparacion: 5, orden: 1 },
  { ...baseProd, id: 11, categoria_menu_id: 3, nombre: 'Tres Leches', descripcion: 'Bizcocho bañado en tres tipos de leche', precio_base: 16, tiempo_preparacion: 5, orden: 2 },
  { ...baseProd, id: 12, categoria_menu_id: 3, nombre: 'Picarones', descripcion: 'Donas de camote y zapallo con miel', precio_base: 12, tiempo_preparacion: 10, orden: 3 },
  { ...baseProd, id: 13, categoria_menu_id: 4, nombre: 'Chicha Morada', descripcion: 'Refresco de maíz morado', precio_base: 8, tiempo_preparacion: 2, es_vegano: true, orden: 1 },
  { ...baseProd, id: 14, categoria_menu_id: 4, nombre: 'Pisco Sour', descripcion: 'Cóctel peruano clásico', precio_base: 22, tiempo_preparacion: 5, orden: 2 },
  { ...baseProd, id: 15, categoria_menu_id: 4, nombre: 'Limonada Frozen', descripcion: 'Limonada helada refrescante', precio_base: 10, tiempo_preparacion: 3, es_vegano: true, orden: 3 },
  { ...baseProd, id: 16, categoria_menu_id: 4, nombre: 'Inca Kola', descripcion: 'La bebida del Perú', precio_base: 6, tiempo_preparacion: 1, orden: 4 },
  { ...baseProd, id: 17, categoria_menu_id: 5, nombre: 'Ceviche Clásico', descripcion: 'Pescado fresco en limón con cebolla y ají', precio_base: 35, tiempo_preparacion: 12, es_sin_gluten: true, es_especialidad: true, orden: 1 },
  { ...baseProd, id: 18, categoria_menu_id: 5, nombre: 'Ceviche Mixto', descripcion: 'Pescado y mariscos frescos', precio_base: 42, tiempo_preparacion: 15, es_sin_gluten: true, orden: 2 },
  { ...baseProd, id: 19, categoria_menu_id: 5, nombre: 'Tiradito Nikkei', descripcion: 'Láminas de pescado con salsa oriental', precio_base: 38, tiempo_preparacion: 10, es_sin_gluten: true, orden: 3 },
];

// ── Combos ───────────────────────────────────────────────
export const DEMO_COMBOS: Combo[] = [
  { id: 1, nombre: 'Combo Familiar', descripcion: 'Pollo a la Brasa + 4 Inca Kola + Ensalada', precio_combo: 89, imagen_url: null, fecha_inicio: null, fecha_fin: null, disponible: true, activo: true },
  { id: 2, nombre: 'Combo Cevichero', descripcion: 'Ceviche Clásico + Chicha Morada + Suspiro Limeño', precio_combo: 52, imagen_url: null, fecha_inicio: null, fecha_fin: null, disponible: true, activo: true },
  { id: 3, nombre: 'Almuerzo Ejecutivo', descripcion: 'Entrada + Plato Principal + Bebida', precio_combo: 35, imagen_url: null, fecha_inicio: null, fecha_fin: null, disponible: true, activo: true },
];

// ── Promociones ──────────────────────────────────────────
export const DEMO_PROMOCIONES: Promocion[] = [
  { id: 1, nombre: '2x1 Martes de Ceviches', descripcion: 'Todos los ceviches al 2x1 los martes', tipo_descuento: 'porcentaje', valor_descuento: 50, fecha_inicio: '2025-01-01', fecha_fin: '2025-12-31', aplica_a: 'categoria', activo: true },
  { id: 2, nombre: 'Happy Hour', descripcion: '30% en bebidas de 5pm a 7pm', tipo_descuento: 'porcentaje', valor_descuento: 30, fecha_inicio: '2025-01-01', fecha_fin: '2025-12-31', aplica_a: 'categoria', activo: true },
];

// ── Cupones ──────────────────────────────────────────────
export const DEMO_CUPONES: Cupon[] = [
  { id: 1, codigo: 'BIENVENIDO20', descripcion: '20% de descuento en tu primera visita', tipo_descuento: 'porcentaje', valor_descuento: 20, monto_minimo: 50, fecha_inicio: '2025-01-01', fecha_fin: '2025-12-31', usos_maximos: 100, usos_actuales: 23, activo: true },
  { id: 2, codigo: 'DELIVERY10', descripcion: 'S/10 de descuento en delivery', tipo_descuento: 'monto_fijo', valor_descuento: 10, monto_minimo: 40, fecha_inicio: '2025-01-01', fecha_fin: '2025-12-31', usos_maximos: 200, usos_actuales: 67, activo: true },
];

// ── Órdenes ──────────────────────────────────────────────
const now = new Date();
function minutesAgo(m: number): string {
  return new Date(now.getTime() - m * 60000).toISOString();
}

const demoItems: Record<number, ItemOrden[]> = {
  1: [
    { id: 1, orden_id: 1, producto_menu_id: 17, variante_id: null, cantidad: 2, precio_unitario: 35, precio_modificadores: 0, descuento: 0, subtotal: 70, estado: 'pendiente', notas: '', nombre_producto: 'Ceviche Clásico' },
    { id: 2, orden_id: 1, producto_menu_id: 5, variante_id: null, cantidad: 1, precio_unitario: 38, precio_modificadores: 0, descuento: 0, subtotal: 38, estado: 'pendiente', notas: 'Sin cebolla', nombre_producto: 'Lomo Saltado' },
    { id: 3, orden_id: 1, producto_menu_id: 13, variante_id: null, cantidad: 3, precio_unitario: 8, precio_modificadores: 0, descuento: 0, subtotal: 24, estado: 'pendiente', notas: '', nombre_producto: 'Chicha Morada' },
  ],
  2: [
    { id: 4, orden_id: 2, producto_menu_id: 5, variante_id: null, cantidad: 2, precio_unitario: 38, precio_modificadores: 0, descuento: 0, subtotal: 76, estado: 'en_preparacion', notas: '', nombre_producto: 'Lomo Saltado' },
    { id: 5, orden_id: 2, producto_menu_id: 7, variante_id: null, cantidad: 1, precio_unitario: 45, precio_modificadores: 0, descuento: 0, subtotal: 45, estado: 'en_preparacion', notas: 'Extra mariscos', nombre_producto: 'Arroz con Mariscos' },
  ],
  3: [
    { id: 6, orden_id: 3, producto_menu_id: 8, variante_id: null, cantidad: 1, precio_unitario: 35, precio_modificadores: 0, descuento: 0, subtotal: 35, estado: 'pendiente', notas: '', nombre_producto: 'Pollo a la Brasa' },
    { id: 7, orden_id: 3, producto_menu_id: 17, variante_id: null, cantidad: 1, precio_unitario: 35, precio_modificadores: 0, descuento: 0, subtotal: 35, estado: 'pendiente', notas: 'Bien picante', nombre_producto: 'Ceviche Clásico' },
  ],
  4: [
    { id: 8, orden_id: 4, producto_menu_id: 9, variante_id: null, cantidad: 1, precio_unitario: 42, precio_modificadores: 0, descuento: 0, subtotal: 42, estado: 'lista', notas: '', nombre_producto: 'Tacu Tacu con Lomo' },
    { id: 9, orden_id: 4, producto_menu_id: 10, variante_id: null, cantidad: 2, precio_unitario: 14, precio_modificadores: 0, descuento: 0, subtotal: 28, estado: 'lista', notas: '', nombre_producto: 'Suspiro Limeño' },
  ],
  5: [
    { id: 10, orden_id: 5, producto_menu_id: 3, variante_id: null, cantidad: 2, precio_unitario: 28, precio_modificadores: 0, descuento: 0, subtotal: 56, estado: 'pendiente', notas: '', nombre_producto: 'Anticuchos' },
    { id: 11, orden_id: 5, producto_menu_id: 6, variante_id: null, cantidad: 1, precio_unitario: 32, precio_modificadores: 0, descuento: 0, subtotal: 32, estado: 'pendiente', notas: '', nombre_producto: 'Ají de Gallina' },
    { id: 12, orden_id: 5, producto_menu_id: 14, variante_id: null, cantidad: 2, precio_unitario: 22, precio_modificadores: 0, descuento: 0, subtotal: 44, estado: 'pendiente', notas: '', nombre_producto: 'Pisco Sour' },
  ],
  6: [
    { id: 13, orden_id: 6, producto_menu_id: 18, variante_id: null, cantidad: 1, precio_unitario: 42, precio_modificadores: 0, descuento: 0, subtotal: 42, estado: 'en_preparacion', notas: '', nombre_producto: 'Ceviche Mixto' },
    { id: 14, orden_id: 6, producto_menu_id: 19, variante_id: null, cantidad: 1, precio_unitario: 38, precio_modificadores: 0, descuento: 0, subtotal: 38, estado: 'en_preparacion', notas: '', nombre_producto: 'Tiradito Nikkei' },
  ],
};

export const DEMO_ORDENES: Orden[] = [
  { id: 1, tenant_id: 'demo', local_id: 1, numero_orden: 'ORD-001', tipo_orden: 'mesa', estado: 'pendiente', mesa_id: 2, cliente_id: null, mesero_id: 2, numero_personas: 4, subtotal: 112, descuento: 0, igv: 20.16, total: 132.16, notas: '', tiempo_estimado: 20, items: demoItems[1], creado_en: minutesAgo(5), actualizado_en: minutesAgo(5) },
  { id: 2, tenant_id: 'demo', local_id: 1, numero_orden: 'ORD-002', tipo_orden: 'mesa', estado: 'en_preparacion', mesa_id: 6, cliente_id: null, mesero_id: 2, numero_personas: 2, subtotal: 121, descuento: 0, igv: 21.78, total: 142.78, notas: 'Cliente habitual', tiempo_estimado: 25, items: demoItems[2], creado_en: minutesAgo(12), actualizado_en: minutesAgo(8) },
  { id: 3, tenant_id: 'demo', local_id: 1, numero_orden: 'ORD-003', tipo_orden: 'mesa', estado: 'pendiente', mesa_id: 9, cliente_id: null, mesero_id: 2, numero_personas: 3, subtotal: 70, descuento: 0, igv: 12.6, total: 82.6, notas: '', tiempo_estimado: 18, items: demoItems[3], creado_en: minutesAgo(3), actualizado_en: minutesAgo(3) },
  { id: 4, tenant_id: 'demo', local_id: 1, numero_orden: 'ORD-004', tipo_orden: 'para_llevar', estado: 'lista', mesa_id: null, cliente_id: 1, mesero_id: null, numero_personas: null, subtotal: 70, descuento: 0, igv: 12.6, total: 82.6, notas: 'Nombre: Carmen', tiempo_estimado: 15, items: demoItems[4], creado_en: minutesAgo(25), actualizado_en: minutesAgo(2) },
  { id: 5, tenant_id: 'demo', local_id: 1, numero_orden: 'ORD-005', tipo_orden: 'mesa', estado: 'pendiente', mesa_id: 4, cliente_id: null, mesero_id: 2, numero_personas: 2, subtotal: 132, descuento: 0, igv: 23.76, total: 155.76, notas: 'Celebración cumpleaños', tiempo_estimado: 22, items: demoItems[5], creado_en: minutesAgo(8), actualizado_en: minutesAgo(8) },
  { id: 6, tenant_id: 'demo', local_id: 1, numero_orden: 'ORD-006', tipo_orden: 'delivery', estado: 'en_preparacion', mesa_id: null, cliente_id: 2, mesero_id: null, numero_personas: null, subtotal: 80, descuento: 0, igv: 14.4, total: 94.4, notas: 'Dir: Av. Larco 456', tiempo_estimado: 30, items: demoItems[6], creado_en: minutesAgo(15), actualizado_en: minutesAgo(10) },
];

// ── Reservas (demo) ──────────────────────────────────────
const hoy = new Date().toISOString().split('T')[0]!;

export const DEMO_RESERVAS: import('@/dominio/entidades').Reserva[] = [
  { id: 1, local_id: 1, cliente_id: 1, mesa_id: 3, codigo_confirmacion: 'RES-001', nombre_contacto: 'Roberto Díaz', telefono_contacto: '987654321', correo_contacto: 'roberto@mail.com', fecha_reserva: hoy, hora_inicio: '13:00', hora_fin: '14:30', numero_personas: 4, estado: 'confirmada', notas: 'Cumpleaños', creado_en: '2025-01-20T10:00:00Z', actualizado_en: '2025-01-20T10:00:00Z' },
  { id: 2, local_id: 1, cliente_id: 2, mesa_id: 8, codigo_confirmacion: 'RES-002', nombre_contacto: 'Laura Mendoza', telefono_contacto: '976543210', correo_contacto: 'laura@mail.com', fecha_reserva: hoy, hora_inicio: '20:00', hora_fin: '21:30', numero_personas: 2, estado: 'pendiente', notas: 'Cena romántica', creado_en: '2025-01-20T14:00:00Z', actualizado_en: '2025-01-20T14:00:00Z' },
  { id: 3, local_id: 1, cliente_id: 3, mesa_id: 7, codigo_confirmacion: 'RES-003', nombre_contacto: 'Carlos Quispe', telefono_contacto: '965432109', correo_contacto: 'carlos.q@mail.com', fecha_reserva: hoy, hora_inicio: '19:30', hora_fin: '21:00', numero_personas: 6, estado: 'confirmada', notas: 'Reunión de trabajo', creado_en: '2025-01-21T09:00:00Z', actualizado_en: '2025-01-21T09:00:00Z' },
];

// ── Clientes (demo) ──────────────────────────────────────
export const DEMO_CLIENTES = [
  { id: 1, tenant_id: 'demo', local_id: 1, nombre: 'Roberto', apellidos: 'Díaz Flores', correo: 'roberto@mail.com', telefono: '987654321', direccion: 'Av. Arequipa 200, Miraflores', tipo_documento: 'DNI', numero_documento: '12345678', notas: 'Cliente frecuente', total_visitas: 15, total_gastado: 1250, ultima_visita: '2025-01-20T14:00:00Z', activo: true, creado_en: '2025-01-01T00:00:00Z', actualizado_en: '2025-01-20T14:00:00Z' },
  { id: 2, tenant_id: 'demo', local_id: 1, nombre: 'Laura', apellidos: 'Mendoza Torres', correo: 'laura@mail.com', telefono: '976543210', direccion: 'Jr. Unión 150, Lima', tipo_documento: 'DNI', numero_documento: '87654321', notas: '', total_visitas: 8, total_gastado: 680, ultima_visita: '2025-01-18T20:00:00Z', activo: true, creado_en: '2025-01-01T00:00:00Z', actualizado_en: '2025-01-18T20:00:00Z' },
  { id: 3, tenant_id: 'demo', local_id: 1, nombre: 'Carlos', apellidos: 'Quispe Huamán', correo: 'carlos.q@mail.com', telefono: '965432109', direccion: 'Ca. Los Olivos 89, San Isidro', tipo_documento: 'DNI', numero_documento: '45678912', notas: 'Alergia al maní', total_visitas: 22, total_gastado: 2100, ultima_visita: '2025-01-21T13:00:00Z', activo: true, creado_en: '2025-01-01T00:00:00Z', actualizado_en: '2025-01-21T13:00:00Z' },
];
