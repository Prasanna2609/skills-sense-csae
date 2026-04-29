import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SkillBadge from '../components/phase10_polish/SkillBadge';
import MessageBubble from '../components/phase3_chat/MessageBubble';
import App from '../App';
import Sidebar from '../components/phase2_layout/Sidebar';

// Mock matchMedia for App tests
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

describe('Phase 9 — Polish', () => {
  it('SkillBadge renders when skillActive is true', () => {
    render(<SkillBadge skillActive={true} skillName="Email Assistant" />);
    expect(screen.getByTestId('skill-badge')).toBeInTheDocument();
    expect(screen.getByText(/Email Assistant/)).toBeInTheDocument();
  });

  it('SkillBadge does not render when skillActive is false', () => {
    const { container } = render(<SkillBadge skillActive={false} skillName="Email Assistant" />);
    expect(container.firstChild).toBeNull();
  });

  it('SkillBadge shows correct skill name', () => {
    render(<SkillBadge skillActive={true} skillName="Code Review" />);
    expect(screen.getByText('✳ Code Review Skill — active')).toBeInTheDocument();
  });

  it('MessageBubble renders SkillBadge for assistant messages when skillActive', () => {
    render(<MessageBubble role="assistant" content="Hello" skillActive={true} skillName="Email Assistant" />);
    expect(screen.getByTestId('skill-badge')).toBeInTheDocument();
  });

  it('MessageBubble does not render SkillBadge for user messages', () => {
    render(<MessageBubble role="user" content="Hello" skillActive={true} skillName="Email Assistant" />);
    expect(screen.queryByTestId('skill-badge')).not.toBeInTheDocument();
  });

  it('Projects tooltip text is correct', () => {
    render(<Sidebar chats={[]} />);
    expect(screen.getByText('Not in scope for this demo')).toBeInTheDocument();
  });
});
