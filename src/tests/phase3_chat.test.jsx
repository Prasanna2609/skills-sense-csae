import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import MessageBubble from '../components/phase3_chat/MessageBubble';
import ChatInput from '../components/phase3_chat/ChatInput';
import { useGroqChat } from '../hooks/useGroqChat';

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

// ─── Phase 3 — useGroqChat hook ───────────────────────────────────────────────
// We test the hook through a minimal wrapper component
function ChatHookHarness() {
  const { messages, isLoading, sendMessage } = useGroqChat();
  return (
    <div>
      <div data-testid="msg-count">{messages.length}</div>
      <div data-testid="loading">{String(isLoading)}</div>
      <button onClick={() => sendMessage('hello')}>send</button>
      {messages.map((m, i) => (
        <div key={i} data-testid={`msg-${i}`} data-role={m.role}>
          {m.content}
        </div>
      ))}
    </div>
  );
}

describe('Phase 3 — useGroqChat hook', () => {
  test('initializes with empty messages array', () => {
    render(<ChatHookHarness />);
    expect(screen.getByTestId('msg-count').textContent).toBe('0');
  });

  test('sendMessage adds user message to messages array', async () => {
    render(<ChatHookHarness />);
    fireEvent.click(screen.getByText('send'));
    await waitFor(() =>
      expect(screen.getByTestId('msg-count').textContent).not.toBe('0')
    );
    expect(screen.getByTestId('msg-0')).toHaveAttribute('data-role', 'user');
    expect(screen.getByTestId('msg-0').textContent).toBe('hello');
  });

  test('isLoading is true while waiting for response', async () => {
    // Slow mock so we can catch the in-flight state
    const { groq } = await import('../lib/groq');
    groq.chat.completions.create.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({
        choices: [{ message: { content: 'reply' } }],
      }), 200))
    );

    render(<ChatHookHarness />);
    fireEvent.click(screen.getByText('send'));

    // Loading should be true synchronously after click
    expect(screen.getByTestId('loading').textContent).toBe('true');

    // Then it resolves
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );
  });
});

// ─── Phase 3 — MessageBubble component ───────────────────────────────────────
describe('Phase 3 — MessageBubble', () => {
  test('renders user message aligned right', () => {
    const { container } = render(
      <MessageBubble role="user" content="Hello there" />
    );
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('justify-end');
    expect(screen.getByText('Hello there')).toBeInTheDocument();
  });

  test('renders assistant message aligned left', () => {
    const { container } = render(
      <MessageBubble role="assistant" content="Hi, how can I help?" />
    );
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('justify-start');
    expect(screen.getByText('Hi, how can I help?')).toBeInTheDocument();
  });
});

// ─── Phase 3 — ChatInput component ───────────────────────────────────────────
describe('Phase 3 — ChatInput', () => {
  test('ChatInput is disabled (pointer-events-none) when isLoading is true', () => {
    const { container } = render(
      <ChatInput sendMessage={vi.fn()} isLoading={true} />
    );
    // The inner wrapper div gets opacity-50 + pointer-events-none when loading
    const inputWrapper = container.querySelector('.pointer-events-none');
    expect(inputWrapper).toBeInTheDocument();
  });

  test('Enter key triggers sendMessage', () => {
    const mockSend = vi.fn();
    render(<ChatInput sendMessage={mockSend} isLoading={false} />);
    const textarea = screen.getByPlaceholderText('How can I help you?');
    fireEvent.change(textarea, { target: { value: 'test message' } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', shiftKey: false });
    expect(mockSend).toHaveBeenCalledWith('test message');
  });
});
