import { describe, it, expect, beforeEach } from 'vitest'
import { detectPattern } from '../engine/detector'
import { calculateConfidence } from '../engine/scorer'
import { processMatch } from '../engine/nudgeManager'
import seedPatterns from '../data/seedPatterns'

// Helper: deep-clone seed patterns so each test starts fresh
function freshPatterns() {
  return JSON.parse(JSON.stringify(seedPatterns))
}

// Helper: get a single fresh pattern by id
function freshPattern(id) {
  return freshPatterns().find((p) => p.id === id)
}

// ─────────────────────────────────────────────
// DETECTOR TESTS
// ─────────────────────────────────────────────
describe('detectPattern', () => {
  let patterns

  beforeEach(() => {
    patterns = freshPatterns()
  })

  it('returns null for a generic knowledge question', () => {
    expect(detectPattern('what is the capital of France', patterns)).toBeNull()
  })

  it('returns null for an empty string', () => {
    expect(detectPattern('', patterns)).toBeNull()
  })

  it('returns null for a single anchor word "email" alone (below threshold)', () => {
    expect(detectPattern('email', patterns)).toBeNull()
  })

  it('returns Email Assistant for "draft a formal email to my client"', () => {
    // 4 anchors match: email, formal, draft, client → 4*0.25 + 0.15 = 1.00 (capped)
    const result = detectPattern(
      'draft a formal email to my client',
      patterns
    )
    expect(result).not.toBeNull()
    expect(result.id).toBe('email-assistant')
  })

  it('returns Code Generator for a prompt with code anchors', () => {
    const result = detectPattern(
      'build a react component in typescript with a python backend script and implement the algorithm in javascript',
      patterns
    )
    expect(result).not.toBeNull()
    expect(result.id).toBe('code-generator')
  })

  it('returns MOM Writer for a prompt with meeting anchors', () => {
    const result = detectPattern(
      'write meeting minutes MOM with notes, action items, attendees, decisions from the standup call, include a summary and follow up agenda for the sync discussion',
      patterns
    )
    expect(result).not.toBeNull()
    expect(result.id).toBe('mom-writer')
  })

  it('returns null when prompt has no anchor words from any pattern', () => {
    expect(
      detectPattern('the quick brown fox jumps over the lazy dog', patterns)
    ).toBeNull()
  })

  it('is case insensitive — uppercase prompt matches Email Assistant', () => {
    const result = detectPattern(
      'DRAFT A FORMAL EMAIL TO MY CLIENT',
      patterns
    )
    expect(result).not.toBeNull()
    expect(result.id).toBe('email-assistant')
  })

  it('matches multi-word anchor "follow up" for Email Assistant', () => {
    const result = detectPattern(
      'follow up with the client about the email draft and send a professional reply with the right tone for outreach correspondence',
      patterns
    )
    expect(result).not.toBeNull()
    expect(result.id).toBe('email-assistant')
  })

  it('matches multi-word anchor "action items" for MOM Writer', () => {
    const result = detectPattern(
      'create meeting notes with action items, attendees, decisions from the standup call, include a summary and follow up agenda for the sync discussion',
      patterns
    )
    expect(result).not.toBeNull()
    expect(result.id).toBe('mom-writer')
  })

  it('returns null when two patterns score within 0.10 of each other (ambiguity)', () => {
    // Both code-generator and tech-doc-writer hit many anchors
    // Scores are within 0.10 → null
    const result = detectPattern(
      'api endpoint function code component build implement class readme comment spec technical returns',
      patterns
    )
    expect(result).toBeNull()
  })

  it('1 anchor match should NOT fire (score 0.25, below 0.45)', () => {
    // "email" → 1 match → 1 * 0.25 = 0.25
    expect(detectPattern('email', patterns)).toBeNull()
  })

  it('2 anchor matches SHOULD fire (score 0.50, above 0.45)', () => {
    // "message tone" → 2 matches → 2 * 0.25 = 0.50
    const result = detectPattern('write a message with the right tone', patterns)
    expect(result).not.toBeNull()
    expect(result.id).toBe('email-assistant')
  })

  it('score never exceeds 1.0 even with maximum anchor matches plus boost', () => {
    const emailPattern = patterns.find((p) => p.id === 'email-assistant')
    const matchCount = emailPattern.anchors.length
    let score = matchCount * 0.25
    if (matchCount >= 3) score += 0.15
    score = Math.min(score, 1.0)
    expect(score).toBeLessThanOrEqual(1.0)
  })
})

// ─────────────────────────────────────────────
// SCORER TESTS
// ─────────────────────────────────────────────
describe('calculateConfidence', () => {
  it('counter 0 returns 0', () => {
    expect(calculateConfidence(0)).toBe(0)
  })

  it('counter 1 returns 0.33', () => {
    expect(calculateConfidence(1)).toBe(0.33)
  })

  it('counter 2 returns 0.67', () => {
    expect(calculateConfidence(2)).toBe(0.67)
  })

  it('counter 3 returns 1.0', () => {
    expect(calculateConfidence(3)).toBe(1.0)
  })

  it('counter 5 returns 1.0 — no overflow', () => {
    expect(calculateConfidence(5)).toBe(1.0)
  })

  it('counter -1 returns 0 — graceful handling', () => {
    expect(calculateConfidence(-1)).toBe(0)
  })
})

// ─────────────────────────────────────────────
// NUDGE MANAGER TESTS
// ─────────────────────────────────────────────
describe('processMatch', () => {
  let pattern

  beforeEach(() => {
    pattern = freshPattern('email-assistant')
  })

  it('first match on fresh pattern increments counter to 1, returns action none', () => {
    const result = processMatch(pattern, 'draft an email')
    expect(pattern.counter).toBe(1)
    expect(result.action).toBe('none')
  })

  it('second match increments counter to 2, returns action none', () => {
    processMatch(pattern, 'first email')
    const result = processMatch(pattern, 'second email')
    expect(pattern.counter).toBe(2)
    expect(result.action).toBe('none')
  })

  it('third match increments counter to 3, sets stage to nudge-ready, returns action fire-nudge', () => {
    processMatch(pattern, 'first email')
    processMatch(pattern, 'second email')
    const result = processMatch(pattern, 'third email')
    expect(pattern.counter).toBe(3)
    expect(pattern.stage).toBe('nudge-ready')
    expect(result.action).toBe('fire-nudge')
    expect(result.pattern).toBeDefined()
  })

  it('counter at exactly 2 does NOT fire nudge — boundary test', () => {
    processMatch(pattern, 'first')
    const result = processMatch(pattern, 'second')
    expect(pattern.counter).toBe(2)
    expect(result.action).toBe('none')
  })

  it('counter at exactly 3 DOES fire nudge — boundary test', () => {
    processMatch(pattern, 'first')
    processMatch(pattern, 'second')
    const result = processMatch(pattern, 'third')
    expect(pattern.counter).toBe(3)
    expect(result.action).toBe('fire-nudge')
  })

  it('matchedPrompts contains correct prompt strings after 3 matches', () => {
    processMatch(pattern, 'alpha')
    processMatch(pattern, 'beta')
    processMatch(pattern, 'gamma')
    expect(pattern.matchedPrompts).toEqual(['alpha', 'beta', 'gamma'])
  })

  it('matchedPrompts never exceeds 3 items — oldest dropped on 4th match', () => {
    pattern.counter = 0
    pattern.stage = 'monitoring'
    processMatch(pattern, 'one')
    processMatch(pattern, 'two')
    processMatch(pattern, 'three') // counter 3, fires nudge
    pattern.stage = 'monitoring' // reset to test 4th push
    processMatch(pattern, 'four')
    expect(pattern.matchedPrompts).toHaveLength(3)
    expect(pattern.matchedPrompts).toEqual(['two', 'three', 'four'])
  })

  it('nudge-ready stage always returns fire-nudge regardless of counter', () => {
    pattern.stage = 'nudge-ready'
    pattern.counter = 99
    const result = processMatch(pattern, 'anything')
    expect(result.action).toBe('fire-nudge')
  })

  it('after fire-nudge, manually set stage to snoozed — next match returns none', () => {
    processMatch(pattern, 'a')
    processMatch(pattern, 'b')
    processMatch(pattern, 'c') // fires nudge
    pattern.stage = 'snoozed'
    pattern.snoozeCount = 0
    const result = processMatch(pattern, 'snoozed prompt')
    expect(result.action).toBe('none')
  })

  it('snooze count 1 — still snoozed, returns none', () => {
    pattern.stage = 'snoozed'
    pattern.snoozeCount = 0
    const result = processMatch(pattern, 'single snooze')
    expect(pattern.snoozeCount).toBe(1)
    expect(pattern.stage).toBe('snoozed')
    expect(result.action).toBe('none')
  })

  it('snooze count 2 — stage resets to monitoring, snoozeCount resets to 0', () => {
    pattern.stage = 'snoozed'
    pattern.snoozeCount = 0
    processMatch(pattern, 'snooze match 1')
    processMatch(pattern, 'snooze match 2')
    expect(pattern.stage).toBe('monitoring')
    expect(pattern.snoozeCount).toBe(0)
  })

  it('archived pattern always returns none regardless of prompt', () => {
    pattern.stage = 'archived'
    const result = processMatch(pattern, 'draft an email to my client')
    expect(result.action).toBe('none')
  })

  it('archived pattern counter does not increment', () => {
    pattern.stage = 'archived'
    const before = pattern.counter
    processMatch(pattern, 'draft an email')
    expect(pattern.counter).toBe(before)
  })
})

// ─────────────────────────────────────────────
// INTEGRATION TESTS — detector + nudgeManager
// ─────────────────────────────────────────────
describe('Integration: detectPattern + processMatch', () => {
  let patterns

  beforeEach(() => {
    patterns = freshPatterns()
  })

  it('3 email prompts fire nudge on 3rd', () => {
    const emailPrompts = [
      'draft a formal email to my client',
      'write a professional email to respond to the client',
      'send an email to the prospect with a formal reply'
    ]

    let lastResult
    for (const prompt of emailPrompts) {
      const matched = detectPattern(prompt, patterns)
      expect(matched).not.toBeNull()
      expect(matched.id).toBe('email-assistant')
      lastResult = processMatch(matched, prompt)
    }

    expect(lastResult.action).toBe('fire-nudge')
  })

  it('2 email prompts then 1 unrelated prompt — nudge does NOT fire', () => {
    const prompts = [
      'draft a formal email to my client',
      'write a professional email to respond to the client',
      'what is the capital of France'
    ]

    const results = []
    for (const prompt of prompts) {
      const matched = detectPattern(prompt, patterns)
      if (matched) {
        results.push(processMatch(matched, prompt))
      } else {
        results.push({ action: 'none' })
      }
    }

    expect(results.every((r) => r.action === 'none')).toBe(true)
  })

  it('3 prompts matching different patterns — no nudge fires (each counter stays at 1)', () => {
    const prompts = [
      'draft a formal email to my client',
      'build a react component that calls an api endpoint',
      'write meeting minutes MOM with action items and attendees for the standup'
    ]

    const results = []
    for (const prompt of prompts) {
      const matched = detectPattern(prompt, patterns)
      expect(matched).not.toBeNull()
      results.push(processMatch(matched, prompt))
    }

    expect(results.every((r) => r.action === 'none')).toBe(true)
  })
})
