import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '@/dominio/entidades';

// ═══════════════════════════════════════════════════════════
// HTTP Client — Axios with JWT cookie interceptors + security
// ═══════════════════════════════════════════════════════════

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const httpClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  maxBodyLength: 1024 * 1024,
  maxContentLength: 2 * 1024 * 1024,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',  // CSRF protection: marks as AJAX
  },
  xsrfCookieName: 'csrf_token',
  xsrfHeaderName: 'X-CSRF-Token',
});

// ── Request interceptor: security headers ──
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const url = config.url ?? '';

    // Prevent open redirect via baseURL manipulation
    if (/^https?:\/\//i.test(url)) {
      return Promise.reject(new Error('Absolute URLs are not allowed'));
    }

    // Basic path traversal and control-char guard for request URLs
    if (url.includes('..') || /[\r\n\u0000]/.test(url)) {
      return Promise.reject(new Error('Unsafe request URL'));
    }

    return config;
  },
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

    // Never retry auth endpoints — 401 there means invalid credentials, not expired token
    const isAuthEndpoint = original.url?.startsWith('/auth/login') ||
                           original.url?.startsWith('/auth/refresh') ||
                           original.url?.startsWith('/auth/login-pin') ||
                           original.url?.startsWith('/superadmin/login');

    if (error.response?.status !== 401 || original._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    // If a refresh is already in flight, queue this request to retry after it completes
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => httpClient(original));
    }

    // Start a new refresh cycle
    original._retry = true;
    isRefreshing = true;

    try {
      await httpClient.post('/auth/refresh');
      // Refresh succeeded — retry all queued requests + the original
      processQueue(null);
      return httpClient(original);
    } catch (refreshError) {
      processQueue(refreshError as AxiosError);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const r = await httpClient.get<ApiResponse<T>>(url, { params });
  return (r.data.data ?? undefined) as T;
}

export async function apiPost<T>(url: string, data?: unknown): Promise<T> {
  const r = await httpClient.post<ApiResponse<T>>(url, data);
  return (r.data.data ?? undefined) as T;
}

export async function apiPut<T>(url: string, data?: unknown): Promise<T> {
  const r = await httpClient.put<ApiResponse<T>>(url, data);
  return (r.data.data ?? undefined) as T;
}

export async function apiPatch<T>(url: string, data?: unknown): Promise<T> {
  const r = await httpClient.patch<ApiResponse<T>>(url, data);
  return (r.data.data ?? undefined) as T;
}

export async function apiDelete<T = void>(url: string): Promise<T> {
  const r = await httpClient.delete<ApiResponse<T>>(url);
  return (r.data.data ?? undefined) as T;
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
