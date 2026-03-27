// ── Plataforma ──
export interface Plan {
  id: number;
  nombre: string;
  codigo?: string;
  descripcion?: string;
  precio_mensual: number;
  precio_anual: number;
  max_locales: number;
  max_usuarios: number;
  max_productos_menu: number;
  max_mesas: number;
  max_storage_mb: number;
  tiene_delivery: boolean;
  tiene_reservas: boolean;
  tiene_cocina_pantalla: boolean;
  tiene_multi_local: boolean;
  tiene_reportes: boolean;
  tiene_facturacion_electronica: boolean;
  tiene_api: boolean;
  tiene_integraciones: boolean;
  tiene_soporte_prioritario: boolean;
  tiene_personalizacion: boolean;
  tiene_backup_diario: boolean;
  tiene_audit_log: boolean;
  tiene_websocket: boolean;
  tiene_exportacion: boolean;
  tiene_menu_digital: boolean;
  tiene_qr: boolean;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface Tenant {
  id: string;
  nombre: string;
  slug: string;
  ruc: string;
  correo_contacto: string;
  telefono_contacto?: string;
  plan_id?: number;
  max_locales?: number;
  max_usuarios?: number;
  logo_url: string | null;
  color_primario: string;
  color_secundario: string;
  tipo_restaurante: string;
  estado: 'activo' | 'suspendido' | 'cancelado';
  activo?: boolean;
  dias_trial: number;
  creado_en: string;
  actualizado_en: string;
}

export interface Suscripcion {
  id: number;
  tenant_id: string;
  plan_id: number;
  estado: 'trial' | 'activa' | 'suspendida' | 'cancelada' | 'vencida';
  tipo_facturacion: 'mensual' | 'anual';
  fecha_inicio: string;
  fecha_fin: string | null;
  fecha_proximo_pago: string | null;
  renovacion_automatica: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface FacturaPlataforma {
  id: number;
  tenant_id: string;
  suscripcion_id: number;
  numero_factura: string;
  concepto: string;
  monto: number;
  estado: 'pendiente' | 'pagada' | 'vencida' | 'anulada';
  fecha_emision: string;
  fecha_vencimiento: string;
  fecha_pago: string | null;
  creado_en: string;
}
