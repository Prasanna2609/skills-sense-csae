import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SkillsSection from '../components/phase8_skills/SkillsSection';

const mockSkill = {
  id: 'skill-1',
  name: 'Email Assistant',
  timestamp: Date.now(),
  domain: 'Email',
  systemPrompt: 'You are an email assistant...',
  status: 'generated'
};

describe('Phase 7 — Skills Section (Three-Panel Layout)', () => {
  it('SkillsSection renders three panels', () => {
    const { container } = render(<SkillsSection skills={[mockSkill]} activeSkill={mockSkill} />);
    const panels = container.firstChild.children;
    expect(panels.length).toBe(3);
    
    // Check Left Panel
    expect(screen.getByText('Customize')).toBeInTheDocument();
    expect(screen.getAllByText('Skills').length).toBeGreaterThan(0);
    expect(screen.getByTestId('back-to-chat-btn')).toBeInTheDocument();
  });

  it('SkillList shows empty state when no skills', () => {
    render(<SkillsSection skills={[]} />);
    expect(screen.getByTestId('skill-list-empty')).toBeInTheDocument();
  });

  it('SkillList shows skill with Suggested by Skill Sense badge', () => {
    render(<SkillsSection skills={[mockSkill]} />);
    expect(screen.getByText('Email Assistant')).toBeInTheDocument();
    expect(screen.getByText('Suggested by Skill Sense')).toBeInTheDocument();
  });

  it('SkillDetail renders skill name and metadata', () => {
    render(<SkillsSection skills={[mockSkill]} activeSkill={mockSkill} />);
    // Looking inside the detail view
    const detailPanel = screen.getByTestId('skill-detail');
    expect(detailPanel).toHaveTextContent('Email Assistant');
    expect(detailPanel).toHaveTextContent('Skill Sense');
    expect(detailPanel).toHaveTextContent('Email');
  });

  it('SkillDetail shows reference file toggles', () => {
    render(<SkillsSection skills={[mockSkill]} activeSkill={mockSkill} />);
    expect(screen.getByText('examples.md')).toBeInTheDocument();
    expect(screen.getByText('guidelines.md')).toBeInTheDocument();
  });

  it('Edit with Claude button shows Coming Soon on click', () => {
    render(<SkillsSection skills={[mockSkill]} activeSkill={mockSkill} />);
    const editBtn = screen.getByTestId('edit-claude-btn');
    expect(editBtn).toBeInTheDocument();
    fireEvent.click(editBtn);
    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
  });

  it('Back to chat button calls onBack', () => {
    const onBackSpy = vi.fn();
    render(<SkillsSection skills={[mockSkill]} onBack={onBackSpy} />);
    fireEvent.click(screen.getByTestId('back-to-chat-btn'));
    expect(onBackSpy).toHaveBeenCalled();
  });

  it('Toggle switch calls onToggle', () => {
    const onToggleSpy = vi.fn();
    render(<SkillsSection skills={[mockSkill]} activeSkill={mockSkill} onToggleSkill={onToggleSpy} />);
    
    const detailToggle = screen.getByTestId('detail-toggle');
    fireEvent.click(detailToggle);
    expect(onToggleSpy).toHaveBeenCalledWith(mockSkill);
  });
});
