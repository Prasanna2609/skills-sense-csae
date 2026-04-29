import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QuickEdit from '../components/phase9_editing/QuickEdit';
import SkillDetail from '../components/phase8_skills/SkillDetail';

describe('Phase 8 — QuickEdit & SkillDetail', () => {
  const mockSkill = {
    id: 'test-skill',
    name: 'Test Skill',
    systemPrompt: 'Original prompt text',
    status: 'activated',
    references: {
      examplesEnabled: true,
      guidelinesEnabled: false
    }
  };

  it('QuickEdit renders textarea with skill system prompt content', () => {
    render(<QuickEdit skill={mockSkill} onSave={vi.fn()} onCancel={vi.fn()} onToggleReference={vi.fn()} />);
    const textarea = screen.getByTestId('quick-edit-textarea');
    expect(textarea.value).toBe('Original prompt text');
  });

  it('Textarea value is editable', () => {
    render(<QuickEdit skill={mockSkill} onSave={vi.fn()} onCancel={vi.fn()} onToggleReference={vi.fn()} />);
    const textarea = screen.getByTestId('quick-edit-textarea');
    fireEvent.change(textarea, { target: { value: 'Updated text' } });
    expect(textarea.value).toBe('Updated text');
  });

  it('Save button calls onSave with updated text', () => {
    const onSave = vi.fn();
    render(<QuickEdit skill={mockSkill} onSave={onSave} onCancel={vi.fn()} onToggleReference={vi.fn()} />);
    const textarea = screen.getByTestId('quick-edit-textarea');
    fireEvent.change(textarea, { target: { value: 'Updated text' } });
    fireEvent.click(screen.getByTestId('quick-edit-save'));
    expect(onSave).toHaveBeenCalledWith('Updated text');
  });

  it('Cancel button calls onCancel', () => {
    const onCancel = vi.fn();
    render(<QuickEdit skill={mockSkill} onSave={vi.fn()} onCancel={onCancel} onToggleReference={vi.fn()} />);
    fireEvent.click(screen.getByTestId('quick-edit-cancel'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('examples.md chip is active when examplesEnabled is true', () => {
    render(<QuickEdit skill={mockSkill} onSave={vi.fn()} onCancel={vi.fn()} onToggleReference={vi.fn()} />);
    const chip = screen.getByTestId('chip-examples');
    expect(chip.style.color).toMatch(/CF643F|rgb\(207,\s*100,\s*63\)/i);
  });

  it('guidelines.md chip toggles correctly', () => {
    const onToggle = vi.fn();
    render(<QuickEdit skill={mockSkill} onSave={vi.fn()} onCancel={vi.fn()} onToggleReference={onToggle} />);
    const chip = screen.getByTestId('chip-guidelines');
    fireEvent.click(chip);
    // Because guidelinesEnabled is false in mock, clicking toggles it to true
    expect(onToggle).toHaveBeenCalledWith('guidelines', true);
  });

  it('File upload section renders', () => {
    render(<QuickEdit skill={mockSkill} onSave={vi.fn()} onCancel={vi.fn()} onToggleReference={vi.fn()} />);
    expect(screen.getByTestId('file-upload-section')).toBeInTheDocument();
    expect(screen.getByText('Drop .md file here or click to upload')).toBeInTheDocument();
  });

  it('isEditing false by default in SkillDetail', () => {
    render(<SkillDetail skill={mockSkill} onActivate={vi.fn()} onSave={vi.fn()} onToggleSkill={vi.fn()} onToggleReference={vi.fn()} />);
    expect(screen.queryByTestId('quick-edit-section')).not.toBeInTheDocument();
    expect(screen.getByText('About this Skill')).toBeInTheDocument();
  });

  it('Quick Edit button sets isEditing to true', () => {
    render(<SkillDetail skill={mockSkill} onActivate={vi.fn()} onSave={vi.fn()} onToggleSkill={vi.fn()} onToggleReference={vi.fn()} />);
    fireEvent.click(screen.getByTestId('quick-edit-btn'));
    expect(screen.getByTestId('quick-edit-section')).toBeInTheDocument();
    expect(screen.queryByText('About this Skill')).not.toBeInTheDocument();
  });

  it('Edit with Claude shows Coming Soon on click', () => {
    render(<SkillDetail skill={mockSkill} onActivate={vi.fn()} onSave={vi.fn()} onToggleSkill={vi.fn()} onToggleReference={vi.fn()} />);
    const button = screen.getByTestId('edit-claude-btn');
    fireEvent.click(button);
    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
  });
});
