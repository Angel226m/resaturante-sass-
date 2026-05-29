import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from '@/infraestructura/ui/componentes/comunes/Badge';

// ═══════════════════════════════════════════════════════════
// Unit tests: Badge component
// ═══════════════════════════════════════════════════════════

describe('Badge — render', () => {
  it('muestra el texto hijo', () => {
    render(<Badge>Activo</Badge>);
    expect(screen.getByText('Activo')).toBeInTheDocument();
  });

  it('por defecto usa variante default', () => {
    const { container } = render(<Badge>Test</Badge>);
    const span = container.querySelector('span')!;
    expect(span.className).toMatch(/slate/);
  });

  it('acepta className adicional', () => {
    const { container } = render(<Badge className="mi-clase">X</Badge>);
    expect(container.querySelector('span')!.className).toMatch(/mi-clase/);
  });
});

describe('Badge — variantes de color', () => {
  it('success tiene clases emerald', () => {
    const { container } = render(<Badge variant="success">OK</Badge>);
    expect(container.querySelector('span')!.className).toMatch(/emerald/);
  });

  it('warning tiene clases amber', () => {
    const { container } = render(<Badge variant="warning">Atención</Badge>);
    expect(container.querySelector('span')!.className).toMatch(/amber/);
  });

  it('danger tiene clases red', () => {
    const { container } = render(<Badge variant="danger">Error</Badge>);
    expect(container.querySelector('span')!.className).toMatch(/red/);
  });

  it('info tiene clases blue', () => {
    const { container } = render(<Badge variant="info">Info</Badge>);
    expect(container.querySelector('span')!.className).toMatch(/blue/);
  });

  it('teal tiene clases teal', () => {
    const { container } = render(<Badge variant="teal">Teal</Badge>);
    expect(container.querySelector('span')!.className).toMatch(/teal/);
  });
});

describe('Badge — dot', () => {
  it('sin dot no renderiza el span interior del dot', () => {
    const { container } = render(<Badge>Sin dot</Badge>);
    // Sólo el span raíz, sin hijos span de punto
    const innerSpans = container.querySelector('span')!.querySelectorAll('span');
    expect(innerSpans.length).toBe(0);
  });

  it('con dot=true renderiza el span del punto', () => {
    const { container } = render(<Badge dot>Con dot</Badge>);
    const innerSpan = container.querySelector('span span');
    expect(innerSpan).toBeTruthy();
    expect(innerSpan!.className).toMatch(/rounded-full/);
  });

  it('dot success tiene clase bg-emerald-500', () => {
    const { container } = render(<Badge dot variant="success">OK</Badge>);
    const dot = container.querySelector('span span')!;
    expect(dot.className).toMatch(/bg-emerald-500/);
  });

  it('dot warning tiene clase bg-amber-500', () => {
    const { container } = render(<Badge dot variant="warning">W</Badge>);
    expect(container.querySelector('span span')!.className).toMatch(/bg-amber-500/);
  });
});
