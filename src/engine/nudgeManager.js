/**
 * processMatch
 * Advances a pattern through its lifecycle stages and decides
 * whether to fire a nudge. Mutates the pattern object directly.
 *
 * @param {Object} pattern - A pattern object (mutated in place)
 * @returns {{ action: string, pattern?: Object }}
 */
export function processMatch(pattern, promptText) {
  // Archived and activated patterns are permanently silent
  if (pattern.stage === 'archived' || pattern.stage === 'activated') {
    return { action: 'none' };
  }

  // Snoozed patterns count quiet matches until they re-enter monitoring
  if (pattern.stage === 'snoozed') {
    pattern.snoozeCount++;

    if (pattern.snoozeCount >= 2) {
      pattern.stage = 'monitoring';
      pattern.snoozeCount = 0;
    }

    return { action: 'none' };
  }

  // Monitoring: accumulate matches and promote when threshold is hit
  if (pattern.stage === 'monitoring') {
    pattern.counter++;

    // Keep only the last 3 matched prompts
    pattern.matchedPrompts.push(promptText);
    if (pattern.matchedPrompts.length > 3) {
      pattern.matchedPrompts = pattern.matchedPrompts.slice(-3);
    }

    // Counter 1-3: silently establish the pattern (no nudge)
    // Counter 4+: pattern is confirmed, fire the nudge
    if (pattern.counter >= 3) {
      pattern.stage = 'nudge-ready';
      return { action: 'fire-nudge', pattern };
    }

    return { action: 'none' };
  }

  // Already nudge-ready — keep firing
  if (pattern.stage === 'nudge-ready') {
    return { action: 'fire-nudge', pattern };
  }

  return { action: 'none' };
}
