import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChatHistory, getRelativeTime } from '../hooks/useChatHistory';

// ─── Mock localStorage ────────────────────────────────────────────────────────
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; })
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

// ─────────────────────────────────────────────
// useChatHistory TESTS
// ─────────────────────────────────────────────
describe('Phase 6A — useChatHistory', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('saveMessage creates a new chat session', () => {
    const { result } = renderHook(() => useChatHistory());

    const messages = [
      { role: 'user', content: 'Hello there' },
      { role: 'assistant', content: 'Hi! How can I help?' }
    ];

    act(() => {
      result.current.saveMessage(messages);
    });

    expect(result.current.chats).toHaveLength(1);
    expect(result.current.chats[0].messages).toEqual(messages);
    expect(result.current.currentChatId).not.toBeNull();
  });

  it('saveMessage updates existing session on subsequent calls', () => {
    const { result } = renderHook(() => useChatHistory());

    const msg1 = [{ role: 'user', content: 'First message' }];
    const msg2 = [
      { role: 'user', content: 'First message' },
      { role: 'assistant', content: 'Reply' }
    ];

    act(() => {
      result.current.saveMessage(msg1);
    });

    act(() => {
      result.current.saveMessage(msg2);
    });

    // Should still be 1 chat, not 2
    expect(result.current.chats).toHaveLength(1);
    expect(result.current.chats[0].messages).toEqual(msg2);
  });

  it('title is set from first user message truncated to 40 chars', () => {
    const { result } = renderHook(() => useChatHistory());

    const longMessage = 'This is a very long message that should be truncated to exactly forty characters for the title';
    const messages = [{ role: 'user', content: longMessage }];

    act(() => {
      result.current.saveMessage(messages);
    });

    expect(result.current.chats[0].title).toBe(longMessage.slice(0, 40));
    expect(result.current.chats[0].title.length).toBe(40);
  });

  it('loadChat returns correct messages for that chatId', () => {
    const { result } = renderHook(() => useChatHistory());

    const messages = [
      { role: 'user', content: 'Test message' },
      { role: 'assistant', content: 'Test reply' }
    ];

    act(() => {
      result.current.saveMessage(messages);
    });

    const chatId = result.current.chats[0].id;
    let loaded;

    act(() => {
      loaded = result.current.loadChat(chatId);
    });

    expect(loaded).toEqual(messages);
    expect(result.current.currentChatId).toBe(chatId);
  });

  it('startNewChat clears currentChatId', () => {
    const { result } = renderHook(() => useChatHistory());

    // Save a message to set currentChatId
    act(() => {
      result.current.saveMessage([{ role: 'user', content: 'Hello' }]);
    });

    expect(result.current.currentChatId).not.toBeNull();

    act(() => {
      result.current.startNewChat();
    });

    expect(result.current.currentChatId).toBeNull();
  });

  it('deleteChat removes session from storage', () => {
    const { result } = renderHook(() => useChatHistory());

    act(() => {
      result.current.saveMessage([{ role: 'user', content: 'Chat one' }]);
    });

    const chatId = result.current.chats[0].id;

    // Start a new chat and save another
    act(() => {
      result.current.startNewChat();
    });

    act(() => {
      result.current.saveMessage([{ role: 'user', content: 'Chat two' }]);
    });

    expect(result.current.chats).toHaveLength(2);

    act(() => {
      result.current.deleteChat(chatId);
    });

    expect(result.current.chats).toHaveLength(1);
    expect(result.current.chats.find((c) => c.id === chatId)).toBeUndefined();
  });

  it('chats array sorted by updatedAt descending', async () => {
    const { result } = renderHook(() => useChatHistory());

    // Create first chat
    act(() => {
      result.current.saveMessage([{ role: 'user', content: 'Older chat' }]);
    });

    // Small delay to ensure different timestamp
    await new Promise((r) => setTimeout(r, 10));

    // Create second chat
    act(() => {
      result.current.startNewChat();
    });

    act(() => {
      result.current.saveMessage([{ role: 'user', content: 'Newer chat' }]);
    });

    // Most recent should be first
    expect(result.current.chats[0].title).toBe('Newer chat');
    expect(result.current.chats[1].title).toBe('Older chat');
  });
});

// ─────────────────────────────────────────────
// getRelativeTime TESTS
// ─────────────────────────────────────────────
describe('Phase 6A — getRelativeTime', () => {
  it('returns "just now" for very recent timestamps', () => {
    expect(getRelativeTime(Date.now())).toBe('just now');
  });

  it('returns "Xm ago" for minutes', () => {
    const fiveMinAgo = Date.now() - 5 * 60000;
    expect(getRelativeTime(fiveMinAgo)).toBe('5m ago');
  });

  it('returns "Xh ago" for hours', () => {
    const twoHoursAgo = Date.now() - 2 * 3600000;
    expect(getRelativeTime(twoHoursAgo)).toBe('2h ago');
  });

  it('returns "yesterday" for one day ago', () => {
    const oneDayAgo = Date.now() - 86400000;
    expect(getRelativeTime(oneDayAgo)).toBe('yesterday');
  });
});
