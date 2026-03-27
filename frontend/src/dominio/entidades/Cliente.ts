// ── Clientes ──
export interface Cliente {
  id: number;
  tenant_id: string;
  local_id: number;
  nombres: string;
  apellidos: string;
  tipo_documento: 'dni' | 'ruc' | 'ce' | 'pasaporte';
  numero_documento: string;
  correo: string;
  celular: string;
  fecha_nacimiento: string | null;
  genero: 'M' | 'F' | 'otro' | null;
  total_compras: number;
  cantidad_visitas: number;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface DireccionCliente {
  id: number;
  cliente_id: number;
  etiqueta: string;
  direccion: string;
  referencia: string;
  distrito: string;
  latitud: number | null;
  longitud: number | null;
  es_principal: boolean;
  activo: boolean;
}
