import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Plus, Pencil, Trash2, Check, Zap, Crown, Rocket } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { plataformaRepository } from '@/infraestructura/repositorios';
import type { Plan } from '@/dominio/entidades';
import { Button, Badge, Card, Modal, Input, EmptyState } from '@/infraestructura/ui/componentes/comunes';
import { formatCurrency } from '@/compartidos/utilidades';

// ═══════════════════════════════════════════════════════════
// Planes — CRUD planes de suscripción (SuperAdmin)
// ═══════════════════════════════════════════════════════════

const planSchema = z.object({
  nombre: z.string().min(1, 'Requerido'),
  codigo: z.string().optional(),
  descripcion: z.string().optional(),
  precio_mensual: z.coerce.number().min(0),
  precio_anual: z.coerce.number().min(0).optional(),
  max_locales: z.coerce.number().min(1),
  max_usuarios: z.coerce.number().min(1),
  max_productos_menu: z.coerce.number().min(1),
  tiene_delivery: z.boolean().optional(),
  tiene_reservas: z.boolean().optional(),
  tiene_reportes: z.boolean().optional(),
  activo: z.boolean().optional(),
});

type PlanForm = z.infer<typeof planSchema>;

const planIcons: Record<string, React.ReactNode> = {
  starter: <Zap className="h-8 w-8" />,
  professional: <Rocket className="h-8 w-8" />,
  enterprise: <Crown className="h-8 w-8" />,
};

const planColors: Record<string, string> = {
  starter: 'from-blue-400 to-blue-600',
  professional: 'from-teal-400 to-emerald-600',
  enterprise: 'from-purple-400 to-purple-600',
};

export default function PlanesPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);

  const { data: planes = [], isLoading } = useQuery({
    queryKey: ['superadmin', 'planes'],
    queryFn: () => plataformaRepository.listarPlanes(),
  });

  const crear = useMutation({
    mutationFn: (data: PlanForm) => editing
      ? plataformaRepository.actualizarPlan(String(editing.id), data as any)
      : plataformaRepository.crearPlan(data as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['superadmin', 'planes'] });
      toast.success(editing ? 'Plan actualizado' : 'Plan creado');
      setShowModal(false);
      setEditing(null);
      form.reset();
    },
  });

  const eliminar = useMutation({
    mutationFn: (id: string) => plataformaRepository.eliminarPlan(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['superadmin', 'planes'] }); toast.success('Plan eliminado'); },
  });

  const form = useForm<PlanForm>({ resolver: zodResolver(planSchema) });

  const openEdit = (p: Plan) => {
    setEditing(p);
    form.reset({
      nombre: p.nombre,
      codigo: p.codigo || '',
      descripcion: p.descripcion || '',
      precio_mensual: p.precio_mensual,
      precio_anual: p.precio_anual || 0,
      max_locales: p.max_locales,
      max_usuarios: p.max_usuarios,
      max_productos_menu: p.max_productos_menu,
      tiene_delivery: p.tiene_delivery,
      tiene_reservas: p.tiene_reservas,
      tiene_reportes: p.tiene_reportes,
    });
    setShowModal(true);
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
            <CreditCard className="h-7 w-7 text-teal-600" /> Planes
          </h1>
          <p className="text-slate-500">{planes.length} planes configurados</p>
        </div>
        <Button onClick={() => { setEditing(null); form.reset({ max_locales: 1, max_usuarios: 5, max_productos_menu: 50 }); setShowModal(true); }}>
          <Plus className="h-4 w-4" /> Nuevo Plan
        </Button>
      </div>

      {planes.length === 0 ? (
        <EmptyState icon={<CreditCard className="h-12 w-12" />} title="Sin planes" description="Cree planes de suscripción para la plataforma" action={<Button onClick={() => setShowModal(true)}><Plus className="h-4 w-4" /> Crear plan</Button>} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {planes.map((plan: Plan) => {
            const colorClass = planColors[plan.codigo?.toLowerCase() ?? ''] || 'from-teal-400 to-emerald-600';
            const icon = planIcons[plan.codigo?.toLowerCase() ?? ''] || <CreditCard className="h-8 w-8" />;

            const features = [
              { label: `${plan.max_locales} local${plan.max_locales > 1 ? 'es' : ''}`, included: true },
              { label: `${plan.max_usuarios} usuarios`, included: true },
              { label: `${plan.max_productos_menu} productos`, included: true },
              { label: 'Delivery', included: plan.tiene_delivery },
              { label: 'Reservas', included: plan.tiene_reservas },
              { label: 'Reportes avanzados', included: plan.tiene_reportes },
            ];

            return (
              <Card key={plan.id} className="overflow-hidden">
                {/* Gradient header */}
                <div className={`bg-gradient-to-br ${colorClass} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-4">
                    {icon}
                    <Badge variant="default" className="bg-white/20 text-white border-0">
                      {plan.activo !== false ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold">{plan.nombre}</h3>
                  {plan.descripcion && <p className="text-sm text-white/80 mt-1">{plan.descripcion}</p>}
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{formatCurrency(plan.precio_mensual)}</span>
                    <span className="text-white/70">/mes</span>
                  </div>
                  {plan.precio_anual ? (
                    <p className="text-sm text-white/70 mt-1">{formatCurrency(plan.precio_anual)}/año</p>
                  ) : null}
                </div>

                {/* Features */}
                <div className="p-6 space-y-3">
                  {features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {f.included ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-slate-200 dark:border-slate-700" />
                      )}
                      <span className={`text-sm ${f.included ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 line-through'}`}>
                        {f.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="border-t border-slate-100 p-4 flex gap-2 dark:border-slate-700">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(plan)}>
                    <Pencil className="h-4 w-4" /> Editar
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => { if (confirm('¿Eliminar plan?')) eliminar.mutate(String(plan.id)); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditing(null); }} title={editing ? 'Editar Plan' : 'Nuevo Plan'} size="lg">
        <form onSubmit={form.handleSubmit((d) => crear.mutate(d))} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nombre" {...form.register('nombre')} error={form.formState.errors.nombre?.message} />
            <Input label="Código" {...form.register('codigo')} error={form.formState.errors.codigo?.message} placeholder="starter, professional..." />
          </div>
          <Input label="Descripción" {...form.register('descripcion')} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input type="number" step="0.01" label="Precio Mensual" {...form.register('precio_mensual')} error={form.formState.errors.precio_mensual?.message} />
            <Input type="number" step="0.01" label="Precio Anual" {...form.register('precio_anual')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input type="number" label="Máx. Locales" {...form.register('max_locales')} error={form.formState.errors.max_locales?.message} />
            <Input type="number" label="Máx. Usuarios" {...form.register('max_usuarios')} error={form.formState.errors.max_usuarios?.message} />
            <Input type="number" label="Máx. Productos" {...form.register('max_productos_menu')} error={form.formState.errors.max_productos_menu?.message} />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Características incluidas</label>
            {[
              { key: 'tiene_delivery', label: 'Delivery' },
              { key: 'tiene_reservas', label: 'Reservas' },
              { key: 'tiene_reportes', label: 'Reportes Avanzados' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 cursor-pointer hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                <input type="checkbox" {...form.register(key as any)} className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => { setShowModal(false); setEditing(null); }}>Cancelar</Button>
            <Button type="submit" isLoading={crear.isPending}>{editing ? 'Guardar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
