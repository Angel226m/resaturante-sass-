/**
 * E2E (simulado): flujo completo de autenticación
 *
 * Simula el comportamiento del usuario final:
 * 1. Ve la pantalla de login
 * 2. Hace clic en una cuenta demo → store se actualiza → navega
 * 3. Abre el formulario manual → llena campos → envía → navega
 * 4. Errores del servidor se muestran en toast
 *
 * Usa MemoryRouter + mocks de store/navigate para correr en jsdom.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '@/infraestructura/ui/paginas/auth/LoginPage';

// ── vi.hoisted: fns disponibles antes de vi.mock ──────────────────────────────
const { loginFn, loginSuperAdminFn, navigateFn, setLocalFn, toastSuccessFn, toastErrorFn } =
  vi.hoisted(() => ({
    loginFn: vi.fn().mockResolvedValue(undefined),
    loginSuperAdminFn: vi.fn().mockResolvedValue(undefined),
    navigateFn: vi.fn(),
    setLocalFn: vi.fn(),
    toastSuccessFn: vi.fn(),
    toastErrorFn: vi.fn(),
  }));

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@/infraestructura/store/useAuthStore', () => {
  const useAuthStore = vi.fn(() => ({
    login: loginFn,
    loginSuperAdmin: loginSuperAdminFn,
  }));
  (useAuthStore as any).getState = vi.fn(() => ({ usuario: { rol: 'admin' } }));
  return { useAuthStore };
});

vi.mock('@/infraestructura/store/useUIStore', () => ({
  useUIStore: vi.fn(() => ({ setLocalSeleccionado: setLocalFn })),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => navigateFn };
});

vi.mock('react-hot-toast', () => ({
  default: { success: toastSuccessFn, error: toastErrorFn },
}));

// ── Helper ───────────────────────────────────────────────────────────────────
function renderLogin() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

beforeEach(async () => {
  loginFn.mockResolvedValue(undefined);
  loginSuperAdminFn.mockResolvedValue(undefined);
  navigateFn.mockReset();
  setLocalFn.mockReset();
  toastSuccessFn.mockReset();
  toastErrorFn.mockReset();
  // Restablecer getState al valor por defecto (admin) entre tests
  const { useAuthStore } = await import('@/infraestructura/store/useAuthStore');
  vi.mocked((useAuthStore as any).getState).mockReturnValue({ usuario: { rol: 'admin' } });
});

// ═══════════════════════════════════════════════════════════
// Flujo 1: Login demo — Admin Restaurante
// ═══════════════════════════════════════════════════════════

describe('E2E — flujo login demo admin', () => {
  it('el usuario ve las tarjetas demo al cargar', () => {
    renderLogin();
    expect(screen.getByText('Admin Restaurante')).toBeInTheDocument();
    expect(screen.getByText('Mesero')).toBeInTheDocument();
    expect(screen.getByText('Cocinero')).toBeInTheDocument();
  });

  it('clic en Admin Restaurante → login con credenciales correctas', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByText('Admin Restaurante'));

    await waitFor(() => {
      expect(loginFn).toHaveBeenCalledWith('admin@demo.com', 'admin123', 'demo-restaurant');
    });
  });

  it('tras login admin → setLocalSeleccionado se llama', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByText('Admin Restaurante'));

    await waitFor(() => expect(setLocalFn).toHaveBeenCalledWith('demo-local-1'));
  });

  it('tras login admin → navega a /dashboard', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByText('Admin Restaurante'));

    await waitFor(() => expect(navigateFn).toHaveBeenCalledWith('/dashboard'));
  });

  it('muestra toast de bienvenida para admin', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByText('Admin Restaurante'));

    await waitFor(() => expect(toastSuccessFn).toHaveBeenCalled());
  });
});

// ═══════════════════════════════════════════════════════════
// Flujo 2: Login demo — Mesero y Cocinero
// ═══════════════════════════════════════════════════════════

describe('E2E — flujo login demo roles', () => {
  it('Mesero → navega a /mesero', async () => {
    // getState devuelve rol mesero para este test
    const { useAuthStore } = await import('@/infraestructura/store/useAuthStore');
    vi.mocked((useAuthStore as any).getState).mockReturnValue({ usuario: { rol: 'mesero' } });

    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByText('Mesero'));

    await waitFor(() => {
      expect(loginFn).toHaveBeenCalledWith('mesero@demo.com', 'mesero123', 'demo-restaurant');
      expect(navigateFn).toHaveBeenCalledWith('/mesero');
    });
  });

  it('Cocinero → navega a /cocinero', async () => {
    const { useAuthStore } = await import('@/infraestructura/store/useAuthStore');
    vi.mocked((useAuthStore as any).getState).mockReturnValue({ usuario: { rol: 'cocinero' } });

    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByText('Cocinero'));

    await waitFor(() => {
      expect(loginFn).toHaveBeenCalledWith('cocinero@demo.com', 'cocinero123', 'demo-restaurant');
      expect(navigateFn).toHaveBeenCalledWith('/cocinero');
    });
  });

  it('Super Admin → llama loginSuperAdmin y navega a /superadmin', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByText(/Super Admin/i));

    await waitFor(() => {
      expect(loginSuperAdminFn).toHaveBeenCalledWith(
        'superadmin@restauflow.com',
        'superadmin123',
      );
      expect(navigateFn).toHaveBeenCalledWith('/superadmin');
    });
  });
});

// ═══════════════════════════════════════════════════════════
// Flujo 3: Formulario manual de credenciales
// ═══════════════════════════════════════════════════════════

describe('E2E — flujo formulario de credenciales', () => {
  async function abrirFormulario() {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByText('Iniciar sesión con credenciales'));
    return user;
  }

  it('el formulario aparece al hacer clic en el botón', async () => {
    await abrirFormulario();
    expect(screen.getByPlaceholderText('mi-restaurante')).toBeInTheDocument();
  });

  it('el botón Volver regresa a la vista de tarjetas', async () => {
    const user = await abrirFormulario();
    await user.click(screen.getByText(/Volver a cuentas demo/i));
    expect(screen.getByText('Admin Restaurante')).toBeInTheDocument();
  });

  it('envío del formulario con credenciales válidas llama a login', async () => {
    const user = await abrirFormulario();

    await user.type(screen.getByPlaceholderText('mi-restaurante'), 'mi-rest');
    await user.type(screen.getByPlaceholderText('tu@email.com'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123');
    await user.click(screen.getByRole('button', { name: /Iniciar sesión/i }));

    await waitFor(() => {
      expect(loginFn).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
        'mi-rest',
        false,
      );
    });
  });

  it('navega a /dashboard tras envío exitoso (rol admin)', async () => {
    const user = await abrirFormulario();

    await user.type(screen.getByPlaceholderText('mi-restaurante'), 'mi-rest');
    await user.type(screen.getByPlaceholderText('tu@email.com'), 'admin@test.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'pass123');
    await user.click(screen.getByRole('button', { name: /Iniciar sesión/i }));

    await waitFor(() => expect(navigateFn).toHaveBeenCalledWith('/dashboard'));
  });

  it('muestra toast de error cuando login falla', async () => {
    loginFn.mockRejectedValue({ response: { data: { mensaje: 'Credenciales inválidas' } } });

    const user = await abrirFormulario();

    await user.type(screen.getByPlaceholderText('mi-restaurante'), 'mi-rest');
    await user.type(screen.getByPlaceholderText('tu@email.com'), 'wrong@test.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /Iniciar sesión/i }));

    await waitFor(() =>
      expect(toastErrorFn).toHaveBeenCalledWith('Credenciales inválidas'),
    );
    expect(navigateFn).not.toHaveBeenCalled();
  });

  it('slug "superadmin" llama a loginSuperAdmin en el formulario', async () => {
    const user = await abrirFormulario();

    await user.type(screen.getByPlaceholderText('mi-restaurante'), 'superadmin');
    await user.type(screen.getByPlaceholderText('tu@email.com'), 'sa@restauflow.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'admin123');
    await user.click(screen.getByRole('button', { name: /Iniciar sesión/i }));

    await waitFor(() => {
      expect(loginSuperAdminFn).toHaveBeenCalledWith('sa@restauflow.com', 'admin123');
      expect(navigateFn).toHaveBeenCalledWith('/superadmin');
    });
  });
});

// ═══════════════════════════════════════════════════════════
// Flujo 4: Visibilidad de contraseña
// ═══════════════════════════════════════════════════════════

describe('E2E — toggle contraseña', () => {
  it('el input de contraseña es type=password por defecto', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByText('Iniciar sesión con credenciales'));
    const input = screen.getByPlaceholderText('••••••••');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('clic en el ojo cambia a type=text', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByText('Iniciar sesión con credenciales'));

    // El botón de toggle de contraseña está junto al input
    const toggleBtn = screen.getByRole('button', { name: '' });
    // Filtramos por el que está dentro del grupo del password
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const togglePasswordBtn = passwordInput.parentElement?.querySelector('button');
    if (togglePasswordBtn) {
      await user.click(togglePasswordBtn);
      expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });
});
