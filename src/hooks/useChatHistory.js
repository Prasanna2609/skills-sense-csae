import { useState, useCallback, useRef } from 'react';

const STORAGE_KEY = 'skill-sense-chats';

/**
 * generateId
 * Creates a unique ID from timestamp + random suffix
 */
function generateId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

/**
 * getRelativeTime
 * Converts a timestamp to a human-readable relative string
 */
export function getRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

/**
 * readChats
 * Reads all chat sessions from localStorage
 */
function readChats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * writeChats
 * Writes all chat sessions to localStorage
 */
function writeChats(chats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
}

/**
 * useChatHistory
 * 
 * Manages persistent chat sessions in localStorage.
 * Uses a ref to track currentChatId synchronously — prevents
 * duplicate session creation when React batches state updates.
 */
export const useChatHistory = () => {
  const [chats, setChats] = useState(() => {
    const stored = readChats();
    return stored.sort((a, b) => b.updatedAt - a.updatedAt);
  });
  const [currentChatId, setCurrentChatId] = useState(null);
  const chatIdRef = useRef(null);

  /**
   * saveMessage
   * Saves the current messages array to the active session.
   * Creates a new session ONLY if chatIdRef is null.
   * Uses a ref so rapid calls always see the latest ID.
   */
  const saveMessage = useCallback((messages) => {
    if (!messages || messages.length === 0) return;

    const now = Date.now();
    const firstUserMsg = messages.find((m) => m.role === 'user');
    const title = firstUserMsg
      ? firstUserMsg.content.slice(0, 40)
      : 'New conversation';

    const allChats = readChats();

    if (chatIdRef.current) {
      // Update existing session
      const idx = allChats.findIndex((c) => c.id === chatIdRef.current);
      if (idx !== -1) {
        allChats[idx].messages = messages;
        allChats[idx].updatedAt = now;
        if (allChats[idx].title === 'New conversation' && title !== 'New conversation') {
          allChats[idx].title = title;
        }
      }
    } else {
      // Create new session — ref updates synchronously
      const newId = generateId();
      chatIdRef.current = newId;
      setCurrentChatId(newId);
      allChats.push({
        id: newId,
        title,
        messages,
        createdAt: now,
        updatedAt: now
      });
    }

    const sorted = allChats.sort((a, b) => b.updatedAt - a.updatedAt);
    writeChats(sorted);
    setChats(sorted);
  }, []);

  /**
   * loadChat
   * Loads a past session by ID, returns its messages.
   */
  const loadChat = useCallback((chatId) => {
    const allChats = readChats();
    const chat = allChats.find((c) => c.id === chatId);
    if (chat) {
      chatIdRef.current = chatId;
      setCurrentChatId(chatId);
      return chat.messages;
    }
    return [];
  }, []);

  /**
   * startNewChat
   * Clears currentChatId so the next saveMessage creates a fresh entry.
   */
  const startNewChat = useCallback(() => {
    chatIdRef.current = null;
    setCurrentChatId(null);
  }, []);

  /**
   * deleteChat
   * Removes a session from localStorage by ID.
   */
  const deleteChat = useCallback((chatId) => {
    const allChats = readChats().filter((c) => c.id !== chatId);
    writeChats(allChats);
    setChats(allChats);

    if (chatIdRef.current === chatId) {
      chatIdRef.current = null;
      setCurrentChatId(null);
    }
  }, []);

  return {
    chats,
    currentChatId,
    saveMessage,
    loadChat,
    startNewChat,
    deleteChat
  };
};
