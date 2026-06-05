import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChefHat, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { ordenesRepository } from '@/infraestructura/repositorios';
import type { TicketCocina } from '@/dominio/entidades';
import { Button, Badge } from '@/infraestructura/ui/componentes/comunes';
import { formatRelativeTime, getStatusColor, getStatusLabel } from '@/compartidos/utilidades';


export default function CocinaPage() {
  const qc = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['cocina', 'tickets'],
    queryFn: () => ordenesRepository.listarTicketsCocina(),
    refetchInterval: 5000,
  });

  const cambiarEstado = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: string }) => ordenesRepository.cambiarEstadoTicket(id, estado),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cocina', 'tickets'] }); toast.success('Ticket actualizado'); },
  });

  const pendientes = tickets.filter((t: TicketCocina) => t.estado === 'pendiente');
  const enPrep = tickets.filter((t: TicketCocina) => t.estado === 'en_preparacion');
  const listos = tickets.filter((t: TicketCocina) => t.estado === 'listo');

  const TicketCard = ({ ticket }: { ticket: TicketCocina }) => {
    const isUrgent = ticket.prioridad >= 3;
    const eta = ticket.tiempo_estimado ? `${ticket.tiempo_estimado} min` : 'Sin ETA';

    return (
      <div className={`group rounded-3xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
        isUrgent
          ? 'border-red-200 bg-gradient-to-br from-red-50 to-white'
          : 'border-slate-200 bg-white'
      }`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight text-slate-900">#{String(ticket.id)}</span>
              {isUrgent && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-red-600">Urgente</span>}
            </div>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              Estación {ticket.estacion_cocina || 'general'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isUrgent && <AlertCircle className="h-4 w-4 text-red-500" />}
            <Badge variant={getStatusColor(ticket.estado) as any} dot>{getStatusLabel(ticket.estado)}</Badge>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {ticket.items?.map((item, i) => (
            <div key={i} className="flex items-start justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2 text-sm">
              <div className="flex min-w-0 items-center gap-2">
                <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-teal-100 px-2 text-xs font-bold text-teal-700">x{item.cantidad}</span>
                <span className="truncate font-medium text-slate-800">{item.nombre_producto ?? ''}</span>
              </div>
              {item.notas && <span className="max-w-[45%] text-right text-xs italic text-amber-700">{item.notas}</span>}
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
              <Clock className="h-3 w-3" />
              {formatRelativeTime(ticket.creado_en)}
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1">ETA {eta}</span>
          </div>
          <div className="flex gap-2">
            {ticket.estado === 'pendiente' && (
              <Button size="sm" variant="primary" onClick={() => cambiarEstado.mutate({ id: String(ticket.id), estado: 'en_preparacion' })}>
                Preparar
              </Button>
            )}
            {ticket.estado === 'en_preparacion' && (
              <Button size="sm" variant="success" onClick={() => cambiarEstado.mutate({ id: String(ticket.id), estado: 'listo' })}>
                <CheckCircle2 className="h-4 w-4" /> Listo
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
    </div>
  );

  const renderLane = (title: string, count: number, accent: string, emptyText: string, items: TicketCocina[]) => (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
      <div className={`flex items-center justify-between rounded-t-[1.75rem] border-b px-4 py-3 ${accent}`}>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-current" />
          <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-700">{title}</h2>
        </div>
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-slate-700">{count}</span>
      </div>
      <div className="space-y-3 p-4">
        {items.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-sm font-medium text-slate-400">{emptyText}</p>
          </div>
        ) : (
          items.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[1.75rem] border border-amber-100 bg-gradient-to-r from-white via-amber-50/60 to-teal-50/60 p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 shadow-sm">
              <ChefHat className="h-3.5 w-3.5" />
              Cocina en vivo
            </div>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Panel de preparación</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Controla los pedidos por estado con una vista limpia y directa para cocina.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {renderLane('Pendientes', pendientes.length, 'border-amber-100 bg-amber-50/70 text-amber-500', 'No hay tickets pendientes', pendientes)}
        {renderLane('En preparación', enPrep.length, 'border-blue-100 bg-blue-50/70 text-blue-500', 'No hay tickets en preparación', enPrep)}
        {renderLane('Listos', listos.length, 'border-emerald-100 bg-emerald-50/70 text-emerald-500', 'No hay tickets listos', listos)}
      </div>
    </div>
  );
}


