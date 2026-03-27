import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/infraestructura/store/useAuthStore';
import { useUIStore } from '@/infraestructura/store/useUIStore';
import { PageLoader } from '@/infraestructura/ui/componentes/comunes/LoadingSpinner';
import MainLayout from '@/infraestructura/ui/layouts/MainLayout';

// ═══════════════════════════════════════════════════════════
// App — rutas, providers, lazy-loaded pages
// ═══════════════════════════════════════════════════════════

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
  },
});

// ── Lazy pages ────────────────────────────────────────────
const LandingPage = lazy(() => import('@/infraestructura/ui/paginas/LandingPage'));
const LoginPage = lazy(() => import('@/infraestructura/ui/paginas/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/infraestructura/ui/paginas/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/infraestructura/ui/paginas/auth/ForgotPasswordPage'));

// Admin
const DashboardPage = lazy(() => import('@/infraestructura/ui/paginas/DashboardPage'));
const MenuPage = lazy(() => import('@/infraestructura/ui/paginas/menu/MenuPage'));
const OrdenesPage = lazy(() => import('@/infraestructura/ui/paginas/ordenes/OrdenesPage'));
const CocinaPage = lazy(() => import('@/infraestructura/ui/paginas/ordenes/CocinaPage'));
const MesasPage = lazy(() => import('@/infraestructura/ui/paginas/mesas/MesasPage'));
const CajaPage = lazy(() => import('@/infraestructura/ui/paginas/caja/CajaPage'));
const ClientesPage = lazy(() => import('@/infraestructura/ui/paginas/clientes/ClientesPage'));
const ReservasPage = lazy(() => import('@/infraestructura/ui/paginas/reservas/ReservasPage'));
const DeliveryPage = lazy(() => import('@/infraestructura/ui/paginas/delivery/DeliveryPage'));
const LocalesPage = lazy(() => import('@/infraestructura/ui/paginas/locales/LocalesPage'));
const ReportesPage = lazy(() => import('@/infraestructura/ui/paginas/reportes/ReportesPage'));
const UsuariosPage = lazy(() => import('@/infraestructura/ui/paginas/usuarios/UsuariosPage'));
const ConfiguracionPage = lazy(() => import('@/infraestructura/ui/paginas/configuracion/ConfiguracionPage'));

// Shared
const PerfilPage = lazy(() => import('@/infraestructura/ui/paginas/perfil/PerfilPage'));

// Mesero
const MeseroDashboard = lazy(() => import('@/infraestructura/ui/paginas/mesero/MeseroDashboard'));

// Cocinero
const CocineroDashboard = lazy(() => import('@/infraestructura/ui/paginas/cocinero/CocineroDashboard'));

// SuperAdmin
const SuperAdminDashboard = lazy(() => import('@/infraestructura/ui/paginas/superadmin/SuperAdminDashboard'));
const SuperAdminTenantsPage = lazy(() => import('@/infraestructura/ui/paginas/superadmin/TenantsPage'));
const SuperAdminPlanesPage = lazy(() => import('@/infraestructura/ui/paginas/superadmin/PlanesPage'));

// ── Helpers ───────────────────────────────────────────────
/** Returns the home path for the current user's role */
function useHomeRoute(): string {
  const { isSuperAdmin, usuario } = useAuthStore();
  if (isSuperAdmin) return '/superadmin';
  const rol = usuario?.rol;
  if (rol === 'mesero') return '/mesero';
  if (rol === 'cocinero') return '/cocinero';
  return '/dashboard'; // admin | gerente
}

// ── Guards ────────────────────────────────────────────────
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const home = useHomeRoute();
  if (isLoading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to={home} replace />;
  return <>{children}</>;
}

function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isSuperAdmin, isLoading } = useAuthStore();
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated || !isSuperAdmin) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/** Only allows roles in the given allow-list */
function RoleRoute({ children, allow }: { children: React.ReactNode; allow: string[] }) {
  const { usuario } = useAuthStore();
  const home = useHomeRoute();
  if (!usuario || !allow.includes(usuario.rol)) return <Navigate to={home} replace />;
  return <>{children}</>;
}

function AppContent() {
  const { checkAuth } = useAuthStore();
  const { theme } = useUIStore();

  useEffect(() => { checkAuth(); }, [checkAuth]);
  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); }, [theme]);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Public ─────────────────────────────────── */}
        <Route path="/" element={<GuestRoute><LandingPage /></GuestRoute>} />
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/registro" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/recuperar-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />

        {/* ── Admin del restaurante ──────────────────── */}
        <Route element={<ProtectedRoute><RoleRoute allow={['admin', 'gerente']}><MainLayout /></RoleRoute></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/ordenes" element={<OrdenesPage />} />
          <Route path="/cocina" element={<CocinaPage />} />
          <Route path="/mesas" element={<MesasPage />} />
          <Route path="/caja" element={<CajaPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/reservas" element={<ReservasPage />} />
          <Route path="/delivery" element={<DeliveryPage />} />
          <Route path="/locales" element={<LocalesPage />} />
          <Route path="/reportes" element={<ReportesPage />} />
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/configuracion" element={<ConfiguracionPage />} />
          <Route path="/perfil" element={<PerfilPage />} />
        </Route>

        {/* ── Mesero ─────────────────────────────────── */}
        <Route element={<ProtectedRoute><RoleRoute allow={['mesero']}><MainLayout /></RoleRoute></ProtectedRoute>}>
          <Route path="/mesero" element={<MeseroDashboard />} />
          <Route path="/mesero/ordenes" element={<OrdenesPage />} />
          <Route path="/mesero/mesas" element={<MesasPage />} />
          <Route path="/mesero/clientes" element={<ClientesPage />} />
          <Route path="/mesero/reservas" element={<ReservasPage />} />
          <Route path="/mesero/menu" element={<MenuPage />} />
          <Route path="/mesero/perfil" element={<PerfilPage />} />
        </Route>

        {/* ── Cocinero ───────────────────────────────── */}
        <Route element={<ProtectedRoute><RoleRoute allow={['cocinero']}><MainLayout /></RoleRoute></ProtectedRoute>}>
          <Route path="/cocinero" element={<CocineroDashboard />} />
          <Route path="/cocinero/ordenes" element={<CocinaPage />} />
          <Route path="/cocinero/menu" element={<MenuPage />} />
          <Route path="/cocinero/perfil" element={<PerfilPage />} />
        </Route>

        {/* ── SuperAdmin ─────────────────────────────── */}
        <Route element={<SuperAdminRoute><MainLayout /></SuperAdminRoute>}>
          <Route path="/superadmin" element={<SuperAdminDashboard />} />
          <Route path="/superadmin/tenants" element={<SuperAdminTenantsPage />} />
          <Route path="/superadmin/planes" element={<SuperAdminPlanesPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            className: '!rounded-xl !bg-white !shadow-lg !border !border-slate-200 dark:!bg-slate-800 dark:!border-slate-700 !text-slate-700 dark:!text-slate-200',
            duration: 3000,
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
