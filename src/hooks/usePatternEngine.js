import { useState, useCallback } from 'react';
import { detectPattern } from '../engine/detector';
import { processMatch } from '../engine/nudgeManager';
import { generateSkill } from './useSkillGeneration';
import seedPatterns from '../data/seedPatterns';

/**
 * usePatternEngine
 *
 * Central orchestrator — wires the CSAE detection engine into
 * the chat flow. Every user message passes through analyzePrompt,
 * which detects matches, advances lifecycle, and triggers Skill
 * generation when a nudge threshold is crossed.
 */
export const usePatternEngine = () => {
  // Deep clone seed patterns so mutations stay local to this session
  const [patterns, setPatterns] = useState(() =>
    JSON.parse(JSON.stringify(seedPatterns))
  );

  // Stores the last 3 Claude responses that correspond to matched prompts
  const [matchedResponses, setMatchedResponses] = useState([]);

  // Nudge state
  const [activeNudge, setActiveNudge] = useState(null);
  const [isPreparingNudge, setIsPreparingNudge] = useState(false);

  // generateSkill is a plain async function — no hooks, no internal state

  /**
   * analyzePrompt
   * Called on every user message. Detects pattern matches,
   * advances the lifecycle, and triggers skill generation
   * when processMatch returns fire-nudge.
   *
   * @param {string} promptText   - The user's raw prompt
   * @param {string} responseText - Claude's response to this prompt
   */
  const analyzePrompt = useCallback(async (promptText, responseText) => {
    const matched = detectPattern(promptText, patterns);

    if (!matched) return;

    // Run lifecycle mutation on the matched pattern
    const result = processMatch(matched, promptText);

    // Track the response alongside the prompt for Skill generation
    if (responseText) {
      setMatchedResponses((prev) => {
        const updated = [...prev, responseText];
        return updated.length > 3 ? updated.slice(-3) : updated;
      });
    }

    // Force React to see the mutated pattern state
    setPatterns((prev) => [...prev]);

    // The pattern state is mutated by processMatch (stage becomes nudge-ready, counter is 3).
    // We just return silently, allowing analyzePromptRealTime to handle the actual generation and UI during typing.
  }, [patterns, matchedResponses]);

  /**
   * dismissNudge
   * User clicked "Not Now" — snooze the pattern
   */
  const dismissNudge = useCallback(() => {
    if (!activeNudge) return;

    setPatterns((prev) =>
      prev.map((p) =>
        p.id === activeNudge.pattern.id
          ? { ...p, stage: 'snoozed', snoozeCount: 0 }
          : p
      )
    );

    setActiveNudge(null);
  }, [activeNudge]);

  /**
   * archivePattern
   * Permanently silence a pattern
   */
  const archivePattern = useCallback((patternId) => {
    setPatterns((prev) =>
      prev.map((p) =>
        p.id === patternId ? { ...p, stage: 'archived' } : p
      )
    );

    if (activeNudge?.pattern.id === patternId) {
      setActiveNudge(null);
    }
  }, [activeNudge]);

  /**
   * activateNudge
   * User clicked "Activate" — activate the generated skill and
   * mark the pattern as permanently activated.
   */
  const activateNudge = useCallback((activateSkillFn) => {
    if (!activeNudge) return;

    // Pass the generated skill to the chat hook's activateSkill
    activateSkillFn(activeNudge.generatedSkill);

    // Mark the pattern as activated (permanently silent)
    setPatterns((prev) =>
      prev.map((p) =>
        p.id === activeNudge.pattern.id
          ? { ...p, stage: 'activated' }
          : p
      )
    );

    setActiveNudge(null);
  }, [activeNudge]);

    /**
     * analyzePromptRealTime
     * Same as analyzePrompt but observation-only:
     * - Does not increment counter
     * - Only fires if matched pattern has counter >= 3 and stage is nudge-ready
     * - Triggers skill generation immediately
     * Used by useNudge for real-time keyboard detection.
     */
  const analyzePromptRealTime = useCallback(async (promptText) => {
    const matched = detectPattern(promptText, patterns);
    if (!matched) return;

    // Only runs when a pattern has counter >= 3 AND stage === 'nudge-ready'
    if (matched.stage !== 'nudge-ready') return;

    // Don't fire if we're already preparing or have an active nudge
    if (isPreparingNudge || activeNudge) return;

    setIsPreparingNudge(true);

    try {
      const skill = await generateSkill(
        matched.matchedPrompts,
        matched.name,
        matchedResponses.slice(-3)
      );

      skill.patternId = matched.id;

      setActiveNudge({
        pattern: matched,
        generatedSkill: skill,
        nudgeStage: 'n1'
      });
    } catch (err) {
      console.error('Real-time skill generation failed:', err);
    } finally {
      setIsPreparingNudge(false);
    }
  }, [patterns, matchedResponses, isPreparingNudge, activeNudge]);

  return {
    patterns,
    activeNudge,
    isPreparingNudge,
    analyzePrompt,
    analyzePromptRealTime,
    dismissNudge,
    archivePattern,
    activateNudge
  };
};
