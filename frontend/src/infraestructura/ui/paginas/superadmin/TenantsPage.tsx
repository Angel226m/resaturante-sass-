import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Plus, Globe, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { plataformaRepository } from '@/infraestructura/repositorios';
import type { Tenant } from '@/dominio/entidades';
import { Button, Badge, Card, Modal, Input, Select, DataTable } from '@/infraestructura/ui/componentes/comunes';
import { formatDateTime } from '@/compartidos/utilidades';
import type { Column } from '@/infraestructura/ui/componentes/comunes/DataTable';

// ═══════════════════════════════════════════════════════════
// Tenants — CRUD tenants (SuperAdmin)
// ═══════════════════════════════════════════════════════════

const tenantSchema = z.object({
  nombre: z.string().min(1, 'Requerido'),
  slug: z.string().min(1, 'Requerido').regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  plan_id: z.string().min(1, 'Seleccione plan'),
  correo_contacto: z.string().email('Email inválido'),
  telefono_contacto: z.string().optional(),
  max_locales: z.coerce.number().min(1).optional(),
  max_usuarios: z.coerce.number().min(1).optional(),
});

type TenantForm = z.infer<typeof tenantSchema>;

export default function TenantsPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Tenant | null>(null);

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ['superadmin', 'tenants'],
    queryFn: () => plataformaRepository.listarTenants(),
  });

  const { data: planes = [] } = useQuery({
    queryKey: ['superadmin', 'planes'],
    queryFn: () => plataformaRepository.listarPlanes(),
  });

  const crear = useMutation({
    mutationFn: (data: TenantForm) => editing
      ? plataformaRepository.actualizarTenant(editing.id, data as any)
      : plataformaRepository.crearTenant(data as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['superadmin', 'tenants'] });
      toast.success(editing ? 'Tenant actualizado' : 'Tenant creado');
      setShowModal(false);
      setEditing(null);
      form.reset();
    },
  });

  const eliminar = useMutation({
    mutationFn: (id: string) => plataformaRepository.eliminarTenant(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['superadmin', 'tenants'] }); toast.success('Tenant eliminado'); },
  });

  const form = useForm<TenantForm>({ resolver: zodResolver(tenantSchema) });

  const openEdit = (t: Tenant) => {
    setEditing(t);
    form.reset({
      nombre: t.nombre,
      slug: t.slug,
      plan_id: String(t.plan_id ?? ''),
      correo_contacto: t.correo_contacto || '',
      telefono_contacto: t.telefono_contacto || '',
      max_locales: t.max_locales,
      max_usuarios: t.max_usuarios,
    });
    setShowModal(true);
  };

  const columns: Column<Tenant>[] = [
    {
      key: 'nombre',
      label: 'Tenant',
      sortable: true,
      render: (t) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 text-sm font-bold text-white">
            {t.nombre?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">{t.nombre}</p>
            <p className="text-xs text-slate-500 flex items-center gap-1"><Globe className="h-3 w-3" />{t.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'plan_id',
      label: 'Plan',
      render: (t) => {
        const plan = planes.find((p: any) => p.id === t.plan_id);
        return <Badge variant="info">{plan?.nombre || 'N/A'}</Badge>;
      },
    },
    {
      key: 'correo_contacto',
      label: 'Contacto',
      render: (t) => (
        <div>
          <p className="text-sm">{t.correo_contacto}</p>
          {t.telefono_contacto && <p className="text-xs text-slate-500">{t.telefono_contacto}</p>}
        </div>
      ),
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (t) => (
        <Badge variant={t.estado === 'activo' ? 'success' : 'danger'} dot>
          {t.estado === 'activo' ? 'Activo' : t.estado}
        </Badge>
      ),
    },
    {
      key: 'creado_en',
      label: 'Creado',
      sortable: true,
      render: (t) => <span className="text-xs text-slate-500">{formatDateTime(t.creado_en)}</span>,
    },
    {
      key: 'id',
      label: '',
      render: (t) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
          <Button size="sm" variant="ghost" onClick={() => { if (confirm('¿Eliminar tenant? Esto es irreversible.')) eliminar.mutate(t.id); }}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="h-7 w-7 text-teal-600" /> Tenants
          </h1>
          <p className="text-slate-500">{tenants.length} restaurantes registrados</p>
        </div>
        <Button onClick={() => { setEditing(null); form.reset(); setShowModal(true); }}>
          <Plus className="h-4 w-4" /> Nuevo Tenant
        </Button>
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={tenants}
          isLoading={isLoading}
          searchable
          searchPlaceholder="Buscar por nombre, slug, email..."
          emptyMessage="No hay tenants registrados"
        />
      </Card>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditing(null); }} title={editing ? 'Editar Tenant' : 'Nuevo Tenant'} size="lg">
        <form onSubmit={form.handleSubmit((d) => crear.mutate(d))} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nombre" {...form.register('nombre')} error={form.formState.errors.nombre?.message} />
            <Input label="Slug" {...form.register('slug')} error={form.formState.errors.slug?.message} placeholder="mi-restaurante" />
          </div>
          <Select
            label="Plan"
            options={planes.map((p: any) => ({ value: p.id, label: `${p.nombre} - ${p.precio ? `$${p.precio}` : 'Gratis'}` }))}
            {...form.register('plan_id')}
            error={form.formState.errors.plan_id?.message}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Email Contacto" type="email" {...form.register('correo_contacto')} error={form.formState.errors.correo_contacto?.message} />
            <Input label="Teléfono" {...form.register('telefono_contacto')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input type="number" label="Máx. Locales" {...form.register('max_locales')} />
            <Input type="number" label="Máx. Usuarios" {...form.register('max_usuarios')} />
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
