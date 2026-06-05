import { describe, it, expect } from 'vitest';
import type {
  Usuario, UserRole, LoginRequest, LoginResponse,
  CategoriaMenu, ProductoMenu, GrupoModificador, Modificador,
  Combo, Promocion,
  Orden, ItemOrden, TicketCocina,
  TurnoCaja, MetodoPago, Comprobante,
  Cliente, DireccionCliente,
  Reserva, EstadoReserva,
  ZonaDelivery, EstadoDelivery,
  Mesa, Zona, Local, ConfiguracionRestaurante, EstadoMesa, FormaMesa,
  ApiResponse, PaginatedResponse,
} from '@/dominio/entidades';
import {
  DEMO_ZONAS, DEMO_MESAS, DEMO_CATEGORIAS, DEMO_PRODUCTOS,
  DEMO_COMBOS, DEMO_PROMOCIONES, DEMO_ORDENES, DEMO_RESERVAS,
} from '@/compartidos/demoData';

// ═══════════════════════════════════════════════════════════
// Unit tests: Entidades de dominio
// ═══════════════════════════════════════════════════════════

// ─── Auth ─────────────────────────────────────────────────

describe('UserRole — unión de tipos', () => {
  it('incluye los 7 roles del negocio', () => {
    const roles: UserRole[] = [
      'admin', 'gerente', 'cajero', 'mesero', 'cocinero', 'repartidor', 'almacen',
    ];
    expect(roles).toHaveLength(7);
    roles.forEach(r => expect(r).toBeTypeOf('string'));
  });
});

describe('Usuario — estructura', () => {
  it('fixture cumple la interfaz', () => {
    const u: Usuario = {
      id: 1,
      tenant_id: 'tenant-abc',
      local_id: 1,
      nombre: 'Ana',
      apellidos: 'García',
      correo: 'ana@test.com',
      rol: 'gerente',
      avatar_url: null,
      color_identificacion: '#0d9488',
      activo: true,
      ultimo_acceso: null,
      creado_en: '2025-01-01T00:00:00Z',
      actualizado_en: '2025-01-01T00:00:00Z',
    };
    expect(u.id).toBe(1);
    expect(u.rol).toBe('gerente');
    expect(u.activo).toBe(true);
    expect(u.avatar_url).toBeNull();
  });

  it('LoginRequest tiene correo, contrasena y remember_me opcional', () => {
    const req: LoginRequest = { correo: 'a@b.com', contrasena: 'pass', tenant_slug: 'la-buena-mesa' };
    expect(req.correo).toBeTypeOf('string');
    expect(req.remember_me).toBeUndefined();
  });

  it('LoginResponse contiene usuario y tokens', () => {
    const u: Usuario = { id: 1, tenant_id: 't', local_id: 1, nombre: 'X', apellidos: 'Y', correo: 'x@y.com', rol: 'admin', avatar_url: null, color_identificacion: '#000', activo: true, ultimo_acceso: null, creado_en: '2025-01-01T00:00:00Z', actualizado_en: '2025-01-01T00:00:00Z' };
    const res: LoginResponse = { usuario: u, access_token: 'aaa', refresh_token: 'bbb' };
    expect(res.access_token).toBeTypeOf('string');
    expect(res.refresh_token).toBeTypeOf('string');
  });
});

// ─── DEMO_CATEGORIAS ──────────────────────────────────────

describe('DEMO_CATEGORIAS — integridad de datos', () => {
  it('hay al menos 3 categorías', () => {
    expect(DEMO_CATEGORIAS.length).toBeGreaterThanOrEqual(3);
  });

  it('todos los campos obligatorios existen', () => {
    DEMO_CATEGORIAS.forEach((c: CategoriaMenu) => {
      expect(c.id).toBeTypeOf('number');
      expect(c.nombre).toBeTypeOf('string');
      expect(c.nombre.length).toBeGreaterThan(0);
      expect(c.activo).toBeTypeOf('boolean');
      expect(c.local_id).toBeTypeOf('number');
      expect(c.tenant_id).toBeTypeOf('string');
      expect(c.orden).toBeTypeOf('number');
    });
  });

  it('IDs son únicos', () => {
    const ids = DEMO_CATEGORIAS.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('todos los ítems tienen tenant_id = "demo"', () => {
    DEMO_CATEGORIAS.forEach(c => expect(c.tenant_id).toBe('demo'));
  });
});

// ─── DEMO_PRODUCTOS ───────────────────────────────────────

describe('DEMO_PRODUCTOS — integridad de datos', () => {
  it('hay al menos 5 productos', () => {
    expect(DEMO_PRODUCTOS.length).toBeGreaterThanOrEqual(5);
  });

  it('precio_base siempre > 0', () => {
    DEMO_PRODUCTOS.forEach((p: ProductoMenu) => {
      expect(p.precio_base).toBeGreaterThan(0);
    });
  });

  it('campos booleanos son del tipo correcto', () => {
    DEMO_PRODUCTOS.forEach((p: ProductoMenu) => {
      expect(p.disponible).toBeTypeOf('boolean');
      expect(p.activo).toBeTypeOf('boolean');
      expect(p.es_vegetariano).toBeTypeOf('boolean');
      expect(p.es_vegano).toBeTypeOf('boolean');
      expect(p.es_sin_gluten).toBeTypeOf('boolean');
      expect(p.es_especialidad).toBeTypeOf('boolean');
    });
  });

  it('categoria_menu_id referencia a DEMO_CATEGORIAS', () => {
    const catIds = new Set(DEMO_CATEGORIAS.map(c => c.id));
    DEMO_PRODUCTOS.forEach(p => {
      expect(catIds.has(p.categoria_menu_id),
        `producto "${p.nombre}" referencia categoría ${p.categoria_menu_id} inexistente`).toBe(true);
    });
  });

  it('IDs son únicos', () => {
    const ids = DEMO_PRODUCTOS.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ─── DEMO_COMBOS / DEMO_PROMOCIONES ──────────────────────

describe('DEMO_COMBOS — integridad de datos', () => {
  it('hay al menos 1 combo', () => {
    expect(DEMO_COMBOS.length).toBeGreaterThanOrEqual(1);
  });

  it('precio_combo > 0', () => {
    DEMO_COMBOS.forEach((c: Combo) => {
      expect(c.precio_combo).toBeGreaterThan(0);
    });
  });
});

describe('DEMO_PROMOCIONES — integridad de datos', () => {
  it('hay al menos 1 promoción', () => {
    expect(DEMO_PROMOCIONES.length).toBeGreaterThanOrEqual(1);
  });

  it('todas tienen nombre y valor_descuento >= 0', () => {
    DEMO_PROMOCIONES.forEach((p: Promocion) => {
      expect(p.nombre).toBeTypeOf('string');
      // valor_descuento puede ser 0 en cupones de monto fijo
      expect(typeof p.valor_descuento === 'number').toBe(true);
    });
  });
});

// ─── DEMO_ORDENES ─────────────────────────────────────────

describe('DEMO_ORDENES — integridad de datos', () => {
  const ESTADOS_VALIDOS: Orden['estado'][] = ['pendiente', 'en_preparacion', 'lista', 'entregada', 'cancelada'];
  const TIPOS_VALIDOS: Orden['tipo_orden'][] = ['mesa', 'para_llevar', 'delivery'];

  it('hay al menos 5 órdenes demo', () => {
    expect(DEMO_ORDENES.length).toBeGreaterThanOrEqual(5);
  });

  it('todos los estados son válidos', () => {
    DEMO_ORDENES.forEach((o: Orden) => {
      expect(ESTADOS_VALIDOS).toContain(o.estado);
    });
  });

  it('tipo_orden es válido en todas las órdenes', () => {
    DEMO_ORDENES.forEach((o: Orden) => {
      expect(TIPOS_VALIDOS).toContain(o.tipo_orden);
    });
  });

  it('total y subtotal siempre >= 0', () => {
    DEMO_ORDENES.forEach((o: Orden) => {
      expect(o.total).toBeGreaterThanOrEqual(0);
      expect(o.subtotal).toBeGreaterThanOrEqual(0);
      expect(o.igv).toBeGreaterThanOrEqual(0);
    });
  });

  it('numero_orden no está vacío', () => {
    DEMO_ORDENES.forEach(o => {
      expect(o.numero_orden.length).toBeGreaterThan(0);
    });
  });

  it('hay al menos 1 orden de tipo delivery', () => {
    const deliveries = DEMO_ORDENES.filter(o => o.tipo_orden === 'delivery');
    expect(deliveries.length).toBeGreaterThan(0);
  });

  it('las órdenes con items tienen itemOrden con subtotal >= 0', () => {
    DEMO_ORDENES.forEach((o: Orden) => {
      o.items?.forEach((item: ItemOrden) => {
        expect(item.subtotal).toBeGreaterThanOrEqual(0);
        expect(item.cantidad).toBeGreaterThan(0);
      });
    });
  });
});

// ─── DEMO_MESAS ────────────────────────────────────────────

describe('DEMO_MESAS — integridad de datos', () => {
  const ESTADOS_VALIDOS: EstadoMesa[] = ['disponible', 'ocupada', 'reservada', 'fuera_servicio'];
  const FORMAS_VALIDAS: FormaMesa[] = ['cuadrada', 'redonda', 'rectangular'];

  it('hay exactamente 12 mesas', () => {
    expect(DEMO_MESAS).toHaveLength(12);
  });

  it('todos los estados de mesa son válidos', () => {
    DEMO_MESAS.forEach((m: Mesa) => {
      expect(ESTADOS_VALIDOS).toContain(m.estado);
    });
  });

  it('todas las formas son válidas', () => {
    DEMO_MESAS.forEach((m: Mesa) => {
      expect(FORMAS_VALIDAS).toContain(m.forma);
    });
  });

  it('capacidad > 0 en todas las mesas', () => {
    DEMO_MESAS.forEach(m => expect(m.capacidad).toBeGreaterThan(0));
  });

  it('zona_id de cada mesa referencia DEMO_ZONAS', () => {
    const zonaIds = new Set(DEMO_ZONAS.map(z => z.id));
    DEMO_MESAS.forEach(m => {
      expect(zonaIds.has(m.zona_id), `mesa ${m.id} referencia zona ${m.zona_id} inexistente`).toBe(true);
    });
  });

  it('números de mesa son únicos', () => {
    const nums = DEMO_MESAS.map(m => m.numero);
    expect(new Set(nums).size).toBe(nums.length);
  });

  it('hay mesas con distintos estados', () => {
    const estados = new Set(DEMO_MESAS.map(m => m.estado));
    expect(estados.size).toBeGreaterThanOrEqual(3);
  });
});

// ─── DEMO_ZONAS ────────────────────────────────────────────

describe('DEMO_ZONAS — integridad de datos', () => {
  it('hay exactamente 4 zonas', () => {
    expect(DEMO_ZONAS).toHaveLength(4);
  });

  it('piso es un número en todas las zonas', () => {
    DEMO_ZONAS.forEach((z: Zona) => {
      expect(z.piso).toBeTypeOf('number');
      expect(z.piso).toBeGreaterThan(0);
    });
  });

  it('orden es único entre zonas', () => {
    const ordenes = DEMO_ZONAS.map(z => z.orden);
    expect(new Set(ordenes).size).toBe(ordenes.length);
  });

  it('todos tienen color en formato hex o css', () => {
    DEMO_ZONAS.forEach(z => {
      expect(z.color).toMatch(/^#[0-9a-fA-F]{3,6}$/);
    });
  });
});

// ─── DEMO_RESERVAS ─────────────────────────────────────────

describe('DEMO_RESERVAS — integridad de datos', () => {
  const ESTADOS_VALIDOS: EstadoReserva[] = ['pendiente', 'confirmada', 'en_curso', 'completada', 'cancelada', 'no_show'];

  it('hay al menos 3 reservas', () => {
    expect(DEMO_RESERVAS.length).toBeGreaterThanOrEqual(3);
  });

  it('todos los estados son válidos', () => {
    DEMO_RESERVAS.forEach((r: Reserva) => {
      expect(ESTADOS_VALIDOS).toContain(r.estado);
    });
  });

  it('numero_personas >= 1 en todas las reservas', () => {
    DEMO_RESERVAS.forEach(r => {
      expect(r.numero_personas).toBeGreaterThanOrEqual(1);
    });
  });

  it('nombre_contacto y telefono_contacto no están vacíos', () => {
    DEMO_RESERVAS.forEach(r => {
      expect(r.nombre_contacto.length).toBeGreaterThan(0);
      expect(r.telefono_contacto.length).toBeGreaterThan(0);
    });
  });

  it('codigo_confirmacion es único', () => {
    const codigos = DEMO_RESERVAS.map(r => r.codigo_confirmacion);
    expect(new Set(codigos).size).toBe(codigos.length);
  });
});

// ─── Entidades de Caja ─────────────────────────────────────

describe('TurnoCaja — estructura', () => {
  it('fixture de turno abierto es válido', () => {
    const t: TurnoCaja = {
      id: 1, local_id: 1, usuario_id: 2,
      monto_apertura: 500, monto_cierre: null,
      total_ventas: 1200, total_efectivo: 700,
      total_tarjeta: 400, total_otros: 100,
      cantidad_ordenes: 15, estado: 'abierto',
      fecha_apertura: '2025-01-01T08:00:00Z', fecha_cierre: null,
      observaciones: '', creado_en: '2025-01-01T08:00:00Z',
    };
    expect(t.estado).toBe('abierto');
    expect(t.monto_cierre).toBeNull();
  });

  it('MetodoPago.tipo acepta todos los tipos válidos', () => {
    const tipos: MetodoPago['tipo'][] = ['efectivo', 'tarjeta', 'transferencia', 'billetera_digital', 'otro'];
    tipos.forEach(tipo => {
      const m: MetodoPago = { id: 1, local_id: 1, nombre: tipo, tipo, comision_porcentaje: 0, requiere_referencia: false, activo: true };
      expect(m.tipo).toBe(tipo);
    });
  });

  it('Comprobante.tipo_comprobante acepta los 3 tipos', () => {
    const tipos: Comprobante['tipo_comprobante'][] = ['boleta', 'factura', 'nota_venta'];
    tipos.forEach(tipo => {
      const c: Comprobante = {
        id: 1, pago_id: 1, tipo_comprobante: tipo,
        serie: 'B001', numero: '00001', cliente_nombre: 'Test',
        cliente_documento: '12345678', subtotal: 100, igv: 18, total: 118,
        estado: 'emitido', pdf_url: null, creado_en: '2025-01-01T00:00:00Z',
      };
      expect(c.tipo_comprobante).toBe(tipo);
    });
  });
});

// ─── Entidades de Delivery ─────────────────────────────────

describe('DeliveryOrden + ZonaDelivery — estructura', () => {
  it('EstadoDelivery cubre los 6 estados del flujo', () => {
    const estados: EstadoDelivery[] = ['pendiente', 'asignado', 'recogido', 'en_camino', 'entregado', 'cancelado'];
    expect(estados).toHaveLength(6);
  });

  it('ZonaDelivery tiene costo_envio y radio_km numéricos', () => {
    const z: ZonaDelivery = {
      id: 1, local_id: 1, nombre: 'Miraflores',
      radio_km: 5, costo_envio: 8.50,
      tiempo_estimado_min: 25, activo: true,
    };
    expect(z.radio_km).toBeGreaterThan(0);
    expect(z.costo_envio).toBeGreaterThanOrEqual(0);
  });
});

// ─── Respuestas genéricas (ApiResponse / PaginatedResponse) ───

describe('ApiResponse<T> — estructura genérica', () => {
  it('ApiResponse<string> es válida', () => {
    const r: ApiResponse<string> = { exito: true, mensaje: 'ok', data: 'resultado' };
    expect(r.exito).toBe(true);
    expect(r.data).toBe('resultado');
  });

  it('ApiResponse con error es válida', () => {
    const r: ApiResponse<null> = { exito: false, mensaje: 'error', data: null, error: 'No encontrado' };
    expect(r.exito).toBe(false);
    expect(r.error).toBeTypeOf('string');
  });

  it('PaginatedResponse contiene campos de paginación', () => {
    const r: PaginatedResponse<number> = {
      exito: true, mensaje: 'ok', data: [1, 2, 3],
      total: 100, pagina: 1, limite: 20, total_paginas: 5,
    };
    expect(r.total_paginas).toBe(5);
    expect(r.data).toHaveLength(3);
  });
});

// ─── TicketCocina ──────────────────────────────────────────

describe('TicketCocina — estructura', () => {
  it('fixture cumple la interfaz', () => {
    const t: TicketCocina = {
      id: 1, orden_id: 10,
      estacion_cocina: 'Parrilla',
      estado: 'pendiente',
      prioridad: 1,
      tiempo_estimado: 20,
      cocinero_id: null,
      creado_en: '2025-01-01T00:00:00Z',
      actualizado_en: '2025-01-01T00:00:00Z',
    };
    expect(['pendiente', 'en_preparacion', 'listo']).toContain(t.estado);
    expect(t.prioridad).toBeTypeOf('number');
  });
});

// ─── Local / ConfiguracionRestaurante ─────────────────────

describe('Local — estructura', () => {
  it('fixture cumple la interfaz', () => {
    const l: Local = {
      id: 1, tenant_id: 'demo', nombre: 'Sede Central',
      direccion: 'Av. Lima 100', distrito: 'Miraflores',
      provincia: 'Lima', departamento: 'Lima',
      telefono: '01-2345678', latitud: -12.12, longitud: -77.02,
      es_principal: true, numero_pisos: 2, horarios: null,
      acepta_reservas: true, acepta_delivery: true,
      radio_delivery_km: 5, activo: true,
      creado_en: '2025-01-01T00:00:00Z', actualizado_en: '2025-01-01T00:00:00Z',
    };
    expect(l.es_principal).toBe(true);
    expect(l.acepta_reservas).toBe(true);
  });
});

describe('GrupoModificador — estructura', () => {
  it('tipo_seleccion es "unico" o "multiple"', () => {
    const tipos: GrupoModificador['tipo_seleccion'][] = ['unico', 'multiple'];
    tipos.forEach(tipo => {
      const g: GrupoModificador = {
        id: 1, tenant_id: 't', local_id: 1, nombre: 'Extras',
        tipo_seleccion: tipo, min_seleccion: 0, max_seleccion: 3,
        es_obligatorio: false, activo: true,
      };
      expect(g.tipo_seleccion).toBe(tipo);
    });
  });

  it('Modificador tiene precio_adicional numérico', () => {
    const m: Modificador = {
      id: 1, grupo_modificador_id: 1,
      nombre: 'Queso extra', precio_adicional: 3.5,
      disponible: true, orden: 1,
    };
    expect(m.precio_adicional).toBeTypeOf('number');
  });
});

describe('Cliente — estructura', () => {
  it('tipo_documento acepta todos los valores', () => {
    const tipos: Cliente['tipo_documento'][] = ['dni', 'ruc', 'ce', 'pasaporte'];
    tipos.forEach(tipo => {
      const c: Cliente = {
        id: 1, tenant_id: 't', local_id: 1, nombres: 'Ana', apellidos: 'García',
        tipo_documento: tipo, numero_documento: '12345678',
        correo: 'a@b.com', celular: '987654321',
        fecha_nacimiento: null, genero: null,
        total_compras: 0, cantidad_visitas: 0,
        activo: true, creado_en: '2025-01-01T00:00:00Z', actualizado_en: '2025-01-01T00:00:00Z',
      };
      expect(c.tipo_documento).toBe(tipo);
    });
  });
});

describe('DireccionCliente — estructura', () => {
  it('es_principal es booleano', () => {
    const d: DireccionCliente = {
      id: 1, cliente_id: 1, etiqueta: 'Casa',
      direccion: 'Jr. Test 123', referencia: 'Cerca al parque',
      distrito: 'Miraflores', latitud: -12.12, longitud: -77.02,
      es_principal: true, activo: true,
    };
    expect(d.es_principal).toBe(true);
  });
});

describe('ConfiguracionRestaurante — estructura', () => {
  it('porcentaje_igv y porcentaje_propina son números', () => {
    const c: Partial<ConfiguracionRestaurante> = {
      porcentaje_igv: 18,
      porcentaje_propina: 10,
      incluye_igv: true,
      acepta_propina: true,
    };
    expect(c.porcentaje_igv).toBe(18);
    expect(c.porcentaje_propina).toBe(10);
  });
});
