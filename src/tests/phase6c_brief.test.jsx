import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BriefOverlay from '../components/phase6_admin/BriefOverlay';

const mockPatterns = [
  { id: 'p1', name: 'Pattern 1', counter: 0, stage: 'monitoring', anchors: ['a1', 'a2', 'a3', 'a4'], nudges: {n1:'x', n2:'y', n3:'z'} },
  { id: 'p2', name: 'Pattern 2', counter: 1, stage: 'monitoring', anchors: ['b1'], matchedPrompts: ['hello b1 world'], nudges: {n1:'x', n2:'y', n3:'z'} },
  { id: 'p3', name: 'Pattern 3', counter: 3, stage: 'nudge-ready', anchors: ['c1'], nudges: {n1:'x', n2:'y', n3:'z'} },
  { id: 'p4', name: 'Pattern 4', counter: 3, stage: 'activated', anchors: ['d1'], nudges: {n1:'x', n2:'y', n3:'z'} },
  ...Array(6).fill().map((_, i) => ({ id: `px${i}`, name: `Px ${i}`, counter: 0, stage: 'monitoring', anchors: [], nudges: {n1:'x', n2:'y', n3:'z'} }))
];

const mockStats = { promptsSent: 42, skillsCreated: 3 };

describe('Phase 6C — BriefOverlay', () => {
  it('BriefOverlay renders all 10 pattern cards', () => {
    render(
      <BriefOverlay
        briefOpen={true}
        setBriefOpen={() => {}}
        patterns={mockPatterns}
        sessionStats={mockStats}
      />
    );
    const cards = screen.getAllByTestId(/brief-pattern-/);
    expect(cards).toHaveLength(10);
  });

  it('BriefOverlay shows session stats', () => {
    render(
      <BriefOverlay
        briefOpen={true}
        setBriefOpen={() => {}}
        patterns={mockPatterns}
        sessionStats={mockStats}
      />
    );
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('Pattern card shows "No activity" when counter is 0', () => {
    render(
      <BriefOverlay
        briefOpen={true}
        setBriefOpen={() => {}}
        patterns={mockPatterns}
        sessionStats={mockStats}
      />
    );
    const noActivityNodes = screen.getAllByTestId('brief-no-activity');
    expect(noActivityNodes.length).toBeGreaterThan(0);
    expect(noActivityNodes[0]).toHaveTextContent('No activity this session');
  });

  it('Pattern card shows matched prompts without string quotes', () => {
    render(
      <BriefOverlay
        briefOpen={true}
        setBriefOpen={() => {}}
        patterns={mockPatterns}
        sessionStats={mockStats}
      />
    );
    const matchBlocks = screen.getAllByTestId('brief-matched-prompt');
    expect(matchBlocks[0]).toHaveTextContent('hello b1 world');
    expect(matchBlocks[0]).not.toHaveTextContent('"hello b1 world"');
  });

  it('Pattern card is clickable and opens modal locally instead of closing overlay', () => {
    const setBriefOpenSpy = vi.fn();
    
    render(
      <BriefOverlay
        briefOpen={true}
        setBriefOpen={setBriefOpenSpy}
        patterns={mockPatterns}
        sessionStats={mockStats}
      />
    );
    
    const card = screen.getByTestId('brief-pattern-p1');
    fireEvent.click(card);
    
    // The overlay should NOT close
    expect(setBriefOpenSpy).not.toHaveBeenCalled();
    // Instead the modal should appear within the DOM rendering the pattern details
    expect(screen.getByText('Why Skill Sense tracks this')).toBeInTheDocument();
  });

  it('Close button calls onClose (setBriefOpen)', () => {
    const setBriefOpenSpy = vi.fn();
    render(
      <BriefOverlay
        briefOpen={true}
        setBriefOpen={setBriefOpenSpy}
        patterns={mockPatterns}
        sessionStats={mockStats}
      />
    );
    fireEvent.click(screen.getByTestId('close-brief-btn'));
    expect(setBriefOpenSpy).toHaveBeenCalledWith(false);
  });

  it('Footer disclaimer renders', () => {
    render(
      <BriefOverlay
        briefOpen={true}
        setBriefOpen={() => {}}
        patterns={mockPatterns}
        sessionStats={mockStats}
      />
    );
    expect(screen.getByTestId('brief-footer')).toBeInTheDocument();
  });
});
