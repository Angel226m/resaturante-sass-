import { useQuery } from '@tanstack/react-query';
import {
  ShoppingCart, DollarSign, CalendarDays, TrendingUp,
  ChefHat, CreditCard, Clock, ArrowUpRight,
  Activity,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { reportesRepository, ordenesRepository } from '@/infraestructura/repositorios';
import { useAuthStore } from '@/infraestructura/store/useAuthStore';
import { StatCard, Card, CardHeader } from '@/infraestructura/ui/componentes/comunes';
import Badge from '@/infraestructura/ui/componentes/comunes/Badge';
import { formatCurrency } from '@/compartidos/utilidades';
import { Link } from 'react-router-dom';

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const estadoConfig: Record<string, { label: string; variant: 'warning' | 'info' | 'success' | 'default' }> = {
  nueva: { label: 'Pendiente', variant: 'warning' },
  pendiente: { label: 'Pendiente', variant: 'warning' },
  en_cocina: { label: 'En preparación', variant: 'info' },
  en_preparacion: { label: 'En preparación', variant: 'info' },
  listo: { label: 'Lista', variant: 'success' },
  lista: { label: 'Lista', variant: 'success' },
  servida: { label: 'Entregada', variant: 'default' },
  entregada: { label: 'Entregada', variant: 'default' },
  pagada: { label: 'Pagada', variant: 'success' },
  cancelada: { label: 'Cancelada', variant: 'default' },
};

export default function DashboardPage() {
  const { usuario } = useAuthStore();

  const { data: dashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => reportesRepository.obtenerDashboard(),
    retry: false,
  });

  const { data: ordenesData = [] } = useQuery({
    queryKey: ['ordenes-recientes'],
    queryFn: () => ordenesRepository.listarOrdenes({ por_pagina: 5 }),
    retry: false,
  });

  const ordenesSeguras = Array.isArray(ordenesData) ? ordenesData : [];

  // Derive chart data from real API response
  const ventasSemana = (dashboard?.ventas_por_dia ?? []).map((d) => ({
    dia: DIAS_SEMANA[new Date(d.fecha + 'T00:00:00').getDay()] ?? d.fecha,
    ventas: d.total,
    ordenes: d.ordenes,
  }));

  const topProductos = Array.isArray(dashboard?.productos_mas_vendidos) ? dashboard.productos_mas_vendidos : [];

  const totalTipos = (dashboard?.ordenes_mesa ?? 0) + (dashboard?.ordenes_delivery ?? 0) + (dashboard?.ordenes_para_llevar ?? 0);
  const distribucionTipos = totalTipos > 0
    ? [
        { name: 'En mesa',     value: Math.round((dashboard!.ordenes_mesa / totalTipos) * 100),        color: '#0d9488' },
        { name: 'Para llevar', value: Math.round((dashboard!.ordenes_para_llevar / totalTipos) * 100), color: '#10b981' },
        { name: 'Delivery',    value: Math.round((dashboard!.ordenes_delivery / totalTipos) * 100),    color: '#f59e0b' },
      ]
    : [
        { name: 'En mesa', value: 100, color: '#0d9488' },
      ];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const today = new Date().toLocaleDateString('es-PE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header mejorado */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {greeting()}, {usuario?.nombre || 'Admin'}
          </h1>
          <p className="mt-1 text-sm text-slate-500 capitalize">{today}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-1.5">
            <Activity className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs font-medium text-emerald-700">Sistema operativo</span>
          </div>
        </div>
      </div>

      {/* Stats con gradientes sutiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Ventas del día"
          value={formatCurrency(dashboard?.ventas_hoy || 12580)}
          icon={<DollarSign className="h-5 w-5" />}
          trend={12.5}
          trendLabel="vs ayer"
          color="teal"
        />
        <StatCard
          title="Órdenes hoy"
          value={dashboard?.ordenes_hoy || 47}
          icon={<ShoppingCart className="h-5 w-5" />}
          trend={8.2}
          trendLabel="vs ayer"
          color="emerald"
        />
        <StatCard
          title="Ticket promedio"
          value={formatCurrency(dashboard?.ticket_promedio || 267.66)}
          icon={<CreditCard className="h-5 w-5" />}
          trend={-2.1}
          trendLabel="vs ayer"
          color="blue"
        />
        <StatCard
          title="Reservas hoy"
          value={dashboard?.reservas_hoy || 12}
          icon={<CalendarDays className="h-5 w-5" />}
          trend={5.0}
          trendLabel="vs ayer"
          color="amber"
        />
      </div>

      {/* Gráficos principales */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Ventas semanal */}
        <Card className="lg:col-span-2">
          <CardHeader title="Ventas de la semana" description="Comparativa diaria de ventas e ingresos" />
          <div className="h-[300px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ventasSemana}>
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOrdenes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="dia" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '12px 16px',
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'ventas' ? formatCurrency(value) : value,
                    name === 'ventas' ? 'Ventas' : 'Órdenes',
                  ]}
                />
                <Area type="monotone" dataKey="ventas" stroke="#0d9488" strokeWidth={2.5} fill="url(#colorVentas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Distribución de órdenes por tipo */}
        <Card>
          <CardHeader title="Por tipo de orden" description="Distribución del día" />
          <div className="h-[200px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribucionTipos}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {distribucionTipos.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(value: number) => [`${value}%`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-2">
            {distribucionTipos.map((t) => (
              <div key={t.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="text-slate-600">{t.name}</span>
                </div>
                <span className="font-semibold text-slate-900">{t.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Sección inferior: Órdenes recientes + Top productos */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Órdenes recientes */}
        <Card className="lg:col-span-3">
          <CardHeader
            title="Órdenes recientes"
            description="Últimas órdenes del día"
            action={
              <Link to="/ordenes" className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700">
                Ver todas <ArrowUpRight className="h-3 w-3" />
              </Link>
            }
          />
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 text-left font-medium text-slate-500">Orden</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Ubicación</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Estado</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Total</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {ordenesSeguras.slice(0, 5).map((o) => {
                  const estado = estadoConfig[o.estado] || { label: o.estado, variant: 'default' as const };
                  const ubicacion = o.tipo_orden === 'delivery' ? 'Delivery' : o.tipo_orden === 'para_llevar' ? 'Para llevar' : (o.mesa_id ? `Mesa ${o.mesa_id}` : 'Mesa');
                  const hora = new Date(o.creado_en).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
                  return (
                    <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 font-mono text-xs font-medium text-slate-700">{o.numero_orden}</td>
                      <td className="py-3 text-slate-600">{ubicacion}</td>
                      <td className="py-3">
                        <Badge variant={estado.variant} dot>{estado.label}</Badge>
                      </td>
                      <td className="py-3 text-right font-semibold text-slate-900">{formatCurrency(o.total)}</td>
                      <td className="py-3 text-right text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {hora}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Top productos */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Top productos"
            description="Más vendidos esta semana"
            action={
              <Link to="/reportes" className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700">
                Reportes <ArrowUpRight className="h-3 w-3" />
              </Link>
            }
          />
          <div className="space-y-3 mt-2">
            {topProductos.map((p, i) => {
              const maxCantidad = topProductos[0]?.cantidad ?? 1;
              const percentage = (p.cantidad / maxCantidad) * 100;
              return (
                <div key={p.nombre} className="group">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                      i === 0 ? 'bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-sm' :
                      i === 1 ? 'bg-teal-100 text-teal-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-700 truncate">{p.nombre}</p>
                        <span className="text-sm font-semibold text-slate-900 ml-2">
                          {formatCurrency(p.total)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400 shrink-0">{p.cantidad} uds</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Órdenes por hora */}
      <Card>
        <CardHeader title="Flujo de órdenes" description="Distribución de órdenes durante la semana" />
        <div className="h-[250px] mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ventasSemana} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                  padding: '12px 16px',
                }}
              />
              <Bar dataKey="ordenes" fill="url(#barGradient)" radius={[8, 8, 0, 0]}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                    <stop offset="100%" stopColor="#0d9488" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Quick actions mejoradas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: <ShoppingCart className="h-5 w-5" />, label: 'Nueva orden', desc: 'Crear pedido', link: '/ordenes', color: 'bg-teal-50 text-teal-600', borderColor: 'hover:border-teal-300' },
          { icon: <ChefHat className="h-5 w-5" />, label: 'Ver cocina', desc: 'Tickets activos', link: '/cocina', color: 'bg-amber-50 text-amber-600', borderColor: 'hover:border-amber-300' },
          { icon: <CalendarDays className="h-5 w-5" />, label: 'Reservas', desc: 'Gestionar agenda', link: '/reservas', color: 'bg-blue-50 text-blue-600', borderColor: 'hover:border-blue-300' },
          { icon: <TrendingUp className="h-5 w-5" />, label: 'Reportes', desc: 'Analytics', link: '/reportes', color: 'bg-purple-50 text-purple-600', borderColor: 'hover:border-purple-300' },
        ].map((action) => (
          <Link
            key={action.label}
            to={action.link}
            className={`group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${action.borderColor}`}
          >
            <div className={`rounded-xl p-2.5 ${action.color} transition-transform group-hover:scale-110`}>{action.icon}</div>
            <div>
              <span className="text-sm font-semibold text-slate-700">{action.label}</span>
              <p className="text-xs text-slate-400">{action.desc}</p>
            </div>
            <ArrowUpRight className="ml-auto h-4 w-4 text-slate-300 transition-colors group-hover:text-slate-500" />
          </Link>
        ))}
      </div>
    </div>
  );
}

