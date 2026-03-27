// ── Reservas ──
export type EstadoReserva = 'pendiente' | 'confirmada' | 'en_curso' | 'completada' | 'cancelada' | 'no_show';

export interface Reserva {
  id: number;
  local_id: number;
  cliente_id: number | null;
  mesa_id: number | null;
  codigo_confirmacion: string;
  nombre_contacto: string;
  telefono_contacto: string;
  correo_contacto: string;
  fecha_reserva: string;
  hora_inicio: string;
  hora_fin: string;
  numero_personas: number;
  estado: EstadoReserva;
  notas: string;
  creado_en: string;
  actualizado_en: string;
}
