import { useQuery } from '@tanstack/react-query';
import {
  ShoppingCart, DollarSign, CalendarDays, TrendingUp,
  ChefHat, CreditCard,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { reportesRepository } from '@/infraestructura/repositorios';
import { useAuthStore } from '@/infraestructura/store/useAuthStore';
import { StatCard, Card, CardHeader } from '@/infraestructura/ui/componentes/comunes';
import { formatCurrency } from '@/compartidos/utilidades';

// Mock chart data for demo
const ventasSemana = [
  { dia: 'Lun', ventas: 2400, ordenes: 45 },
  { dia: 'Mar', ventas: 3200, ordenes: 58 },
  { dia: 'Mié', ventas: 2800, ordenes: 52 },
  { dia: 'Jue', ventas: 3800, ordenes: 67 },
  { dia: 'Vie', ventas: 4500, ordenes: 82 },
  { dia: 'Sáb', ventas: 5200, ordenes: 95 },
  { dia: 'Dom', ventas: 4800, ordenes: 88 },
];

const topProductos = [
  { nombre: 'Lomo Saltado', cantidad: 145, total: 4350 },
  { nombre: 'Ceviche Clásico', cantidad: 128, total: 4480 },
  { nombre: 'Ají de Gallina', cantidad: 98, total: 2450 },
  { nombre: 'Arroz con Mariscos', cantidad: 87, total: 3480 },
  { nombre: 'Causa Limeña', cantidad: 76, total: 1520 },
];

export default function DashboardPage() {
  const { usuario } = useAuthStore();

  const { data: dashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => reportesRepository.obtenerDashboard(),
    retry: false,
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {greeting()}, {usuario?.nombre || 'Admin'} 👋
        </h1>
        <p className="mt-1 text-slate-500">Aquí tienes el resumen de tu restaurante hoy.</p>
      </div>

      {/* Stats */}
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
          color="amber"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Ventas semanal */}
        <Card className="lg:col-span-2">
          <CardHeader title="Ventas de la semana" description="Comparativa diaria de ventas" />
          <div className="h-[300px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ventasSemana}>
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="dia" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Ventas']}
                />
                <Area type="monotone" dataKey="ventas" stroke="#0d9488" strokeWidth={2.5} fill="url(#colorVentas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top productos */}
        <Card>
          <CardHeader title="Top productos" description="Más vendidos esta semana" />
          <div className="space-y-3 mt-2">
            {topProductos.map((p, i) => (
              <div key={p.nombre} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-sm font-bold text-teal-600 dark:bg-teal-900/20">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{p.nombre}</p>
                  <p className="text-xs text-slate-400">{p.cantidad} unidades</p>
                </div>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(p.total)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Órdenes por hora */}
      <Card>
        <CardHeader title="Órdenes por hora" description="Distribución de órdenes durante el día" />
        <div className="h-[250px] mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ventasSemana}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="dia" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Bar dataKey="ordenes" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: <ShoppingCart className="h-5 w-5" />, label: 'Nueva orden', link: '/ordenes', color: 'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400' },
          { icon: <ChefHat className="h-5 w-5" />, label: 'Ver cocina', link: '/cocina', color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' },
          { icon: <CalendarDays className="h-5 w-5" />, label: 'Reservas', link: '/reservas', color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
          { icon: <TrendingUp className="h-5 w-5" />, label: 'Reportes', link: '/reportes', color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' },
        ].map((action) => (
          <a
            key={action.label}
            href={action.link}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
          >
            <div className={`rounded-xl p-2.5 ${action.color}`}>{action.icon}</div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{action.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
