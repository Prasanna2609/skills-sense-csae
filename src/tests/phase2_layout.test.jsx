import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '../components/phase2_layout/Sidebar';
import App from '../App';

// ─── Mock heavy deps that aren't under test ───────────────────────────────────
vi.mock('../hooks/useGroqChat', () => ({
  useGroqChat: () => ({ messages: [], isLoading: false, sendMessage: vi.fn() }),
}));

vi.mock('../lib/groq', () => ({
  groq: {},
  GROQ_MODEL: 'llama-3.3-70b-versatile',
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────
const noop = () => {};

// ─── Phase 2 Layout Tests ─────────────────────────────────────────────────────

describe('Phase 2 — Sidebar', () => {
  test('Sidebar renders with Claude text', () => {
    render(<Sidebar adminVisible={false} toggleAdmin={noop} />);
    expect(screen.getByText('Claude')).toBeInTheDocument();
  });

  test('Skills nav item has orange styling', () => {
    render(<Sidebar adminVisible={false} toggleAdmin={noop} />);
    const skillsText = screen.getByText('Skills');
    // The parent nav row carries the orange text colour class
    expect(skillsText.closest('div')).toHaveClass('text-accent');
  });

  test('Projects nav item has reduced opacity', () => {
    render(<Sidebar adminVisible={false} toggleAdmin={noop} />);
    const projectsText = screen.getByText('Projects');
    expect(projectsText.closest('div')).toHaveClass('opacity-40');
  });

  test('Admin toggle button exists in sidebar', () => {
    render(<Sidebar adminVisible={false} toggleAdmin={noop} />);
    expect(screen.getByText('Admin View')).toBeInTheDocument();
  });
});

describe('Phase 2 — Admin Panel visibility', () => {
  test('Admin panel hidden by default', () => {
    render(<App />);
    expect(screen.queryByText('Skill Sense — Admin View')).not.toBeInTheDocument();
  });

  test('Admin panel shows when adminVisible is true', () => {
    render(<App />);
    const adminButton = screen.getByText('Admin View');
    fireEvent.click(adminButton);
    expect(screen.getByText('Skill Sense — Admin View')).toBeInTheDocument();
  });
});
