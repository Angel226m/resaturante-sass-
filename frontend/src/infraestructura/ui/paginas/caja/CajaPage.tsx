import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Banknote, DollarSign, Plus, Receipt, Clock, CheckCircle2, XCircle, CreditCard, Wallet, ArrowRightLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { cajaRepository } from '@/infraestructura/repositorios';
import type { Pago, MetodoPago } from '@/dominio/entidades';
import { Button, Badge, Card, CardHeader, Modal, Input, Select, DataTable, StatCard, EmptyState, Tabs } from '@/infraestructura/ui/componentes/comunes';
import { formatCurrency, formatDateTime } from '@/compartidos/utilidades';
import type { Column } from '@/infraestructura/ui/componentes/comunes/DataTable';

// Caja - turnos, pagos, comprobantes

const pagoSchema = z.object({
  orden_id: z.string().min(1, 'Requerido'),
  metodo_pago_id: z.string().min(1, 'Seleccione metodo'),
  monto: z.coerce.number().min(0.01, 'Min 0.01'),
  referencia: z.string().optional(),
});

type PagoForm = z.infer<typeof pagoSchema>;

export default function CajaPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('turno');
  const [showPagoModal, setShowPagoModal] = useState(false);

  const { data: turnoActivo, isLoading: turnoLoading } = useQuery({
    queryKey: ['caja', 'turno-activo'],
    queryFn: () => cajaRepository.obtenerTurnoActivo().catch(() => null),
  });

  const { data: metodos = [] } = useQuery({
    queryKey: ['caja', 'metodos-pago'],
    queryFn: () => cajaRepository.listarMetodosPago(),
  });

  const { data: pagos = [] } = useQuery({
    queryKey: ['caja', 'pagos', turnoActivo?.id],
    queryFn: () => cajaRepository.listarPagosPorTurno(String(turnoActivo!.id)),
    enabled: !!turnoActivo?.id,
  });

  const abrirTurno = useMutation({
    mutationFn: (data: { monto_apertura: number }) => cajaRepository.abrirTurno(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['caja'] }); toast.success('Turno abierto'); },
  });

  const [showCierreModal, setShowCierreModal] = useState(false);
  const [montoCierre, setMontoCierre] = useState('');

  const cerrarTurno = useMutation({
    mutationFn: ({ id, monto }: { id: string; monto: number }) => cajaRepository.cerrarTurno(id, { monto_cierre: monto }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['caja'] }); toast.success('Turno cerrado'); setShowCierreModal(false); setMontoCierre(''); },
  });

  const registrarPago = useMutation({
    mutationFn: (data: PagoForm) => cajaRepository.crearPago(String(turnoActivo!.id), data as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['caja'] });
      toast.success('Pago registrado');
      setShowPagoModal(false);
      pagoForm.reset();
    },
  });

  const anularPago = useMutation({
    mutationFn: (id: string) => cajaRepository.anularPago(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['caja'] }); toast.success('Pago anulado'); },
  });

  const pagoForm = useForm<PagoForm>({ resolver: zodResolver(pagoSchema) });

  const [montoInicial, setMontoInicial] = useState('0');

  const tabs = [
    { id: 'turno', label: 'Turno Actual', icon: <Clock className="h-4 w-4" /> },
    { id: 'pagos', label: 'Pagos', icon: <DollarSign className="h-4 w-4" />, count: pagos.length },
    { id: 'metodos', label: 'Metodos de Pago', icon: <CreditCard className="h-4 w-4" />, count: metodos.length },
  ];

  const pagoColumns: Column<Pago>[] = [
    { key: 'created_at', label: 'Fecha', sortable: true, render: (p) => formatDateTime(p.creado_en) },
    { key: 'orden_id', label: 'Orden', render: (p) => <span className="font-mono text-xs">#{String(p.orden_id).slice(0, 8)}</span> },
    { key: 'monto', label: 'Monto', sortable: true, render: (p) => <span className="font-bold text-slate-900">{formatCurrency(p.monto_total)}</span> },
    { key: 'metodo_pago_id', label: 'Metodo', render: (p) => {
      const m = metodos.find((met: MetodoPago) => met.id === (p.detalle?.[0]?.metodo_pago_id ?? 0));
      return <Badge variant="default">{m?.nombre || 'N/A'}</Badge>;
    }},
    { key: 'estado', label: 'Estado', render: (p) => (
      <Badge variant={p.estado === 'completado' ? 'success' : p.estado === 'anulado' ? 'danger' : 'warning'} dot>{p.estado}</Badge>
    )},
    { key: 'id', label: '', render: (p) => p.estado !== 'anulado' && (
      <Button size="sm" variant="danger" onClick={() => { if (confirm('¿Anular pago?')) anularPago.mutate(String(p.id)); }}>
        <XCircle className="h-3.5 w-3.5" />
      </Button>
    )},
  ];

  if (turnoLoading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Banknote className="h-7 w-7 text-teal-600" /> Caja
          </h1>
          <p className="text-slate-500">Gestion de turnos, pagos y comprobantes</p>
        </div>
        <div className="flex gap-2">
          {turnoActivo ? (
            <>
              <Button onClick={() => setShowPagoModal(true)}>
                <Plus className="h-4 w-4" /> Registrar Pago
              </Button>
              <Button variant="danger" onClick={() => setShowCierreModal(true)}>
                Cerrar Turno
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Monto inicial"
                value={montoInicial}
                onChange={(e) => setMontoInicial(e.target.value)}
                className="w-36"
              />
              <Button onClick={() => abrirTurno.mutate({ monto_apertura: parseFloat(montoInicial) || 0 })} isLoading={abrirTurno.isPending}>
                <CheckCircle2 className="h-4 w-4" /> Abrir Turno
              </Button>
            </div>
          )}
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={tab} onChange={setTab} />

      {/* --- TAB: Turno Actual --- */}
      {tab === 'turno' && (
        <>
          {!turnoActivo ? (
            <EmptyState icon={<Banknote className="h-12 w-12" />} title="Sin turno activo" description="Abra un turno para comenzar a registrar pagos" />
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Monto Inicial" value={formatCurrency(turnoActivo.monto_apertura)} icon={<Wallet className="h-5 w-5" />} color="teal" />
                <StatCard title="Total Ventas" value={formatCurrency(turnoActivo.total_ventas || 0)} icon={<DollarSign className="h-5 w-5" />} color="emerald" />
                <StatCard title="Pagos Registrados" value={pagos.length.toString()} icon={<Receipt className="h-5 w-5" />} color="blue" />
                <StatCard title="Transacciones" value={(turnoActivo.cantidad_ordenes || pagos.length).toString()} icon={<ArrowRightLeft className="h-5 w-5" />} color="purple" />
              </div>

              <Card>
                <CardHeader title="Detalles del Turno" />
                <div className="p-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-slate-500">Apertura</p>
                    <p className="text-sm font-medium text-slate-900">{formatDateTime(turnoActivo.creado_en)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Estado</p>
                    <Badge variant="success" dot>Abierto</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Cajero</p>
                    <p className="text-sm font-medium text-slate-900">{'Cajero actual'}</p>
                  </div>
                </div>
              </Card>

              {/* Resumen por metodo de pago */}
              <Card>
                <CardHeader title="Resumen por Metodo de Pago" />
                <div className="p-6">
                  <div className="space-y-3">
                    {metodos.map((met: MetodoPago) => {
                      const total = pagos.filter((p: Pago) => (p.detalle?.[0]?.metodo_pago_id ?? 0) === met.id && p.estado !== 'anulado').reduce((s: number, p: Pago) => s + p.monto_total, 0);
                      if (!total) return null;
                      return (
                        <div key={met.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-700">{met.nombre}</span>
                          </div>
                          <span className="font-bold text-slate-900">{formatCurrency(total)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </>
      )}

      {/* --- TAB: Pagos --- */}
      {tab === 'pagos' && (
        <Card>
          <DataTable
            columns={pagoColumns}
            data={pagos}
            searchable
            searchPlaceholder="Buscar pagos..."
          />
        </Card>
      )}

      {/* --- TAB: Metodos de Pago --- */}
      {tab === 'metodos' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metodos.length === 0 ? (
            <div className="col-span-full">
              <EmptyState icon={<CreditCard className="h-12 w-12" />} title="Sin metodos de pago" description="Configure los metodos de pago desde el backend" />
            </div>
          ) : (
            metodos.map((met: MetodoPago) => (
              <Card key={met.id}>
                <div className="flex items-center gap-4 p-5">
                  <div className="rounded-xl bg-teal-50 p-3">
                    <CreditCard className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{met.nombre}</p>
                    <p className="text-xs text-slate-500">{met.tipo}</p>
                  </div>
                  <Badge variant={met.activo ? 'success' : 'danger'} className="ml-auto">{met.activo ? 'Activo' : 'Inactivo'}</Badge>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Modal registrar pago */}
      <Modal isOpen={showPagoModal} onClose={() => setShowPagoModal(false)} title="Registrar Pago" size="md">
        <form onSubmit={pagoForm.handleSubmit((d) => registrarPago.mutate(d))} className="space-y-4">
          <Input label="ID de Orden" {...pagoForm.register('orden_id')} error={pagoForm.formState.errors.orden_id?.message} />
          <Select
            label="Metodo de Pago"
            options={metodos.map((m: MetodoPago) => ({ value: String(m.id), label: m.nombre }))}
            {...pagoForm.register('metodo_pago_id')}
            error={pagoForm.formState.errors.metodo_pago_id?.message}
          />
          <Input type="number" step="0.01" label="Monto" {...pagoForm.register('monto')} error={pagoForm.formState.errors.monto?.message} />
          <Input label="Referencia (opcional)" {...pagoForm.register('referencia')} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowPagoModal(false)}>Cancelar</Button>
            <Button type="submit" isLoading={registrarPago.isPending}>Registrar</Button>
          </div>
        </form>
      </Modal>

      {/* Modal cerrar turno */}
      <Modal isOpen={showCierreModal} onClose={() => setShowCierreModal(false)} title="Cerrar Turno" size="md">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Ingrese el monto de cierre de caja para cerrar el turno actual.</p>
          <Input
            type="number"
            step="0.01"
            label="Monto de Cierre"
            value={montoCierre}
            onChange={(e) => setMontoCierre(e.target.value)}
            placeholder="0.00"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCierreModal(false)}>Cancelar</Button>
            <Button variant="danger" isLoading={cerrarTurno.isPending} onClick={() => cerrarTurno.mutate({ id: String(turnoActivo!.id), monto: parseFloat(montoCierre) || 0 })}>
              Cerrar Turno
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

