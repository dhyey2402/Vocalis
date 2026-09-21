/**
 * Voice DNA — Deterministic text character analysis.
 * Produces scores (0–100) for five dimensions based on measurable text properties.
 * No API calls. No LLM. Pure heuristics.
 */

import { AVAILABLE_VOICES } from '../data/voices';

// Helper: count occurrences of a pattern
const countPattern = (text, pattern) => (text.match(pattern) || []).length;

// Helper: get sentences from text
const getSentences = (text) => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  return sentences;
};

// Helper: average word count per sentence
const avgWordsPerSentence = (text) => {
  const sentences = getSentences(text);
  if (sentences.length === 0) return 0;
  const totalWords = sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0);
  return totalWords / sentences.length;
};

// Warmth indicators
const WARM_WORDS = /\b(love|heart|care|feel|warm|kind|gentle|soft|beautiful|wonderful|dear|friend|together|share|hope|dream|smile|comfort|embrace|welcome)\b/gi;
const PERSONAL_PRONOUNS = /\b(I|you|we|us|our|your|my|me)\b/gi;

// Formal indicators
const FORMAL_WORDS = /\b(therefore|consequently|furthermore|moreover|nevertheless|notwithstanding|accordingly|henceforth|wherein|hereby|pursuant|shall|thus|hence)\b/gi;
const CONTRACTIONS = /\b(don't|can't|won't|shouldn't|couldn't|wouldn't|isn't|aren't|wasn't|weren't|hasn't|haven't|hadn't|didn't|doesn't|I'm|I've|I'll|I'd|you're|you've|you'll|you'd|we're|we've|we'll|we'd|they're|they've|they'll|they'd|he's|she's|it's|that's|there's|here's|what's|who's|let's)\b/gi;

// Energy indicators
const EXCLAMATIONS = /!/g;
const IMPERATIVE_STARTS = /^(do|make|create|build|start|stop|go|come|take|give|try|use|get|find|see|look|listen|think|imagine|consider|remember|note)\b/gim;

// Expressiveness indicators
const QUESTIONS = /\?/g;
const ADVERBS = /\b\w+ly\b/gi;
const DESCRIPTIVE = /\b(amazing|incredible|stunning|remarkable|extraordinary|magnificent|brilliant|exceptional|superb|outstanding|vibrant|dynamic|powerful|striking|compelling)\b/gi;

/**
 * Analyze text and return a Voice DNA profile.
 * @param {string} text
 * @param {string} selectedLang - current language code
 * @returns {object|null}
 */
export function analyzeVoiceDna(text, selectedLang) {
  if (!text || text.trim().length < 10) return null;

  const cleanText = text.trim();
  const wordCount = cleanText.split(/\s+/).length;
  const sentenceCount = getSentences(cleanText).length;
  const avgWords = avgWordsPerSentence(cleanText);

  // --- WARMTH (0–100) ---
  const warmWordCount = countPattern(cleanText, WARM_WORDS);
  const personalPronounCount = countPattern(cleanText, PERSONAL_PRONOUNS);
  const warmthRaw = Math.min(100, ((warmWordCount * 8 + personalPronounCount * 3) / Math.max(wordCount, 1)) * 100 + 20);
  const warmth = Math.round(Math.max(10, Math.min(98, warmthRaw)));

  // --- CLARITY (0–100) ---
  // Shorter avg sentence length = higher clarity
  const clarityFromLength = Math.max(0, 100 - (avgWords - 8) * 4);
  const clarity = Math.round(Math.max(15, Math.min(98, clarityFromLength)));

  // --- FORMALITY (0–100) ---
  const formalWordCount = countPattern(cleanText, FORMAL_WORDS);
  const contractionCount = countPattern(cleanText, CONTRACTIONS);
  const formalityRaw = 50 + (formalWordCount * 12) - (contractionCount * 8);
  const formality = Math.round(Math.max(10, Math.min(98, formalityRaw)));

  // --- ENERGY (0–100) ---
  const exclamationCount = countPattern(cleanText, EXCLAMATIONS);
  const imperativeCount = countPattern(cleanText, IMPERATIVE_STARTS);
  const shortSentenceRatio = getSentences(cleanText).filter(s => s.trim().split(/\s+/).length <= 8).length / Math.max(sentenceCount, 1);
  const energyRaw = 30 + (exclamationCount * 10) + (imperativeCount * 6) + (shortSentenceRatio * 30);
  const energy = Math.round(Math.max(10, Math.min(98, energyRaw)));

  // --- EXPRESSIVENESS (0–100) ---
  const questionCount = countPattern(cleanText, QUESTIONS);
  const adverbCount = countPattern(cleanText, ADVERBS);
  const descriptiveCount = countPattern(cleanText, DESCRIPTIVE);
  const expressivenessRaw = 25 + (questionCount * 6) + (adverbCount * 3) + (descriptiveCount * 8);
  const expressiveness = Math.round(Math.max(10, Math.min(98, expressivenessRaw)));

  const profile = { warmth, clarity, formality, energy, expressiveness };

  // Generate character summary
  const traits = [];
  if (formality > 65) traits.push('formal');
  else if (formality < 40) traits.push('conversational');
  if (warmth > 65) traits.push('warm');
  else if (warmth < 35) traits.push('neutral');
  if (energy > 65) traits.push('energetic');
  else if (energy < 35) traits.push('measured');
  if (clarity > 70) traits.push('clear');
  if (expressiveness > 65) traits.push('expressive');
  else if (expressiveness < 35) traits.push('restrained');

  if (traits.length === 0) traits.push('balanced');

  const summary = traits.slice(0, 3).join(', ');

  // Suggest voice based on profile
  const suggestion = suggestVoice(profile, selectedLang);

  return { profile, summary, suggestion };
}

/**
 * Suggest a voice based on the DNA profile.
 */
function suggestVoice(profile, selectedLang) {
  // Filter voices by language if one is selected
  const candidates = selectedLang
    ? AVAILABLE_VOICES.filter(v => v.languageCode === selectedLang)
    : AVAILABLE_VOICES.filter(v => v.languageCode === 'en');

  if (candidates.length === 0) return null;

  // Simple scoring: match voice style to profile
  let bestVoice = null;
  let bestScore = -1;

  for (const voice of candidates) {
    let score = 0;
    const style = (voice.style || '').toLowerCase();

    // Conversational voices match warm, low-formality text
    if (style === 'conversational') {
      score += profile.warmth * 0.4 + (100 - profile.formality) * 0.3 + profile.expressiveness * 0.2;
    }
    // Narrative voices match clear, measured text
    else if (style === 'narrative') {
      score += profile.clarity * 0.4 + profile.formality * 0.3 + (100 - profile.energy) * 0.2;
    }
    // News voices match formal, clear, measured text
    else if (style === 'news') {
      score += profile.formality * 0.4 + profile.clarity * 0.3 + (100 - profile.warmth) * 0.2;
    }
    // Standard voices get a balanced score
    else {
      score += (profile.clarity + profile.formality + profile.warmth) / 3;
    }

    if (score > bestScore) {
      bestScore = score;
      bestVoice = voice;
    }
  }

  if (!bestVoice || bestScore < 20) return null;

  // Build a reason
  const reasons = [];
  if (profile.warmth > 60) reasons.push('warm');
  if (profile.clarity > 60) reasons.push('clear');
  if (profile.formality > 60) reasons.push('formal');
  if (profile.energy > 60) reasons.push('energetic');
  if (reasons.length === 0) reasons.push('balanced');

  return {
    voice: bestVoice,
    reason: `Best suited to ${reasons.join(', ')} content.`,
  };
}
