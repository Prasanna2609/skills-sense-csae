import { groq, GROQ_MODEL } from '../lib/groq';

/**
 * generateSkill
 *
 * Pure async utility — no React state, no hooks.
 * Runs three sequential Groq API calls to generate a complete Skill package:
 *   Call 1 → name + system prompt
 *   Call 2 → reference examples
 *   Call 3 → guidelines
 *
 * @param {string[]} matchedPrompts   - The user's matched prompts
 * @param {string}   patternName      - Name of the detected pattern
 * @param {string[]} matchedResponses - Claude responses for those prompts
 * @returns {Object} Complete skill object
 */
export async function generateSkill(matchedPrompts, patternName, matchedResponses) {

  // ── Call 1: Generate name + system prompt ──────────────────────────

  let skillMd;
  try {
    const call1Response = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a Skill generator. Return valid JSON only. No markdown, no backticks, no explanation.'
        },
        {
          role: 'user',
          content: `The user has sent these prompts repeatedly:\n"${matchedPrompts[0] || ''}"\n"${matchedPrompts[1] || ''}"\n"${matchedPrompts[2] || ''}"\n\nDomain: ${patternName}\n\nGenerate a comprehensive system prompt (minimum 150 words) that captures their specific workflow, preferences, and standards. The prompt MUST be structured with clear sections: Role Definition, Output Style, Constraints, and Trigger Conditions. Do not provide a one-liner. Be specific — extract real patterns from their prompts, not generic descriptions. No filler. No pleasantries.\n\nReturn a single flat JSON object only. The systemPrompt value must be a plain text string, NOT a nested object or array. Example format:\n{"name": "Email Writing Skill", "systemPrompt": "You are an expert email writer..."}`
        }
      ],
      model: GROQ_MODEL,
      temperature: 0.3
    });

    const raw = call1Response.choices[0]?.message?.content || '';
    skillMd = JSON.parse(raw);

    if (typeof skillMd.systemPrompt === 'object' && skillMd.systemPrompt !== null) {
      skillMd.systemPrompt = Object.entries(skillMd.systemPrompt)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n\n');
    }

    if (typeof skillMd.name === 'object' && skillMd.name !== null) {
      skillMd.name = Object.values(skillMd.name)[0] || 'Custom Skill';
    }
  } catch (err) {
    console.error('Skill generation Call 1 failed:', err);
    skillMd = {
      name: patternName,
      systemPrompt: 'You are a helpful assistant specialising in ' + patternName + ' tasks.'
    };
  }

  // ── Call 2: Generate references/examples.md ─────────────────────────

  let examplesMd;
  try {
    const examplePairs = matchedPrompts.map((prompt, i) => {
      const response = matchedResponses[i] || '[No response recorded]';
      return `Prompt ${i + 1}: "${prompt}"\nResponse ${i + 1}: "${response}"`;
    }).join('\n\n');

    const call2Response = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a Skill reference file generator. Return markdown only. No JSON, no backticks wrapping.'
        },
        {
          role: 'user',
          content: `Here are real interactions from a user's session:\n\n${examplePairs}\n\nFormat these as clean input/output example pairs for a Skill reference file. Provide at minimum 3 complete input/output pairs. Each pair MUST have full, realistic content — do not truncate. The output examples should be as long as a real response would be. Show what good output looks like for this user's specific style and standards.\n\nReturn markdown only. Use this exact format:\n## Example 1\n**Input:** [full user prompt]\n**Output:** [full, non-truncated claude response]\n\n## Example 2\n...`
        }
      ],
      model: GROQ_MODEL,
      temperature: 0.3
    });

    examplesMd = call2Response.choices[0]?.message?.content || '';
    if (typeof examplesMd !== 'string') {
      examplesMd = JSON.stringify(examplesMd, null, 2);
    }
  } catch (err) {
    console.error('Skill generation Call 2 failed:', err);
    examplesMd = matchedPrompts.map((prompt, i) =>
      `## Example ${i + 1}\n**Input:** ${prompt}\n**Output:** ${matchedResponses[i] || 'N/A'}`
    ).join('\n\n');
  }

  // ── Call 3: Generate references/guidelines.md ───────────────────────

  let guidelinesMd;
  try {
    const call3Response = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a Skill guidelines generator. Return markdown only. No JSON, no backticks wrapping.'
        },
        {
          role: 'user',
          content: `Based on these user prompts:\n"${matchedPrompts[0] || ''}"\n"${matchedPrompts[1] || ''}"\n"${matchedPrompts[2] || ''}"\n\nInfer the specific guidelines, tone rules, format preferences, and constraints this user consistently applies. Be specific and direct. Write a minimum of 200 words total across all sections.\n\nReturn markdown only. Use this exact format:\n## Tone\n[specific tone rules inferred]\n\n## Format\n[specific format rules inferred]\n\n## Constraints\n[specific constraints inferred]\n\n## Edge Cases\n[how to handle edge cases]\n\n## Examples of what NOT to do\n[anti-patterns and common mistakes]`
        }
      ],
      model: GROQ_MODEL,
      temperature: 0.3
    });

    guidelinesMd = call3Response.choices[0]?.message?.content || '';
    if (typeof guidelinesMd !== 'string') {
      guidelinesMd = JSON.stringify(guidelinesMd, null, 2);
    }
  } catch (err) {
    console.error('Skill generation Call 3 failed:', err);
    guidelinesMd = `## Tone\nMatch the user's established ${patternName} communication style.\n\n## Format\nFollow the structure demonstrated in previous ${patternName} sessions.\n\n## Constraints\nStay within the ${patternName} domain. Do not deviate from established patterns.`;
  }

  // ── Assemble and return ─────────────────────────────────────────────

  return {
    name: skillMd.name,
    systemPrompt: skillMd.systemPrompt,
    references: {
      examples: examplesMd,
      guidelines: guidelinesMd,
      examplesEnabled: true,
      guidelinesEnabled: true
    },
    patternId: null, // set by the caller
    createdAt: Date.now(),
    source: 'csae-generated'
  };
}
