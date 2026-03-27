// ── Generic API Response ──
export interface ApiResponse<T = unknown> {
  exito: boolean;
  mensaje: string;
  data: T;
  error?: string;
}

export interface PaginatedResponse<T = unknown> {
  exito: boolean;
  mensaje: string;
  data: T[];
  total: number;
  pagina: number;
  limite: number;
  total_paginas: number;
}
