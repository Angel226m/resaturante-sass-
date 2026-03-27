import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard, Building2, CreditCard, DollarSign, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { plataformaRepository } from '@/infraestructura/repositorios';
import { Card, CardHeader, StatCard } from '@/infraestructura/ui/componentes/comunes';
import { formatCurrency } from '@/compartidos/utilidades';

// ═══════════════════════════════════════════════════════════
// SuperAdmin Dashboard — overview de la plataforma
// ═══════════════════════════════════════════════════════════

export default function SuperAdminDashboard() {
  const { data: tenants = [] } = useQuery({
    queryKey: ['superadmin', 'tenants'],
    queryFn: () => plataformaRepository.listarTenants(),
  });

  const { data: planes = [] } = useQuery({
    queryKey: ['superadmin', 'planes'],
    queryFn: () => plataformaRepository.listarPlanes(),
  });

  const { data: suscripciones = [] } = useQuery({
    queryKey: ['superadmin', 'suscripciones'],
    queryFn: () => plataformaRepository.listarFacturas(),
  });

  const activos = tenants.filter((t: any) => t.activo !== false).length;
  const ingresos = suscripciones.reduce((s: number, sub: any) => s + (sub.monto || 0), 0);

  // Mock trend data
  const tenantsTrend = [
    { mes: 'Ene', total: Math.max(0, tenants.length - 5) },
    { mes: 'Feb', total: Math.max(0, tenants.length - 4) },
    { mes: 'Mar', total: Math.max(0, tenants.length - 3) },
    { mes: 'Abr', total: Math.max(0, tenants.length - 2) },
    { mes: 'May', total: Math.max(0, tenants.length - 1) },
    { mes: 'Jun', total: tenants.length },
  ];

  const planDistribution = planes.map((p: any) => ({
    nombre: p.nombre,
    cantidad: suscripciones.filter((s: any) => s.plan_id === p.id).length,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <LayoutDashboard className="h-7 w-7 text-teal-600" /> Panel de Plataforma
        </h1>
        <p className="text-slate-500">Visión general de RestauFlow SaaS</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Tenants" value={tenants.length.toString()} icon={<Building2 className="h-5 w-5" />} color="teal" />
        <StatCard title="Tenants Activos" value={activos.toString()} icon={<Activity className="h-5 w-5" />} color="emerald" />
        <StatCard title="Planes" value={planes.length.toString()} icon={<CreditCard className="h-5 w-5" />} color="blue" />
        <StatCard title="Ingresos Totales" value={formatCurrency(ingresos)} icon={<DollarSign className="h-5 w-5" />} color="purple" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tenant Growth */}
        <Card>
          <CardHeader title="Crecimiento de Tenants" description="Últimos 6 meses" />
          <div className="p-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tenantsTrend}>
                <defs>
                  <linearGradient id="colorTenants" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="mes" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="total" stroke="#0d9488" fill="url(#colorTenants)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Plan Distribution */}
        <Card>
          <CardHeader title="Distribución por Plan" description="Suscripciones activas" />
          <div className="p-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={planDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="nombre" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#0d9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Tenants */}
      <Card>
        <CardHeader title="Tenants Recientes" description="Últimos registros" />
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {tenants.slice(0, 5).map((t: any) => (
            <div key={t.id} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 text-sm font-bold text-white">
                  {t.nombre?.charAt(0)?.toUpperCase() || 'T'}
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{t.nombre}</p>
                  <p className="text-xs text-slate-500">{t.slug}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900 dark:text-white">{t.plan_nombre || 'N/A'}</p>
                <p className="text-xs text-slate-500">{t.activo !== false ? '✅ Activo' : '❌ Inactivo'}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
