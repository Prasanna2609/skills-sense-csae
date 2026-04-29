import { useCallback, useRef } from 'react';
import { detectPattern } from '../engine/detector';

/**
 * useNudge
 *
 * Manages real-time detection on the input field. When the user
 * is typing and a pattern has already hit the threshold (counter >= 3),
 * this hook detects the match in real time and triggers nudge preparation
 * before the user even sends the message.
 */
export const useNudge = (patterns, activeNudge, analyzePromptRealTime) => {
  const debounceRef = useRef(null);
  const patternsRef = useRef(patterns);
  const activeNudgeRef = useRef(activeNudge);
  
  // Keep refs in sync with latest values
  patternsRef.current = patterns;
  activeNudgeRef.current = activeNudge;

  const handleInputChange = useCallback((inputValue) => {
    // Use refs instead of closure values
    if (activeNudgeRef.current) return;

    const patternAtThreshold = patternsRef.current.find(
      (p) => p.stage === 'nudge-ready'
    );
    if (!patternAtThreshold) return;

    // Debounce — only fire after 600ms of no typing
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (!inputValue.trim()) return;

      // Run detectPattern on current input value
      const matched = detectPattern(inputValue, patternsRef.current);
      if (matched && matched.id === patternAtThreshold.id) {
        // Trigger nudge preparation without incrementing counter
        analyzePromptRealTime(inputValue);
      }
    }, 600);
  }, [analyzePromptRealTime]); // Remove patterns and activeNudge from deps — using refs now

  return { handleInputChange };
};
