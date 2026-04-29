/**
 * detectPattern
 * Scans a prompt against all patterns and returns the best match,
 * or null if no pattern scores above threshold or if the top two
 * are too close to disambiguate.
 *
 * Scoring formula (tuned for natural language):
 *   1 match  = 0.25
 *   2 matches = 0.50
 *   3+ matches = 0.60 + 0.15 boost = 0.75
 *   Threshold: >= 0.45 (fires at 2+ anchor words)
 *
 * @param {string} promptText - The user's raw prompt
 * @param {Array}  patterns   - Array of pattern objects from seedPatterns
 * @returns {Object|null}     - Highest-scoring pattern, or null
 */
export function detectPattern(promptText, patterns) {
  const prompt = promptText.toLowerCase();

  const scored = patterns.map((pattern) => {
    let matchCount = 0;

    for (const anchor of pattern.anchors) {
      if (prompt.includes(anchor)) {
        matchCount++;
      }
    }

    // Score based on matches found
    // Each match = 0.25, boost of 0.15 if 3+ anchors match
    let score = matchCount * 0.25;
    if (matchCount >= 3) score += 0.15;
    score = Math.min(score, 1.0);

    return { pattern, score, matchCount };
  });

  // Threshold: 0.45 — fires at 2+ anchor matches (2 * 0.25 = 0.50)
  const above = scored.filter((s) => s.score >= 0.45);

  if (above.length === 0) {
    return null;
  }

  // Sort by score descending
  above.sort((a, b) => b.score - a.score);

  // Ambiguity check — if top two within 0.10 of each other
  if (above.length >= 2 && above[0].score - above[1].score <= 0.10) {
    return null;
  }

  return above[0].pattern;
}
