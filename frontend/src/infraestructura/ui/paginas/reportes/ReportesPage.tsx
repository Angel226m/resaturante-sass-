import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, Calendar, DollarSign, ShoppingBag, Users, FileText } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { reportesRepository } from '@/infraestructura/repositorios';
import { Button, Card, CardHeader, StatCard, Tabs, DataTable, Badge, Input } from '@/infraestructura/ui/componentes/comunes';
import { formatCurrency, formatDateTime } from '@/compartidos/utilidades';
import type { Column } from '@/infraestructura/ui/componentes/comunes/DataTable';

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Reportes â€” dashboard, resumen diario, audit log
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const COLORS = ['#0d9488', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

export default function ReportesPage() {
  const [tab, setTab] = useState('dashboard');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const { data: dashboard } = useQuery({
    queryKey: ['reportes', 'dashboard'],
    queryFn: () => reportesRepository.obtenerDashboard(),
  });

  const { data: auditLog = [] } = useQuery({
    queryKey: ['reportes', 'audit-log'],
    queryFn: () => reportesRepository.listarAuditLog(),
    enabled: tab === 'audit',
  });

  const { data: resumen } = useQuery({
    queryKey: ['reportes', 'resumen', fechaInicio, fechaFin],
    queryFn: () => reportesRepository.obtenerResumenDiario({ fecha_inicio: fechaInicio, fecha_fin: fechaFin }),
    enabled: tab === 'resumen' && !!fechaInicio && !!fechaFin,
  });

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'resumen', label: 'Resumen Diario', icon: <Calendar className="h-4 w-4" /> },
    { id: 'audit', label: 'AuditorÃ­a', icon: <FileText className="h-4 w-4" /> },
  ];

  const auditColumns: Column<any>[] = [
    { key: 'created_at', label: 'Fecha', sortable: true, render: (r) => <span className="text-xs">{formatDateTime(r.created_at)}</span> },
    { key: 'usuario_nombre', label: 'Usuario', render: (r) => <span className="font-medium">{r.usuario_nombre || r.usuario_id?.slice(0, 8)}</span> },
    { key: 'accion', label: 'AcciÃ³n', render: (r) => <Badge variant="default">{r.accion}</Badge> },
    { key: 'entidad', label: 'Entidad', render: (r) => <span className="text-sm text-slate-600">{r.entidad}</span> },
    { key: 'descripcion', label: 'DescripciÃ³n', render: (r) => <span className="text-xs text-slate-500 max-w-[300px] truncate block">{r.descripcion || 'â€”'}</span> },
    { key: 'ip', label: 'IP', render: (r) => <span className="font-mono text-xs text-slate-400">{r.ip || 'â€”'}</span> },
  ];

  const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'MiÃ©', 'Jue', 'Vie', 'SÃ¡b'];
  const ventasSemana = dashboard?.ventas_por_dia?.map((v) => ({
    dia: DIAS_SEMANA[new Date(v.fecha + 'T12:00:00').getDay()] ?? v.fecha.slice(5),
    total: v.total,
    ordenes: v.ordenes,
  })) ?? [
    { dia: 'Lun', total: 0, ordenes: 0 }, { dia: 'Mar', total: 0, ordenes: 0 },
    { dia: 'MiÃ©', total: 0, ordenes: 0 }, { dia: 'Jue', total: 0, ordenes: 0 },
    { dia: 'Vie', total: 0, ordenes: 0 }, { dia: 'SÃ¡b', total: 0, ordenes: 0 },
    { dia: 'Dom', total: 0, ordenes: 0 },
  ];

  const topProductos = dashboard?.productos_mas_vendidos ?? [];
  const categorias = dashboard?.ventas_por_categoria ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="h-7 w-7 text-teal-600" /> Reportes
        </h1>
        <p className="text-slate-500">AnÃ¡lisis y mÃ©tricas del negocio</p>
      </div>

      <Tabs tabs={tabs} activeTab={tab} onChange={setTab} />

      {/* --- TAB: Dashboard --- */}
      {tab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Ventas del DÃ­a" value={formatCurrency(dashboard?.ventas_hoy || 0)} icon={<DollarSign className="h-5 w-5" />} color="teal" />
            <StatCard title="Ã“rdenes del DÃ­a" value={(dashboard?.ordenes_hoy || 0).toString()} icon={<ShoppingBag className="h-5 w-5" />} color="blue" />
            <StatCard title="Clientes del DÃ­a" value={(dashboard?.clientes_hoy || 0).toString()} icon={<Users className="h-5 w-5" />} color="emerald" />
            <StatCard title="Ticket Promedio" value={formatCurrency(dashboard?.ticket_promedio || 0)} icon={<TrendingUp className="h-5 w-5" />} color="purple" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Ventas semana */}
            <Card>
              <CardHeader title="Ventas de la Semana" description="Comparativa diaria" />
              <div className="p-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={ventasSemana}>
                    <defs>
                      <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="dia" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Area type="monotone" dataKey="total" stroke="#0d9488" fill="url(#colorVentas)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Ventas por categorÃ­a */}
            <Card>
              <CardHeader title="Ventas por CategorÃ­a" description="DistribuciÃ³n por categorÃ­a" />
              <div className="p-4 h-72 flex items-center justify-center">
                {categorias.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categorias} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="total">
                        {categorias.map((_: any, i: number) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-slate-400">Sin datos todavÃ­a</p>
                )}
              </div>
              {categorias.length > 0 && (
                <div className="border-t border-slate-100 p-4">
                  <div className="flex flex-wrap gap-3">
                    {categorias.map((m: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-slate-600">{m.nombre}: {formatCurrency(m.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Top productos */}
          {topProductos.length > 0 && (
            <Card>
              <CardHeader title="Top Productos" description="Los mÃ¡s vendidos" />
              <div className="p-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProductos.slice(0, 10)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" fontSize={12} />
                    <YAxis type="category" dataKey="nombre" fontSize={12} width={150} />
                    <Tooltip />
                    <Bar dataKey="cantidad" fill="#0d9488" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* --- TAB: Resumen Diario --- */}
      {tab === 'resumen' && (
        <div className="space-y-6">
          <Card>
            <div className="p-5">
              <div className="flex flex-wrap items-end gap-4">
                <Input label="Fecha Inicio" type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
                <Input label="Fecha Fin" type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
                <Button disabled={!fechaInicio || !fechaFin}>
                  <Calendar className="h-4 w-4" /> Generar
                </Button>
              </div>
            </div>
          </Card>

          {resumen && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Total Ventas" value={formatCurrency(resumen.total_ventas || 0)} icon={<DollarSign className="h-5 w-5" />} color="teal" />
              <StatCard title="Total Ã“rdenes" value={(resumen.total_ordenes || 0).toString()} icon={<ShoppingBag className="h-5 w-5" />} color="blue" />
              <StatCard title="Ticket Promedio" value={formatCurrency(resumen.ticket_promedio || 0)} icon={<TrendingUp className="h-5 w-5" />} color="emerald" />
              <StatCard title="Clientes Atendidos" value={(resumen.clientes_atendidos || 0).toString()} icon={<Users className="h-5 w-5" />} color="purple" />
            </div>
          )}
        </div>
      )}

      {/* --- TAB: AuditorÃ­a --- */}
      {tab === 'audit' && (
        <Card>
          <DataTable
            columns={auditColumns}
            data={auditLog}
            searchable
            searchPlaceholder="Buscar en audit log..."
            emptyMessage="Sin registros de auditorÃ­a"
          />
        </Card>
      )}
    </div>
  );
}

