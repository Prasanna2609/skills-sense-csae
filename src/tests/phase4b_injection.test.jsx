import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGroqChat } from '../hooks/useGroqChat';
import { processMatch } from '../engine/nudgeManager';

// ─── Mock Groq so no real network calls happen ────────────────────────────────
vi.mock('../lib/groq', () => ({
  groq: {
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: 'Mock assistant reply' } }],
        }),
      },
    },
  },
  GROQ_MODEL: 'llama-3.3-70b-versatile',
}));

// ─── A mock generatedSkill for testing ────────────────────────────────────────
const mockSkill = {
  name: 'Email Expert',
  systemPrompt: 'You are a professional email writer. Always use formal tone.',
  references: {
    examples: '## Example 1\n**Input:** Draft email\n**Output:** Dear Sir...',
    guidelines: '## Tone\nFormal and concise.',
    examplesEnabled: true,
    guidelinesEnabled: true
  },
  patternId: 'email-assistant',
  createdAt: Date.now(),
  source: 'csae-generated'
};

// ─── Test harness that exposes all hook state ─────────────────────────────────
function ChatHookHarness() {
  const {
    messages,
    isLoading,
    activeSkill,
    skillBadge,
    sendMessage,
    activateSkill,
    updateSkillReference,
    updateSkillSystemPrompt,
    buildSystemPrompt
  } = useGroqChat();

  return (
    <div>
      <div data-testid="msg-count">{messages.length}</div>
      <div data-testid="loading">{String(isLoading)}</div>
      <div data-testid="active-skill">{activeSkill ? JSON.stringify(activeSkill) : 'null'}</div>
      <div data-testid="skill-badge">{skillBadge ? JSON.stringify(skillBadge) : 'null'}</div>
      <div data-testid="system-prompt">{buildSystemPrompt()}</div>
      <button data-testid="send-btn" onClick={() => sendMessage('hello')}>send</button>
      <button data-testid="activate-btn" onClick={() => activateSkill(mockSkill)}>activate</button>
      <button data-testid="disable-examples" onClick={() => updateSkillReference('examples', false)}>disable examples</button>
      <button data-testid="enable-examples" onClick={() => updateSkillReference('examples', true)}>enable examples</button>
      <button data-testid="disable-guidelines" onClick={() => updateSkillReference('guidelines', false)}>disable guidelines</button>
      <button data-testid="update-prompt" onClick={() => updateSkillSystemPrompt('Updated prompt text')}>update prompt</button>
      {messages.map((m, i) => (
        <div key={i} data-testid={`msg-${i}`} data-role={m.role} data-skill-active={String(!!m.skillActive)}>
          {m.content}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// SYSTEM PROMPT INJECTION TESTS
// ─────────────────────────────────────────────
describe('Phase 4B — System Prompt Injection', () => {

  describe('activateSkill', () => {
    it('sets activeSkill correctly', async () => {
      render(<ChatHookHarness />);
      expect(screen.getByTestId('active-skill').textContent).toBe('null');

      await act(async () => {
        fireEvent.click(screen.getByTestId('activate-btn'));
      });

      const activeSkill = JSON.parse(screen.getByTestId('active-skill').textContent);
      expect(activeSkill.name).toBe('Email Expert');
      expect(activeSkill.systemPrompt).toBe('You are a professional email writer. Always use formal tone.');
      expect(activeSkill.patternId).toBe('email-assistant');
    });

    it('sets skillBadge with name and patternId', async () => {
      render(<ChatHookHarness />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('activate-btn'));
      });

      const badge = JSON.parse(screen.getByTestId('skill-badge').textContent);
      expect(badge.name).toBe('Email Expert');
      expect(badge.patternId).toBe('email-assistant');
    });
  });

  describe('buildSystemPrompt', () => {
    it('returns default prompt when no skill active', () => {
      render(<ChatHookHarness />);
      expect(screen.getByTestId('system-prompt').textContent).toBe(
        'You are a helpful assistant inside Skill Sense, a Claude-like interface. Be concise and helpful.'
      );
    });

    it('returns skill systemPrompt when skill is active', async () => {
      render(<ChatHookHarness />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('activate-btn'));
      });

      const prompt = screen.getByTestId('system-prompt').textContent;
      expect(prompt).toContain('You are a professional email writer. Always use formal tone.');
    });

    it('appends examples when examplesEnabled is true', async () => {
      render(<ChatHookHarness />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('activate-btn'));
      });

      const prompt = screen.getByTestId('system-prompt').textContent;
      expect(prompt).toContain('## Reference Examples');
      expect(prompt).toContain('Dear Sir...');
    });

    it('does not append examples when examplesEnabled is false', async () => {
      render(<ChatHookHarness />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('activate-btn'));
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId('disable-examples'));
      });

      const prompt = screen.getByTestId('system-prompt').textContent;
      expect(prompt).not.toContain('## Reference Examples');
    });

    it('appends guidelines when guidelinesEnabled is true', async () => {
      render(<ChatHookHarness />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('activate-btn'));
      });

      const prompt = screen.getByTestId('system-prompt').textContent;
      expect(prompt).toContain('## Guidelines');
      expect(prompt).toContain('Formal and concise.');
    });
  });

  describe('updateSkillReference', () => {
    it('toggles examplesEnabled correctly', async () => {
      render(<ChatHookHarness />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('activate-btn'));
      });

      // Disable examples
      await act(async () => {
        fireEvent.click(screen.getByTestId('disable-examples'));
      });

      let skill = JSON.parse(screen.getByTestId('active-skill').textContent);
      expect(skill.references.examplesEnabled).toBe(false);

      // Re-enable examples
      await act(async () => {
        fireEvent.click(screen.getByTestId('enable-examples'));
      });

      skill = JSON.parse(screen.getByTestId('active-skill').textContent);
      expect(skill.references.examplesEnabled).toBe(true);
    });
  });

  describe('updateSkillSystemPrompt', () => {
    it('updates systemPrompt in activeSkill', async () => {
      render(<ChatHookHarness />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('activate-btn'));
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId('update-prompt'));
      });

      const skill = JSON.parse(screen.getByTestId('active-skill').textContent);
      expect(skill.systemPrompt).toBe('Updated prompt text');
    });
  });

  describe('Message skillActive tagging', () => {
    it('messages after activation have skillActive: true', async () => {
      render(<ChatHookHarness />);

      // Activate skill first
      await act(async () => {
        fireEvent.click(screen.getByTestId('activate-btn'));
      });

      // Send a message
      await act(async () => {
        fireEvent.click(screen.getByTestId('send-btn'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('msg-count').textContent).toBe('2');
      });

      // User message should have skillActive true
      expect(screen.getByTestId('msg-0')).toHaveAttribute('data-skill-active', 'true');
      // Assistant message should have skillActive true
      expect(screen.getByTestId('msg-1')).toHaveAttribute('data-skill-active', 'true');
    });

    it('messages before activation have skillActive: false or undefined', async () => {
      render(<ChatHookHarness />);

      // Send a message without activating skill
      await act(async () => {
        fireEvent.click(screen.getByTestId('send-btn'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('msg-count').textContent).toBe('2');
      });

      expect(screen.getByTestId('msg-0')).toHaveAttribute('data-skill-active', 'false');
      expect(screen.getByTestId('msg-1')).toHaveAttribute('data-skill-active', 'false');
    });
  });
});

// ─────────────────────────────────────────────
// ACTIVATED STAGE IN NUDGE MANAGER
// ─────────────────────────────────────────────
describe('Phase 4B — Activated stage in processMatch', () => {
  it('activated pattern stage returns none from processMatch', () => {
    const pattern = {
      id: 'email-assistant',
      name: 'Email Assistant',
      domain: 'Professional communication',
      anchors: ['email'],
      nudges: { n1: '', n2: '', n3: '' },
      counter: 3,
      stage: 'activated',
      snoozeCount: 0,
      matchedPrompts: []
    };

    const result = processMatch(pattern, 'draft an email');
    expect(result.action).toBe('none');
    // Counter should NOT increment
    expect(pattern.counter).toBe(3);
  });
});
