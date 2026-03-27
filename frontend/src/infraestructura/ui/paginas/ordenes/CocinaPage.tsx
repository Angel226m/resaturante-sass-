import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChefHat, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { ordenesRepository } from '@/infraestructura/repositorios';
import type { TicketCocina } from '@/dominio/entidades';
import { Button, Badge } from '@/infraestructura/ui/componentes/comunes';
import { formatRelativeTime, getStatusColor, getStatusLabel } from '@/compartidos/utilidades';

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Cocina â€” pantalla de tickets en tiempo real (KDS)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

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
    return (
      <div className={`rounded-2xl border p-4 transition-all ${
        isUrgent
          ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/10'
          : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-slate-900 dark:text-white">#{String(ticket.id)}</span>
          <div className="flex items-center gap-2">
            {isUrgent && <AlertCircle className="h-4 w-4 text-red-500" />}
            <Badge variant={getStatusColor(ticket.estado) as any} dot>{getStatusLabel(ticket.estado)}</Badge>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {ticket.items?.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-slate-700 dark:text-slate-300">
                <span className="font-bold text-teal-600 mr-1">x{item.cantidad}</span>
                {(item.nombre_producto ?? '')}
              </span>
              {item.notas && <span className="text-xs text-amber-600 italic">{item.notas}</span>}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(ticket.creado_en)}
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ChefHat className="h-7 w-7 text-teal-600" /> Cocina
          </h1>
          <p className="text-slate-500">Pantalla de tickets en tiempo real</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="warning" dot>{pendientes.length} Pendientes</Badge>
          <Badge variant="info" dot>{enPrep.length} En preparaciÃ³n</Badge>
          <Badge variant="success" dot>{listos.length} Listos</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pending */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-3 w-3 rounded-full bg-amber-500" />
            <h2 className="font-semibold text-slate-700 dark:text-slate-300">Pendientes ({pendientes.length})</h2>
          </div>
          <div className="space-y-3">
            {pendientes.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center dark:border-slate-700">
                <p className="text-sm text-slate-400">Sin tickets pendientes</p>
              </div>
            ) : (
              pendientes.map((t) => <TicketCard key={t.id} ticket={t} />)
            )}
          </div>
        </div>

        {/* In Progress */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <h2 className="font-semibold text-slate-700 dark:text-slate-300">En preparaciÃ³n ({enPrep.length})</h2>
          </div>
          <div className="space-y-3">
            {enPrep.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center dark:border-slate-700">
                <p className="text-sm text-slate-400">Sin tickets en preparaciÃ³n</p>
              </div>
            ) : (
              enPrep.map((t) => <TicketCard key={t.id} ticket={t} />)
            )}
          </div>
        </div>

        {/* Ready */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-3 w-3 rounded-full bg-emerald-500" />
            <h2 className="font-semibold text-slate-700 dark:text-slate-300">Listos ({listos.length})</h2>
          </div>
          <div className="space-y-3">
            {listos.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center dark:border-slate-700">
                <p className="text-sm text-slate-400">Sin tickets listos</p>
              </div>
            ) : (
              listos.map((t) => <TicketCard key={t.id} ticket={t} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
