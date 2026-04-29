import { useState, useCallback, useRef, useEffect } from 'react';
import { groq, GROQ_MODEL } from '../lib/groq';

export const useGroqChat = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSkill, setActiveSkill] = useState(() => {
    const savedSkill = localStorage.getItem('skill-sense-active-skill');
    return savedSkill ? JSON.parse(savedSkill) : null;
  });

  useEffect(() => {
    if (activeSkill) {
      localStorage.setItem('skill-sense-active-skill', JSON.stringify(activeSkill));
    } else {
      localStorage.removeItem('skill-sense-active-skill');
    }
  }, [activeSkill]);
  const [skillBadge, setSkillBadge] = useState(null);
  const activeSkillRef = useRef(null);
  const messagesRef = useRef([]);

  // Keep messagesRef in sync with state for synchronous reads inside useCallback
  if (messagesRef.current !== messages) {
    messagesRef.current = messages;
  }

  /**
   * buildSystemPrompt
   * Constructs the system message content. When a Skill is active,
   * injects the Skill's system prompt plus any enabled references.
   */
  const buildSystemPrompt = useCallback(() => {
    if (!activeSkillRef.current) {
      return "You are a helpful assistant inside Skill Sense, a Claude-like interface. Be concise and helpful.";
    }

    const skill = activeSkillRef.current;
    let prompt = skill.systemPrompt || "You are a helpful assistant.";

    if (skill.references?.examplesEnabled && skill.references?.examples) {
      prompt += "\n\n## Reference Examples\n" + skill.references.examples;
    }

    if (skill.references?.guidelinesEnabled && skill.references?.guidelines) {
      prompt += "\n\n## Guidelines\n" + skill.references.guidelines;
    }

    return prompt;
  }, []);

  /**
   * activateSkill
   * Sets the active Skill and badge for display.
   */
  const activateSkill = useCallback((generatedSkill) => {
    setActiveSkill(generatedSkill);
    activeSkillRef.current = generatedSkill;
    setSkillBadge({
      name: generatedSkill.name,
      patternId: generatedSkill.patternId
    });
  }, []);

  /**
   * updateSkillReference
   * Toggles examplesEnabled or guidelinesEnabled on the active Skill.
   * Can also optionally append new content.
   */
  const updateSkillReference = useCallback((type, enabled, contentToAppend = null) => {
    setActiveSkill((prev) => {
      if (!prev) return prev;
      const refKey = type === 'examples' ? 'examplesEnabled' : 'guidelinesEnabled';
      const updatedRefs = {
        ...prev.references,
        [refKey]: enabled
      };
      if (contentToAppend) {
        updatedRefs[type] = (updatedRefs[type] || '') + '\n\n' + contentToAppend;
      }
      const updated = {
        ...prev,
        references: updatedRefs
      };
      activeSkillRef.current = updated;
      return updated;
    });
  }, []);

  /**
   * updateSkillSystemPrompt
   * Updates the active Skill's system prompt directly (Quick Edit save).
   */
  const updateSkillSystemPrompt = useCallback((newPrompt) => {
    setActiveSkill((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, systemPrompt: newPrompt };
      activeSkillRef.current = updated;
      return updated;
    });
  }, []);

  /**
   * sendMessage
   * Sends a user message to Groq with the current system prompt
   * (default or Skill-injected). Tags messages with skillActive
   * when a Skill is active.
   *
   * Wrapped in useCallback — uses functional setMessages so it
   * doesn't need messages/activeSkill in the dependency array.
   */
  const sendMessage = useCallback(async (userInput) => {
    if (!userInput.trim()) return;

    const userMessage = {
      role: 'user',
      content: userInput,
      skillActive: !!activeSkillRef.current
    };
    
    const newMessages = [...messagesRef.current, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: buildSystemPrompt()
          },
          ...newMessages.map((m) => ({ role: m.role, content: m.content }))
        ],
        model: GROQ_MODEL,
      });

      const assistantContent = response.choices[0]?.message?.content || "";

      setMessages([...newMessages, {
        role: 'assistant',
        content: assistantContent,
        skillActive: !!activeSkillRef.current
      }]);
      return assistantContent;
    } catch (error) {
      console.error("Error calling Groq API:", error);
      setMessages([...newMessages, {
        role: 'assistant',
        content: "Sorry, I encountered an error. Please check your API key.",
        skillActive: !!activeSkillRef.current
      }]);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [buildSystemPrompt]);
  /**
   * loadMessages
   * Replaces the current messages array with a provided array.
   * Used when loading a past chat session.
   */
  const loadMessages = useCallback((msgs) => {
    setMessages(msgs || []);
  }, []);

  const clearActiveSkill = useCallback(() => {
    setActiveSkill(null);
    activeSkillRef.current = null;
    setSkillBadge(null);
  }, []);

  return {
    messages,
    isLoading,
    activeSkill,
    skillBadge,
    sendMessage,
    activateSkill,
    updateSkillReference,
    updateSkillSystemPrompt,
    buildSystemPrompt,
    loadMessages,
    clearActiveSkill
  };
};
