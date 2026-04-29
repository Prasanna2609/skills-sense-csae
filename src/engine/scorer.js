/**
 * calculateConfidence
 * Maps a pattern's match counter to a confidence value (0 → 1).
 *
 * @param {number} counter - How many times the pattern has been matched
 * @returns {number}       - Confidence score: 0, 0.33, 0.67, or 1.0
 */
export function calculateConfidence(counter) {
  if (counter <= 0) return 0;
  if (counter === 1) return 0.33;
  if (counter === 2) return 0.67;
  return 1.0; // counter >= 3
}
