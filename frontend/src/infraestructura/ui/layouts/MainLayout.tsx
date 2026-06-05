import { Outlet } from 'react-router-dom';
import { cn } from '@/compartidos/utilidades';
import { useUIStore } from '@/infraestructura/store/useUIStore';
import Sidebar from './Sidebar';
import Header from './Header';
import OrderRealtimeBridge from './OrderRealtimeBridge';

// ═══════════════════════════════════════════════════════════
// MainLayout — sidebar + header + contenido principal
// ═══════════════════════════════════════════════════════════

export default function MainLayout() {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Skip link for keyboard/screen reader accessibility (WCAG 2.4.1) */}
      <a href="#main-content" className="skip-link">
        Ir al contenido principal
      </a>
      <Sidebar />
      <div
        className={cn(
          'transition-all duration-300',
          sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64',
        )}
      >
        <OrderRealtimeBridge />
        <Header />
        <main id="main-content" className="p-4 lg:p-6" role="main">
          <div className="mx-auto max-w-7xl page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
