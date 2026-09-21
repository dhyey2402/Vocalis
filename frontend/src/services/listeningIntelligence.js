/**
 * Listening Intelligence — Deterministic spoken-delivery analysis.
 * Evaluates how well text will sound when spoken aloud.
 * Produces a score (0–100) and actionable opportunities.
 * No API calls. No LLM. Pure heuristics.
 */

const getSentences = (text) => {
  return text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
};

const getParagraphs = (text) => {
  return text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
};

const getWords = (text) => {
  return text.trim().split(/\s+/).filter(w => w.length > 0);
};

/**
 * Analyze text for spoken delivery quality.
 * @param {string} text
 * @returns {object|null}
 */
export function analyzeListening(text) {
  if (!text || text.trim().length < 10) return null;

  const cleanText = text.trim();
  const sentences = getSentences(cleanText);
  const paragraphs = getParagraphs(cleanText);
  const words = getWords(cleanText);
  const wordCount = words.length;

  const opportunities = [];
  let totalPenalty = 0;

  // --- Factor 1: Sentence length distribution ---
  const longSentences = sentences.filter(s => getWords(s).length > 35);
  const veryLongSentences = sentences.filter(s => getWords(s).length > 50);
  
  if (veryLongSentences.length > 0) {
    totalPenalty += veryLongSentences.length * 8;
    opportunities.push({
      type: 'long_sentences',
      severity: 'high',
      message: `${veryLongSentences.length} sentence${veryLongSentences.length > 1 ? 's' : ''} exceed${veryLongSentences.length === 1 ? 's' : ''} 50 words — will feel very dense when spoken.`,
      count: veryLongSentences.length,
    });
  } else if (longSentences.length > 0) {
    totalPenalty += longSentences.length * 4;
    opportunities.push({
      type: 'long_sentences',
      severity: 'moderate',
      message: `${longSentences.length} sentence${longSentences.length > 1 ? 's' : ''} exceed${longSentences.length === 1 ? 's' : ''} 35 words — may feel dense when spoken.`,
      count: longSentences.length,
    });
  }

  // --- Factor 2: Pause opportunities ---
  // Good spoken text has natural pauses (commas, semicolons, etc.)
  const pauseMarkers = (cleanText.match(/[,;:—–]/g) || []).length;
  const pauseRatio = pauseMarkers / Math.max(sentences.length, 1);
  
  if (pauseRatio < 0.5 && sentences.length > 2) {
    totalPenalty += 6;
    opportunities.push({
      type: 'few_pauses',
      severity: 'moderate',
      message: 'Limited natural pause points detected. Consider adding commas or breaking sentences.',
      count: null,
    });
  }

  // --- Factor 3: Paragraph density ---
  const denseParagraphs = paragraphs.filter(p => {
    const pSentences = getSentences(p);
    return pSentences.length > 5;
  });

  if (denseParagraphs.length > 0) {
    totalPenalty += denseParagraphs.length * 5;
    opportunities.push({
      type: 'dense_paragraphs',
      severity: 'moderate',
      message: `${denseParagraphs.length} paragraph${denseParagraphs.length > 1 ? 's' : ''} contain${denseParagraphs.length === 1 ? 's' : ''} many sentences — consider splitting for spoken delivery.`,
      count: denseParagraphs.length,
    });
  }

  // --- Factor 4: Repeated phrases ---
  const threeWordPhrases = {};
  for (let i = 0; i < words.length - 2; i++) {
    const phrase = words.slice(i, i + 3).join(' ').toLowerCase();
    threeWordPhrases[phrase] = (threeWordPhrases[phrase] || 0) + 1;
  }
  const repeatedPhrases = Object.entries(threeWordPhrases).filter(([, count]) => count >= 3);

  if (repeatedPhrases.length > 0) {
    totalPenalty += repeatedPhrases.length * 3;
    opportunities.push({
      type: 'repeated_phrases',
      severity: 'low',
      message: `${repeatedPhrases.length} phrase${repeatedPhrases.length > 1 ? 's are' : ' is'} repeated 3+ times — may sound redundant when spoken.`,
      count: repeatedPhrases.length,
    });
  }

  // --- Factor 5: Sentence variety ---
  if (sentences.length > 3) {
    const lengths = sentences.map(s => getWords(s).length);
    const avgLen = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((sum, l) => sum + Math.pow(l - avgLen, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);
    
    if (stdDev < 3) {
      totalPenalty += 5;
      opportunities.push({
        type: 'monotone_rhythm',
        severity: 'low',
        message: 'Sentences are similar in length — varying rhythm would improve spoken delivery.',
        count: null,
      });
    }
  }

  // --- Factor 6: Long spans without punctuation ---
  const longSpans = cleanText.split(/[.!?,;:]/).filter(span => getWords(span).length > 25);
  if (longSpans.length > 0) {
    totalPenalty += longSpans.length * 4;
    opportunities.push({
      type: 'long_spans',
      severity: 'moderate',
      message: `${longSpans.length} long span${longSpans.length > 1 ? 's' : ''} without punctuation — add pause points for natural breathing.`,
      count: longSpans.length,
    });
  }

  // Calculate score (start at 100, subtract penalties, clamp)
  const rawScore = Math.max(0, 100 - totalPenalty);
  const score = Math.round(Math.max(12, Math.min(98, rawScore)));

  // Determine label
  let label;
  if (score >= 85) label = 'Excellent';
  else if (score >= 70) label = 'Strong';
  else if (score >= 50) label = 'Moderate';
  else if (score >= 30) label = 'Needs attention';
  else label = 'Challenging';

  return {
    score,
    label,
    opportunities: opportunities.sort((a, b) => {
      const severityOrder = { high: 0, moderate: 1, low: 2 };
      return (severityOrder[a.severity] || 2) - (severityOrder[b.severity] || 2);
    }),
    stats: {
      sentenceCount: sentences.length,
      avgWordsPerSentence: sentences.length > 0 ? Math.round(words.length / sentences.length) : 0,
      paragraphCount: paragraphs.length,
      pausePoints: pauseMarkers,
      estimatedDurationSeconds: Math.round((wordCount / 150) * 60),
    },
  };
}
