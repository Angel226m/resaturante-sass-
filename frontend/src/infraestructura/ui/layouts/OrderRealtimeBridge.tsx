import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/infraestructura/store/useAuthStore';
import { useUIStore } from '@/infraestructura/store/useUIStore';

type CocinaEventType =
  | 'nueva_orden'
  | 'estado_pendiente'
  | 'estado_en_preparacion'
  | 'estado_lista'
  | 'estado_entregada'
  | 'estado_cancelada';

interface CocinaEventData {
  tipo?: CocinaEventType;
  numero_orden?: string;
  orden_id?: number;
  mesa_id?: number;
  mesero_id?: number;
}

interface CocinaPayload {
  tipo?: string;
  data?: CocinaEventData;
}

function formatOrderRef(data: CocinaEventData): string {
  const numero = String(data.numero_orden || '').trim();
  return numero ? `#${numero}` : `#${data.orden_id || ''}`;
}

export default function OrderRealtimeBridge() {
  const qc = useQueryClient();
  const { usuario } = useAuthStore();
  const localSeleccionadoId = useUIStore((s) => s.localSeleccionadoId);
  const pushNotification = useUIStore((s) => s.pushNotification);

  useEffect(() => {
    if (!usuario?.tenant_id || !usuario?.id) return;

    const localWS = Number(localSeleccionadoId || usuario.local_id);
    if (!localWS) return;

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const canal = `orders:${usuario.tenant_id}:${localWS}`;
    const wsURL = `${wsProtocol}//${window.location.host}/ws?tenant_id=${encodeURIComponent(usuario.tenant_id)}&canal=${encodeURIComponent(canal)}`;

    let ws: WebSocket | null = null;
    let reconnectTimer: number | undefined;
    let closed = false;
    let reconnectAttempts = 0;

    const connect = () => {
      if (closed) return;

      ws = new WebSocket(wsURL);

      ws.onopen = () => {
        reconnectAttempts = 0;
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data ?? '{}') as CocinaPayload;
          if (payload?.tipo !== 'orden_cocina') return;

          const data = payload.data ?? {};
          const tipo = data.tipo;
          if (!tipo) return;

          qc.invalidateQueries({ queryKey: ['ordenes'] });

          if (tipo === 'nueva_orden') {
            const ordenRef = formatOrderRef(data);
            const mesaTxt = data.mesa_id ? `Mesa ${data.mesa_id}` : 'Nueva mesa';

            if (usuario.rol === 'cocinero') {
              toast.success(`Nueva orden ${ordenRef} - ${mesaTxt}`, { duration: 3500 });
            }

            pushNotification({
              id: `nueva_orden:${data.orden_id || ordenRef}:${usuario.tenant_id}:${localWS}`,
              title: 'Nueva orden',
              message: `${mesaTxt}: orden ${ordenRef} enviada a cocina.`,
              type: 'info',
            });
            return;
          }

          if (tipo === 'estado_lista') {
            const esMeseroDestino = !data.mesero_id || Number(data.mesero_id) === Number(usuario.id);
            if (!esMeseroDestino) return;

            const ordenRef = formatOrderRef(data);
            const mesaTxt = data.mesa_id ? `Mesa ${data.mesa_id}` : 'Mesa';
            const msg = `${mesaTxt}: pedido ${ordenRef} listo para entregar.`;

            if (usuario.rol === 'mesero') {
              toast.success(msg, { duration: 4500 });
            }

            pushNotification({
              id: `estado_lista:${data.orden_id || ordenRef}:${usuario.tenant_id}:${localWS}`,
              title: 'Pedido listo',
              message: msg,
              type: 'success',
            });
          }
        } catch {
          // Ignore malformed websocket payloads.
        }
      };

      ws.onerror = () => {
        ws?.close();
      };

      ws.onclose = () => {
        if (closed) return;
        const delay = Math.min(10_000, 1_000 * 2 ** Math.min(reconnectAttempts, 4));
        reconnectAttempts += 1;
        reconnectTimer = window.setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      closed = true;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, [usuario?.tenant_id, usuario?.id, usuario?.rol, usuario?.local_id, localSeleccionadoId, qc, pushNotification]);

  return null;
}
