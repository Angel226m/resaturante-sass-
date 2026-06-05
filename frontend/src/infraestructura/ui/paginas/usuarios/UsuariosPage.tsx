import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserCog, Plus, Shield, Mail, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { authRepository } from '@/infraestructura/repositorios';
import type { Usuario } from '@/dominio/entidades';
import { Button, Badge, Card, Modal, Input, Select, DataTable } from '@/infraestructura/ui/componentes/comunes';
import { formatDateTime, getInitials } from '@/compartidos/utilidades';
import type { Column } from '@/infraestructura/ui/componentes/comunes/DataTable';

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Usuarios â€” CRUD de usuarios con asignaciÃ³n de roles
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const usuarioSchema = z.object({
  nombre: z.string().min(1, 'Requerido'),
  apellidos: z.string().min(1, 'Requerido'),
  correo: z.string().email('Email invÃ¡lido'),
  contrasena: z.string().min(6, 'MÃ­nimo 6 caracteres').optional().or(z.literal('')),
  rol: z.string().min(1, 'Seleccione rol'),
  local_id: z.coerce.number().optional(),
  activo: z.boolean().optional(),
});

type UsuarioForm = z.infer<typeof usuarioSchema>;

const ROLES = [
  { value: 'admin', label: 'Administrador' },
  { value: 'gerente', label: 'Gerente' },
  { value: 'cajero', label: 'Cajero' },
  { value: 'mesero', label: 'Mesero' },
  { value: 'cocinero', label: 'Cocinero' },
  { value: 'repartidor', label: 'Repartidor' },
];

const rolColor: Record<string, string> = {
  admin: 'danger',
  gerente: 'warning',
  cajero: 'info',
  mesero: 'success',
  cocinero: 'purple',
  repartidor: 'default',
};

export default function UsuariosPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { data: usuarios = [], isLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => authRepository.listarUsuarios(),
  });

  const crear = useMutation({
    mutationFn: (data: UsuarioForm) => editing
      ? authRepository.actualizarUsuario(String(editing.id), data as any)
      : authRepository.crearUsuario(data as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success(editing ? 'Usuario actualizado' : 'Usuario creado');
      setShowModal(false);
      setEditing(null);
      form.reset();
    },
  });

  const eliminar = useMutation({
    mutationFn: (id: string) => authRepository.eliminarUsuario(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['usuarios'] }); toast.success('Usuario eliminado'); },
  });

  const form = useForm<UsuarioForm>({ resolver: zodResolver(usuarioSchema) });

  const openEdit = (u: Usuario) => {
    setEditing(u);
    form.reset({ nombre: u.nombre, apellidos: u.apellidos, correo: u.correo, rol: u.rol, contrasena: '' });
    setShowModal(true);
  };

  const columns: Column<Usuario>[] = [
    {
      key: 'nombre',
      label: 'Usuario',
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 text-sm font-bold text-white">
            {getInitials(`${u.nombre} ${u.apellidos}`)}
          </div>
          <div>
            <p className="font-medium text-slate-900">{u.nombre} {u.apellidos}</p>
            <p className="text-xs text-slate-500 flex items-center gap-1"><Mail className="h-3 w-3" />{u.correo}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'rol',
      label: 'Rol',
      sortable: true,
      render: (u) => (
        <Badge variant={(rolColor[u.rol] || 'default') as any} dot>
          <Shield className="h-3 w-3 mr-1" />{u.rol?.charAt(0).toUpperCase() + u.rol?.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'activo',
      label: 'Estado',
      render: (u) => <Badge variant={u.activo !== false ? 'success' : 'danger'}>{u.activo !== false ? 'Activo' : 'Inactivo'}</Badge>,
    },
    {
      key: 'ultimo_acceso',
      label: 'Ãšltimo Acceso',
      sortable: true,
      render: (u) => u.ultimo_acceso ? <span className="text-xs text-slate-500">{formatDateTime(u.ultimo_acceso)}</span> : <span className="text-slate-400">â€”</span>,
    },
    {
      key: 'creado_en',
      label: 'Creado',
      sortable: true,
      render: (u) => <span className="text-xs text-slate-500">{formatDateTime(u.creado_en)}</span>,
    },
    {
      key: 'id',
      label: '',
      render: (u) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => openEdit(u)}><Pencil className="h-4 w-4" /></Button>
          <Button size="sm" variant="ghost" onClick={() => { if (confirm('Â¿Eliminar usuario?')) eliminar.mutate(String(u.id)); }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <UserCog className="h-7 w-7 text-teal-600" /> Usuarios
          </h1>
          <p className="text-slate-500">{usuarios.length} usuarios registrados</p>
        </div>
        <Button onClick={() => { setEditing(null); form.reset(); setShowModal(true); }}>
          <Plus className="h-4 w-4" /> Nuevo Usuario
        </Button>
      </div>

      {/* Role summary */}
      <div className="flex flex-wrap gap-3">
        {ROLES.map(({ value, label }) => {
          const count = usuarios.filter((u: Usuario) => u.rol === value).length;
          return (
            <div key={value} className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow-sm border border-slate-100">
              <Badge variant={(rolColor[value] || 'default') as any} dot>{label}</Badge>
              <span className="text-lg font-bold text-slate-900">{count}</span>
            </div>
          );
        })}
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={usuarios}
          isLoading={isLoading}
          searchable
          searchPlaceholder="Buscar por nombre, email, rol..."
          emptyMessage="No se encontraron usuarios"
        />
      </Card>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditing(null); }} title={editing ? 'Editar Usuario' : 'Nuevo Usuario'} size="lg">
        <form onSubmit={form.handleSubmit((d) => crear.mutate(d))} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nombre" {...form.register('nombre')} error={form.formState.errors.nombre?.message} />
            <Input label="Apellidos" {...form.register('apellidos')} error={form.formState.errors.apellidos?.message} />
          </div>
          <Input label="Email" type="email" {...form.register('correo')} error={form.formState.errors.correo?.message} leftIcon={<Mail className="h-4 w-4" />} />
          <div className="relative">
            <Input
              label={editing ? 'Nueva ContraseÃ±a (dejar vacÃ­o para no cambiar)' : 'ContraseÃ±a'}
              type={showPassword ? 'text' : 'password'}
              {...form.register('contrasena')}
              error={form.formState.errors.contrasena?.message}
              rightIcon={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
          </div>
          <Select
            label="Rol"
            options={ROLES}
            {...form.register('rol')}
            error={form.formState.errors.rol?.message}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => { setShowModal(false); setEditing(null); }}>Cancelar</Button>
            <Button type="submit" isLoading={crear.isPending}>{editing ? 'Guardar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

