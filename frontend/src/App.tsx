import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/infraestructura/store/useAuthStore';
import { useUIStore } from '@/infraestructura/store/useUIStore';
import { PageLoader } from '@/infraestructura/ui/componentes/comunes/LoadingSpinner';
import MainLayout from '@/infraestructura/ui/layouts/MainLayout';

// App routes, providers and lazy-loaded pages

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
  },
});

function lazyPage<TModule extends { default: React.ComponentType<any> }>(
  importer: () => Promise<TModule>,
  id: string,
) {
  return lazy(async () => {
    const reloadKey = `lazy-reload:${id}`;

    try {
      const module = await importer();
      sessionStorage.removeItem(reloadKey);
      return module;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error ?? '');
      const isChunkLoadError =
        message.includes('Failed to fetch dynamically imported module') ||
        message.includes('Importing a module script failed') ||
        message.includes('ChunkLoadError');

      if (isChunkLoadError && !sessionStorage.getItem(reloadKey)) {
        sessionStorage.setItem(reloadKey, '1');
        window.location.reload();
      }

      throw error;
    }
  });
}

// Lazy pages
const LandingPage = lazyPage(() => import('@/infraestructura/ui/paginas/LandingPage'), 'LandingPage');
const LoginPage = lazyPage(() => import('@/infraestructura/ui/paginas/auth/LoginPage'), 'LoginPage');
const RegisterPage = lazyPage(() => import('@/infraestructura/ui/paginas/auth/RegisterPage'), 'RegisterPage');
const ForgotPasswordPage = lazyPage(() => import('@/infraestructura/ui/paginas/auth/ForgotPasswordPage'), 'ForgotPasswordPage');

// Admin
const DashboardPage = lazyPage(() => import('@/infraestructura/ui/paginas/DashboardPage'), 'DashboardPage');
const MenuPage = lazyPage(() => import('@/infraestructura/ui/paginas/menu/MenuPage'), 'MenuPage');
const OrdenesPage = lazyPage(() => import('@/infraestructura/ui/paginas/ordenes/OrdenesPage'), 'OrdenesPage');
const CocinaPage = lazyPage(() => import('@/infraestructura/ui/paginas/ordenes/CocinaPage'), 'CocinaPage');
const MesasPage = lazyPage(() => import('@/infraestructura/ui/paginas/mesas/MesasPage'), 'MesasPage');
const CajaPage = lazyPage(() => import('@/infraestructura/ui/paginas/caja/CajaPage'), 'CajaPage');
const ClientesPage = lazyPage(() => import('@/infraestructura/ui/paginas/clientes/ClientesPage'), 'ClientesPage');
const ReservasPage = lazyPage(() => import('@/infraestructura/ui/paginas/reservas/ReservasPage'), 'ReservasPage');
const DeliveryPage = lazyPage(() => import('@/infraestructura/ui/paginas/delivery/DeliveryPage'), 'DeliveryPage');
const LocalesPage = lazyPage(() => import('@/infraestructura/ui/paginas/locales/LocalesPage'), 'LocalesPage');
const ReportesPage = lazyPage(() => import('@/infraestructura/ui/paginas/reportes/ReportesPage'), 'ReportesPage');
const UsuariosPage = lazyPage(() => import('@/infraestructura/ui/paginas/usuarios/UsuariosPage'), 'UsuariosPage');
const ConfiguracionPage = lazyPage(() => import('@/infraestructura/ui/paginas/configuracion/ConfiguracionPage'), 'ConfiguracionPage');

// Shared
const PerfilPage = lazyPage(() => import('@/infraestructura/ui/paginas/perfil/PerfilPage'), 'PerfilPage');

// Mesero
const MeseroDashboard = lazyPage(() => import('@/infraestructura/ui/paginas/mesero/MeseroDashboard'), 'MeseroDashboard');

// Cocinero
const CocineroDashboard = lazyPage(() => import('@/infraestructura/ui/paginas/cocinero/CocineroDashboard'), 'CocineroDashboard');

// SuperAdmin
const SuperAdminDashboard = lazyPage(() => import('@/infraestructura/ui/paginas/superadmin/SuperAdminDashboard'), 'SuperAdminDashboard');
const SuperAdminTenantsPage = lazyPage(() => import('@/infraestructura/ui/paginas/superadmin/TenantsPage'), 'SuperAdminTenantsPage');
const SuperAdminPlanesPage = lazyPage(() => import('@/infraestructura/ui/paginas/superadmin/PlanesPage'), 'SuperAdminPlanesPage');

// Helpers
/** Returns the home path for the current user's role */
function useHomeRoute(): string {
  const { isSuperAdmin, usuario } = useAuthStore();
  if (isSuperAdmin) return '/superadmin';
  const rol = usuario?.rol;
  if (rol === 'mesero') return '/mesero';
  if (rol === 'cocinero') return '/cocinero';
  if (rol === 'cajero') return '/caja';
  if (rol === 'repartidor') return '/delivery';
  if (rol === 'almacen') return '/menu';
  if (rol === 'admin' || rol === 'gerente') return '/dashboard';
  return '/login';
}

// Guards
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
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
  }, [theme]);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<GuestRoute><LandingPage /></GuestRoute>} />
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/registro" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/recuperar-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />

        {/* Admin del restaurante */}
        <Route element={<ProtectedRoute><RoleRoute allow={['admin', 'gerente', 'cajero', 'repartidor', 'almacen']}><MainLayout /></RoleRoute></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/menu" element={<RoleRoute allow={['admin', 'gerente', 'almacen']}><MenuPage /></RoleRoute>} />
          <Route path="/ordenes" element={<OrdenesPage />} />
          <Route path="/cocina" element={<CocinaPage />} />
          <Route path="/mesas" element={<MesasPage />} />
          <Route path="/caja" element={<RoleRoute allow={['admin', 'gerente', 'cajero']}><CajaPage /></RoleRoute>} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/reservas" element={<ReservasPage />} />
          <Route path="/delivery" element={<RoleRoute allow={['admin', 'gerente', 'repartidor']}><DeliveryPage /></RoleRoute>} />
          <Route path="/locales" element={<LocalesPage />} />
          <Route path="/reportes" element={<ReportesPage />} />
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/configuracion" element={<ConfiguracionPage />} />
          <Route path="/perfil" element={<PerfilPage />} />
        </Route>

        {/* Mesero */}
        <Route element={<ProtectedRoute><RoleRoute allow={['mesero']}><MainLayout /></RoleRoute></ProtectedRoute>}>
          <Route path="/mesero" element={<MeseroDashboard />} />
          <Route path="/mesero/ordenes" element={<OrdenesPage />} />
          <Route path="/mesero/mesas" element={<MesasPage />} />
          <Route path="/mesero/clientes" element={<ClientesPage />} />
          <Route path="/mesero/reservas" element={<ReservasPage />} />
          <Route path="/mesero/menu" element={<Navigate to="/mesero" replace />} />
          <Route path="/mesero/perfil" element={<PerfilPage />} />
        </Route>

        {/* Cocinero */}
        <Route element={<ProtectedRoute><RoleRoute allow={['cocinero']}><MainLayout /></RoleRoute></ProtectedRoute>}>
          <Route path="/cocinero" element={<CocineroDashboard />} />
          <Route path="/cocinero/ordenes" element={<CocinaPage />} />
          <Route path="/cocinero/menu" element={<MenuPage />} />
          <Route path="/cocinero/perfil" element={<PerfilPage />} />
        </Route>

        {/* SuperAdmin */}
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
            className: '!rounded-xl !bg-white !shadow-lg !border !border-slate-200 !text-slate-700',
            duration: 3000,
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

