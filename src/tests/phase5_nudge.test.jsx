import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NudgeCard from '../components/phase5_nudge/NudgeCard';
import { useNudge } from '../hooks/useNudge';

// ─── Mock Groq ────────────────────────────────────────────────────────────────
vi.mock('../lib/groq', () => ({
  groq: {
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: 'Mock reply' } }],
        }),
      },
    },
  },
  GROQ_MODEL: 'llama-3.3-70b-versatile',
}));

// ─── Test fixtures ────────────────────────────────────────────────────────────
const mockPattern = {
  id: 'email-assistant',
  name: 'Email Assistant',
  domain: 'Professional communication',
  anchors: ['email', 'message', 'client', 'professional', 'formal', 'draft', 'send', 'reply', 'tone', 'outreach', 'correspondence', 'follow up', 'respond', 'prospect', 'write'],
  nudges: {
    n1: "You've been setting the same tone and format across your emails — I've noticed it 3 times now. I've drafted a Skill — Email Assistant — so you never have to re-establish that again.",
    n2: "4 email sessions with the same preferences re-explained each time — about 20 minutes of repeated setup, and roughly 350 tokens per session. Your Skill is ready and waiting.",
    n3: "5 emails, the same style correction every time. The output shifts slightly each session because the setup shifts slightly. A Skill locks in your best version — consistent every time."
  },
  counter: 3,
  stage: 'nudge-ready',
  snoozeCount: 0,
  matchedPrompts: ['draft email 1', 'draft email 2', 'draft email 3']
};

const mockSkill = {
  name: 'Email Expert',
  systemPrompt: 'You are a professional email writer.',
  references: {
    examples: '## Example 1\n**Input:** Draft\n**Output:** Dear...',
    guidelines: '## Tone\nFormal.',
    examplesEnabled: true,
    guidelinesEnabled: true
  },
  patternId: 'email-assistant',
  createdAt: Date.now(),
  source: 'csae-generated'
};

const mockNudge = {
  pattern: mockPattern,
  generatedSkill: mockSkill,
  nudgeStage: 'n1'
};

// ─────────────────────────────────────────────
// NUDGE CARD TESTS
// ─────────────────────────────────────────────
describe('Phase 5 — NudgeCard', () => {
  const defaultProps = {
    activeNudge: null,
    isPreparingNudge: false,
    onActivate: vi.fn(),
    onPreview: vi.fn(),
    onDismiss: vi.fn()
  };

  it('renders loading state when isPreparingNudge is true', () => {
    render(<NudgeCard {...defaultProps} isPreparingNudge={true} />);
    expect(screen.getByTestId('nudge-loading')).toBeInTheDocument();
    expect(screen.getByText('Skill Sense is preparing your Skill...')).toBeInTheDocument();
  });

  it('renders with activeNudge — shows skill name and nudge copy', () => {
    render(<NudgeCard {...defaultProps} activeNudge={mockNudge} />);
    expect(screen.getByTestId('nudge-card')).toBeInTheDocument();
    expect(screen.getByTestId('nudge-title').textContent).toContain('Email Expert');
  });

  it('shows n1 copy when nudgeStage is n1', () => {
    render(<NudgeCard {...defaultProps} activeNudge={mockNudge} />);
    const subtitle = screen.getByTestId('nudge-subtitle');
    expect(subtitle.textContent).toContain("I've noticed it");
  });

  it('shows n2 copy when nudgeStage is n2', () => {
    const n2Nudge = { ...mockNudge, nudgeStage: 'n2' };
    render(<NudgeCard {...defaultProps} activeNudge={n2Nudge} />);
    const subtitle = screen.getByTestId('nudge-subtitle');
    expect(subtitle.textContent).toContain('20 minutes');
  });

  it('Activate button calls onActivate', () => {
    const onActivate = vi.fn();
    render(<NudgeCard {...defaultProps} activeNudge={mockNudge} onActivate={onActivate} />);
    fireEvent.click(screen.getByTestId('nudge-activate'));
    expect(onActivate).toHaveBeenCalledOnce();
  });

  it('Preview button calls onPreview', () => {
    const onPreview = vi.fn();
    render(<NudgeCard {...defaultProps} activeNudge={mockNudge} onPreview={onPreview} />);
    fireEvent.click(screen.getByTestId('nudge-preview'));
    expect(onPreview).toHaveBeenCalledOnce();
  });

  it('Not now button calls onDismiss', () => {
    const onDismiss = vi.fn();
    render(<NudgeCard {...defaultProps} activeNudge={mockNudge} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByTestId('nudge-dismiss'));
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});

// ─────────────────────────────────────────────
// useNudge TESTS
// ─────────────────────────────────────────────
describe('Phase 5 — useNudge', () => {
  // Test harness component to exercise the hook
  function NudgeHookHarness({ patterns, activeNudge, analyzePromptRealTime }) {
    const { handleInputChange } = useNudge(patterns, activeNudge, analyzePromptRealTime);

    return (
      <div>
        <input
          data-testid="test-input"
          onChange={(e) => handleInputChange(e.target.value)}
        />
      </div>
    );
  }

  it('does not fire when no pattern is at threshold', () => {
    const patterns = [{
      id: 'email-assistant',
      counter: 1,
      stage: 'monitoring',
      anchors: ['email', 'draft']
    }];
    const analyzeFn = vi.fn();

    render(
      <NudgeHookHarness
        patterns={patterns}
        activeNudge={null}
        analyzePromptRealTime={analyzeFn}
      />
    );

    fireEvent.change(screen.getByTestId('test-input'), {
      target: { value: 'draft an email' }
    });

    // Even after debounce, should not have been called since counter < 3
    expect(analyzeFn).not.toHaveBeenCalled();
  });

  it('fires when pattern counter is at 3 and input matches', async () => {
    const patterns = [{
      id: 'email-assistant',
      name: 'Email Assistant',
      counter: 3,
      stage: 'nudge-ready',
      anchors: ['email', 'message', 'client', 'professional', 'formal', 'draft', 'send', 'reply', 'tone', 'outreach', 'correspondence', 'follow up', 'respond', 'prospect', 'write']
    }];
    const analyzeFn = vi.fn();

    render(
      <NudgeHookHarness
        patterns={patterns}
        activeNudge={null}
        analyzePromptRealTime={analyzeFn}
      />
    );

    fireEvent.change(screen.getByTestId('test-input'), {
      target: { value: 'draft a formal email to my client with professional tone' }
    });

    // Wait for debounce (600ms)
    await act(async () => {
      await new Promise((r) => setTimeout(r, 700));
    });

    expect(analyzeFn).toHaveBeenCalledOnce();
  });
});
