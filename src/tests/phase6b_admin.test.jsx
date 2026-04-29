import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdminPanel from '../components/phase6_admin/AdminPanel';
import PatternCard from '../components/phase6_admin/PatternCard';

import EventLog from '../components/phase6_admin/EventLog';
import PatternDetailModal from '../components/phase6_admin/PatternDetailModal';

const mockPatterns = [
  { id: 'p1', name: 'Pattern 1', counter: 0, stage: 'monitoring', anchors: ['a1', 'a2', 'a3', 'a4'], nudges: { n1:'N1', n2:'N2', n3:'N3' }, why: 'Why 1', examples: ['Ex 1'], matchedPrompts: [] },
  { id: 'p2', name: 'Pattern 2', counter: 1, stage: 'monitoring', anchors: ['b1'], nudges: { n1:'N1', n2:'N2', n3:'N3' }, why: 'Why 2', examples: ['Ex 2'], matchedPrompts: ['matched b1 text'] },
  { id: 'p3', name: 'Pattern 3', counter: 3, stage: 'nudge-ready', anchors: ['c1'], nudges: { n1:'N1', n2:'N2', n3:'N3' }, why: 'Why 3', examples: ['Ex 3'], matchedPrompts: ['matched c1 text'] },
  { id: 'p4', name: 'Pattern 4', counter: 3, stage: 'activated', anchors: ['d1'], nudges: { n1:'N1', n2:'N2', n3:'N3' }, why: 'Why 4', examples: ['Ex 4'], matchedPrompts: ['matched d1 text'] },
  ...Array(6).fill().map((_, i) => ({ id: `px${i}`, name: `Px ${i}`, counter: 0, stage: 'monitoring', anchors: [], nudges: { n1:'N1', n2:'N2', n3:'N3' }, why: 'Why', examples: [], matchedPrompts: [] }))
];

describe('Phase 6B-1 — Admin Panel and Pattern Cards', () => {
  it('AdminPanel renders with 10 PatternCards', () => {
    render(<AdminPanel patterns={mockPatterns} />);
    const cards = screen.getAllByTestId(/pattern-card-/);
    expect(cards).toHaveLength(10);
  });

  it('SessionStats shows correct promptsSent count', () => {
    render(<AdminPanel patterns={mockPatterns} promptsSent={42} skillsCreated={5} />);
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Prompts Sent')).toBeInTheDocument();
  });

  it('SessionStats always shows 10 for patterns tracked', () => {
    render(<AdminPanel patterns={mockPatterns} promptsSent={42} skillsCreated={5} />);
    expect(screen.getAllByText('10')[0]).toBeInTheDocument();
    expect(screen.getByText('Patterns Tracked')).toBeInTheDocument();
  });
  
  it('PatternCard renders monitoring stage badge correctly', () => {
    render(<PatternCard pattern={mockPatterns[0]} onClick={() => {}} />);
    const badge = screen.getByTestId('badge-monitoring');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('monitoring');
  });

  it('PatternCard renders nudge-ready badge with orange color', () => {
    render(<PatternCard pattern={mockPatterns[2]} onClick={() => {}} />);
    const badge = screen.getByTestId('badge-nudge-ready');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveStyle('color: #CF643F');
  });

  it('PatternCard renders activated badge with green color', () => {
    render(<PatternCard pattern={mockPatterns[3]} onClick={() => {}} />);
    const badge = screen.getByTestId('badge-activated');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveStyle('color: #4CAF50');
  });

  it('PatternCard confidence bar is empty at counter 0', () => {
    render(<PatternCard pattern={mockPatterns[0]} onClick={() => {}} />);
    const bar = screen.getByTestId('confidence-bar-fill');
    expect(bar).toHaveStyle('width: 0%');
  });

  it('PatternCard confidence bar shows at counter 1', () => {
    render(<PatternCard pattern={mockPatterns[1]} onClick={() => {}} />);
    const bar = screen.getByTestId('confidence-bar-fill');
    expect(bar.style.width).not.toBe('0%');
  });

  it('PatternCard shows signal tags when counter > 0', () => {
    render(<PatternCard pattern={mockPatterns[1]} onClick={() => {}} />);
    const tags = screen.getAllByTestId('signal-tag');
    expect(tags.length).toBeGreaterThan(0);
  });

  it('PatternCard onClick fires correctly', () => {
    const clickSpy = vi.fn();
    render(<PatternCard pattern={mockPatterns[0]} onClick={clickSpy} />);
    fireEvent.click(screen.getByTestId('pattern-card-p1'));
    expect(clickSpy).toHaveBeenCalledWith(mockPatterns[0]);
  });

  it('Reviewer disclaimer renders in AdminPanel', () => {
    render(<AdminPanel patterns={mockPatterns} />);
    expect(screen.getByTestId('reviewer-disclaimer')).toBeInTheDocument();
  });

  it('View in Detail button exists', () => {
    render(<AdminPanel patterns={mockPatterns} />);
    expect(screen.getByTestId('view-in-detail-btn')).toBeInTheDocument();
  });
});

describe('Phase 6B-2 — PatternDetailModal and EventLog', () => {
  it('PatternDetailModal renders with pattern name', () => {
    render(<PatternDetailModal pattern={mockPatterns[0]} onClose={() => {}} />);
    expect(screen.getByText('Pattern 1')).toBeInTheDocument();
  });

  it('PatternDetailModal shows "No matches detected yet" when counter is 0', () => {
    render(<PatternDetailModal pattern={mockPatterns[0]} onClose={() => {}} />);
    expect(screen.getByText('No matches detected yet in this session')).toBeInTheDocument();
  });

  it('PatternDetailModal shows matched prompts when counter > 0', () => {
    render(<PatternDetailModal pattern={mockPatterns[1]} onClose={() => {}} />);
    expect(screen.getByText('matched b1 text')).toBeInTheDocument();
  });

  it('Matched anchor pills render in orange and unmatched in gray', () => {
    render(<PatternDetailModal pattern={mockPatterns[1]} onClose={() => {}} />);
    const pills = screen.getAllByTestId('anchor-pill');
    // For p2, matchedPrompts includes 'b1', which matches anchor 'b1'
    expect(pills[0]).toHaveStyle('background: rgba(207, 100, 63, 0.1)'); // React normalizes spaces in rgba
  });

  it('Unmatched anchor pills render in gray', () => {
    render(<PatternDetailModal pattern={mockPatterns[0]} onClose={() => {}} />);
    const pills = screen.getAllByTestId('anchor-pill');
    // None matched
    expect(pills[0]).toHaveStyle('background: rgb(26, 26, 26)'); // React converts #1a1a1a to rgb
  });

  it('EventLog does not render when eventLog is empty', () => {
    const { container } = render(<EventLog eventLog={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('EventLog renders correct number of events', () => {
    const events = [
      { time: Date.now(), type: 'threshold', text: 'ev1' },
      { time: Date.now(), type: 'nudge', text: 'ev2' }
    ];
    render(<EventLog eventLog={events} />);
    expect(screen.getByText('ev1')).toBeInTheDocument();
    expect(screen.getByText('ev2')).toBeInTheDocument();
  });

  it('EventLog shows max 10 events', () => {
    const events = Array(15).fill().map((_, i) => ({
      time: Date.now(), type: 'threshold', text: `event ${i}`
    }));
    render(<EventLog eventLog={events} />);
    expect(screen.queryByText('event 0')).not.toBeInTheDocument();
    expect(screen.queryByText('event 4')).not.toBeInTheDocument();
    expect(screen.getByText('event 5')).toBeInTheDocument();
    expect(screen.getByText('event 14')).toBeInTheDocument();
  });
});
