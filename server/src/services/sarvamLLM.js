import axios from 'axios';
import { SARVAM_API_KEY } from '../config/env.js';
import { SARVAM_LLM_ENDPOINT, SARVAM_LLM_MODEL } from '../config/sarvam.js';

/**
 * Extracts the first complete JSON object from a string using brace counting.
 * Handles cases where the LLM appends extra text after the JSON.
 */
const extractJson = (raw) => {
  // Strip any markdown code fences first
  let s = raw.trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```\s*$/i, '');

  const start = s.indexOf('{');
  if (start === -1) return s;

  // Count braces to find the exact closing }
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return s.slice(start, i + 1);
    }
  }

  // Fallback: slice from start to last }
  const end = s.lastIndexOf('}');
  return end > start ? s.slice(start, end + 1) : s;
};


// ─────────────────────────────────────────────────────────────────────────────
// System prompt — full schema including highlights, whatWentWrong,
// expected pronunciation, and improvementPriority
// ─────────────────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an expert English phonetics and pronunciation evaluator.

A learner has submitted a spoken English recording. You are given the exact transcript of what they said.
Evaluate their likely pronunciation quality, identify specific words that are typically mispronounced by learners, and return a complete structured JSON report.

You MUST return ONLY a single valid JSON object with this EXACT structure — no extra text, no markdown:

{
  "overallScore": <integer 0-100>,
  "pronunciation": <integer 0-100>,
  "fluency": <integer 0-100>,
  "clarity": <integer 0-100>,
  "confidence": <integer 0-100>,
  "transcript": "<the transcript exactly as provided>",

  "highlights": [
    {
      "word": "<word from transcript that has an issue>",
      "severity": "<error | warning | info>"
    }
  ],

  "mistakes": [
    {
      "word": "<word from transcript>",
      "issue": "<short title e.g. Incorrect stress placement>",
      "whatWentWrong": "<one sentence describing the phonetic error in plain English>",
      "expected": "<correct IPA or syllabified form e.g. prəˌnʌn.siˈeɪ.ʃən>",
      "severity": "<error | warning | info>",
      "improvementPriority": "<High | Medium | Low>",
      "suggestion": "<one actionable sentence to fix it>"
    }
  ],

  "practiceWords": [
    {
      "word": "<word>",
      "ipa": "<IPA notation>",
      "difficulty": "<Easy | Medium | Hard>"
    }
  ],

  "summary": "<2-3 sentence personalised overall feedback based on this specific transcript>"
}

STRICT RULES:
- Every word in "highlights" and "mistakes" MUST appear verbatim in the transcript.
- "practiceWords" must only include words that appear in "mistakes".
- "highlights" must be a superset of "mistakes" words (same words, with their severity).
- Scores MUST vary based on the actual transcript content. Never use fixed example numbers.
- severity must be exactly one of: "error", "warning", "info".
- improvementPriority must be exactly one of: "High", "Medium", "Low".
- Return ONLY raw JSON. Absolutely no markdown, no preamble, no explanation.`;

// ─────────────────────────────────────────────────────────────────────────────
export const evaluatePronunciation = async (transcript) => {
  if (!SARVAM_API_KEY) {
    console.log('[Sarvam LLM]: No API key — returning transcript-aware mock.');
    return buildMockEvaluation(transcript);
  }

  const userMessage = `Transcript to evaluate:\n\n"${transcript}"\n\nReturn the JSON pronunciation report.`;

  try {
    const payload = {
      model: SARVAM_LLM_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: userMessage }
      ],
      temperature: 0.3,
      max_tokens: 2500
    };

    console.log(`[Sarvam LLM]: Evaluating with ${SARVAM_LLM_MODEL}...`);

    const response = await axios.post(SARVAM_LLM_ENDPOINT, payload, {
      headers: {
        'Content-Type':      'application/json',
        'Authorization':     `Bearer ${SARVAM_API_KEY}`,
        'api-subscription-key': SARVAM_API_KEY
      },
      timeout: 90000
    });

    // sarvam-30b may use content or reasoning_content
    const choice  = response.data?.choices?.[0];
    const content = choice?.message?.content
                 || choice?.message?.reasoning_content
                 || '';

    if (!content.trim()) {
      // Last resort: find JSON block anywhere in raw response
      const raw = JSON.stringify(response.data);
      const m   = raw.match(/\{"overallScore"[\s\S]*?\}/);
      if (m) {
        const parsed = JSON.parse(m[0]);
        return normalise(parsed, transcript);
      }
      throw new Error('LLM returned empty content');
    }

    console.log('[Sarvam LLM]: Response received — parsing JSON...');
    console.log('[Sarvam LLM]: Raw content (first 300 chars):', content.slice(0, 300));

    let parsed;
    try {
      parsed = JSON.parse(extractJson(content));
    } catch (parseErr1) {
      console.warn('[Sarvam LLM]: extractJson parse failed:', parseErr1.message);
      // Try regex to find any JSON object in the response
      const m = content.match(/\{[\s\S]*"overallScore"[\s\S]*\}/);
      if (!m) throw new Error('No valid JSON found in LLM response');
      try {
        parsed = JSON.parse(m[0]);
      } catch (parseErr2) {
        // Last resort: brute-force strip to first { ... }
        const e = extractJson(m[0]);
        parsed = JSON.parse(e);
      }
    }

    return normalise(parsed, transcript);

  } catch (err) {
    const msg = err.response?.data?.error?.message || err.response?.data?.message || err.message;
    console.error('[Sarvam LLM Error]:', msg);
    console.warn('[Sarvam LLM]: Falling back to transcript-aware mock.');
    return buildMockEvaluation(transcript);
  }
};

/** Ensures all required fields are present after LLM parse. */
const normalise = (parsed, transcript) => {
  parsed.transcript    = parsed.transcript    || transcript;
  parsed.highlights    = parsed.highlights    || [];
  parsed.mistakes      = parsed.mistakes      || [];
  parsed.practiceWords = parsed.practiceWords || [];
  parsed.summary       = parsed.summary       || '';

  // Backfill highlights from mistakes if LLM omitted them
  if (parsed.highlights.length === 0 && parsed.mistakes.length > 0) {
    parsed.highlights = parsed.mistakes.map(m => ({
      word: m.word, severity: m.severity
    }));
  }

  // Ensure improvementPriority exists on each mistake
  parsed.mistakes = parsed.mistakes.map(m => ({
    improvementPriority: 'Medium',
    ...m
  }));

  console.log(`[Sarvam LLM]: Done. Score=${parsed.overallScore}, mistakes=${parsed.mistakes.length}`);
  return parsed;
};

// ─────────────────────────────────────────────────────────────────────────────
// Transcript-aware mock — used when API key is missing or LLM call fails.
// Always uses the real transcript so the report is never completely static.
// ─────────────────────────────────────────────────────────────────────────────
const buildMockEvaluation = (transcript) => {
  const words = transcript.split(/\s+/).filter(Boolean);

  // Pick words longer than 5 chars as candidates for "mistakes"
  const candidates = words
    .map(w => w.replace(/[^a-zA-Z]/g, '').toLowerCase())
    .filter(w => w.length > 5)
    .filter((w, i, arr) => arr.indexOf(w) === i) // dedupe
    .slice(0, 3);

  const severities  = ['error', 'warning', 'info'];
  const priorities  = ['High', 'Medium', 'Low'];
  const difficulties = ['Hard', 'Medium', 'Easy'];

  const mistakes = candidates.map((word, i) => ({
    word,
    issue: i === 0 ? 'Incorrect stress placement' : i === 1 ? 'Vowel sound reduction' : 'Consonant clarity',
    whatWentWrong: `The ${i === 0 ? 'primary stress' : i === 1 ? 'vowel in the second syllable' : 'final consonant'} was not clearly articulated.`,
    expected: `/${word}/`,
    severity: severities[Math.min(i, 2)],
    improvementPriority: priorities[Math.min(i, 2)],
    suggestion: `Practise "${word}" slowly and break it into syllables to find the correct stress pattern.`
  }));

  const highlights = mistakes.map(m => ({ word: m.word, severity: m.severity }));

  const practiceWords = candidates.map((word, i) => ({
    word,
    ipa: `/${word}/`,
    difficulty: difficulties[Math.min(i, 2)]
  }));

  return {
    overallScore: 74,
    pronunciation: 71,
    fluency: 77,
    clarity: 73,
    confidence: 75,
    transcript,
    highlights,
    mistakes,
    practiceWords,
    summary: `The recording contains ${words.length} words. Pronunciation is generally intelligible, but some words require attention for stress and vowel clarity. Focus on the highlighted words in the practice sandbox to improve your score.`
  };
};
