import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '@/dominio/entidades';

// ═══════════════════════════════════════════════════════════
// HTTP Client — Axios with JWT cookie interceptors
// ═══════════════════════════════════════════════════════════

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const httpClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => config,
  (error: AxiosError) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue: Array<{ resolve: (v?: unknown) => void; reject: (r?: unknown) => void }> = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse>) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => httpClient(original));
      }
      original._retry = true;
      isRefreshing = true;
      try {
        await httpClient.post('/auth/refresh');
        processQueue(null);
        return httpClient(original);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const r = await httpClient.get<ApiResponse<T>>(url, { params });
  return r.data.data;
}

export async function apiPost<T>(url: string, data?: unknown): Promise<T> {
  const r = await httpClient.post<ApiResponse<T>>(url, data);
  return r.data.data;
}

export async function apiPut<T>(url: string, data?: unknown): Promise<T> {
  const r = await httpClient.put<ApiResponse<T>>(url, data);
  return r.data.data;
}

export async function apiPatch<T>(url: string, data?: unknown): Promise<T> {
  const r = await httpClient.patch<ApiResponse<T>>(url, data);
  return r.data.data;
}

export async function apiDelete<T = void>(url: string): Promise<T> {
  const r = await httpClient.delete<ApiResponse<T>>(url);
  return r.data.data;
}

export async function apiGetPaginated<T>(url: string, params?: Record<string, unknown>) {
  const r = await httpClient.get<{
    exito: boolean;
    data: T[];
    total: number;
    pagina: number;
    limite: number;
    total_paginas: number;
  }>(url, { params });
  return r.data;
}
