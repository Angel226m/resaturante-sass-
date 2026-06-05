import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DollarSign } from 'lucide-react';
import StatCard from '@/infraestructura/ui/componentes/comunes/StatCard';

// ═══════════════════════════════════════════════════════════
// Unit tests: StatCard component
// ═══════════════════════════════════════════════════════════

describe('StatCard — render básico', () => {
  it('muestra el título', () => {
    render(<StatCard title="Ventas hoy" value={0} icon={<span />} />);
    expect(screen.getByText('Ventas hoy')).toBeInTheDocument();
  });

  it('muestra el valor numérico', () => {
    render(<StatCard title="T" value={1234} icon={<span />} />);
    expect(screen.getByText('1234')).toBeInTheDocument();
  });

  it('muestra el valor como string', () => {
    render(<StatCard title="T" value="S/. 2,500.00" icon={<span />} />);
    expect(screen.getByText('S/. 2,500.00')).toBeInTheDocument();
  });

  it('renderiza el icono que se pasa', () => {
    render(<StatCard title="T" value={0} icon={<span data-testid="icono-stat" />} />);
    expect(screen.getByTestId('icono-stat')).toBeInTheDocument();
  });

  it('aplica className adicional', () => {
    const { container } = render(
      <StatCard title="T" value={0} icon={<span />} className="mi-card" />,
    );
    expect(container.firstChild).toHaveClass('mi-card');
  });
});

describe('StatCard — trend positivo', () => {
  it('muestra el porcentaje de trend', () => {
    render(<StatCard title="T" value={0} icon={<span />} trend={12.5} />);
    expect(screen.getByText(/12.5/)).toBeInTheDocument();
  });

  it('trend positivo tiene signo +', () => {
    render(<StatCard title="T" value={0} icon={<span />} trend={8} />);
    expect(screen.getByText(/\+8/)).toBeInTheDocument();
  });

  it('trend positivo tiene clases emerald (verde)', () => {
    const { container } = render(<StatCard title="T" value={0} icon={<span />} trend={5} />);
    const trendEl = container.querySelector('[class*="emerald"]');
    expect(trendEl).toBeTruthy();
  });
});

describe('StatCard — trend negativo', () => {
  it('trend negativo tiene clases red', () => {
    const { container } = render(<StatCard title="T" value={0} icon={<span />} trend={-10} />);
    const trendEl = container.querySelector('[class*="red"]');
    expect(trendEl).toBeTruthy();
  });

  it('muestra el valor negativo sin signo extra', () => {
    render(<StatCard title="T" value={0} icon={<span />} trend={-15} />);
    expect(screen.getByText(/-15/)).toBeInTheDocument();
  });

  it('trend = 0 se considera positivo (emerald)', () => {
    const { container } = render(<StatCard title="T" value={0} icon={<span />} trend={0} />);
    const trendEl = container.querySelector('[class*="emerald"]');
    expect(trendEl).toBeTruthy();
  });
});

describe('StatCard — trendLabel', () => {
  it('muestra trendLabel cuando se pasa', () => {
    render(<StatCard title="T" value={0} icon={<span />} trend={5} trendLabel="vs. ayer" />);
    expect(screen.getByText('vs. ayer')).toBeInTheDocument();
  });

  it('no muestra trendLabel cuando no se pasa', () => {
    const { queryByText } = render(<StatCard title="T" value={0} icon={<span />} trend={5} />);
    expect(queryByText('vs. ayer')).toBeNull();
  });

  it('no muestra sección trend si la prop no se pasa', () => {
    render(<StatCard title="T" value={42} icon={<DollarSign size={20} />} />);
    // No debe haber icono de tendencia
    expect(screen.queryByRole('img')).toBeNull(); // svg icons don't have role=img by default
  });
});

describe('StatCard — colores', () => {
  const colores = ['teal', 'emerald', 'blue', 'amber', 'red', 'purple'] as const;

  colores.forEach(color => {
    it(`color "${color}" renderiza correctamente`, () => {
      const { container } = render(
        <StatCard title={color} value={0} icon={<span data-testid={`icon-${color}`} />} color={color} />,
      );
      expect(screen.getByTestId(`icon-${color}`)).toBeInTheDocument();
      // El contenedor del icono tiene una clase del color
      const iconWrapper = container.querySelector(`[class*="${color}"]`);
      expect(iconWrapper).toBeTruthy();
    });
  });
});
