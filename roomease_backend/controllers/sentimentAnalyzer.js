/**
 * Sentiment Analysis Engine — RoomEase
 *
 * Keyword-based approach — no external API needed, works fully offline.
 * Analyses hotel reviews across 5 categories:
 *   cleanliness, staff, food, service, comfort
 *
 * Handles: negation ("not clean"), intensifiers ("very helpful"),
 *          star rating boost, and compound scoring.
 *
 * Returns:
 * {
 *   sentiment:  'positive' | 'negative' | 'neutral',
 *   score:       -1.0 to +1.0  (normalized),
 *   confidence:  0–100 (%)
 *   categories: { cleanliness, staff, food, service, comfort }  each with sentiment + keywords found
 *   keywords:  { positive: [], negative: [] }
 *   summary:   string
 * }
 */

// ── KEYWORD DICTIONARY ──────────────────────────────────────────────────────

const CATEGORIES = {
  cleanliness: {
    positive: ['clean','spotless','tidy','hygienic','fresh','immaculate','neat','sanitized','well-maintained','pristine'],
    negative: ['dirty','filthy','stained','dusty','smelly','odor','smell','uncleaned','messy','unhygienic','mold','mould','cockroach','bug','insect','pest'],
  },
  staff: {
    positive: ['helpful','friendly','polite','courteous','professional','attentive','welcoming','kind','responsive','excellent staff','great staff','amazing staff','cooperative','accommodating','warm','hospitable'],
    negative: ['rude','unhelpful','unfriendly','ignorant','slow','unresponsive','disrespectful','arrogant','unprofessional','ignored','dismissive','impolite','bad staff'],
  },
  food: {
    positive: ['delicious','tasty','good food','great food','excellent food','fresh food','yummy','flavourful','flavorful','variety','breakfast was','lunch was','dinner was','enjoyed the food','loved the food','amazing food'],
    negative: ['bad food','terrible food','tasteless','cold food','stale','uncooked','undercooked','overcooked','food was bad','food was cold','awful food','food poisoning','inedible','horrible food'],
  },
  service: {
    positive: ['great service','excellent service','good service','quick service','fast service','prompt','on time','efficient','smooth check-in','easy check-in','seamless','hassle-free','top notch service','outstanding service'],
    negative: ['poor service','bad service','slow service','delayed','long wait','waiting','no service','terrible service','disappointing service','unacceptable service','rip off','overcharged'],
  },
  comfort: {
    positive: ['comfortable','cozy','spacious','quiet','peaceful','relaxing','luxurious','plush','great view','beautiful view','nice room','great room','perfect room','loved the room','amazing room','soft bed','good bed','great mattress'],
    negative: ['uncomfortable','noisy','small room','tiny room','cramped','broken','damaged','not working','no hot water','cold water','no wifi','poor wifi','no ac','ac not working','broken furniture','old room','outdated'],
  },
};

// General positive/negative sentiment words (not category-specific)
const GENERAL_POSITIVE = [
  'excellent','perfect','wonderful','amazing','fantastic','great','good','nice','love','loved',
  'enjoyed','happy','satisfied','recommend','recommended','outstanding','superb','brilliant',
  'impressed','pleasure','best','value for money','worth it','will return','come back',
  'highly recommend','5 star','five star','top','pleasant','incredible','exceptional',
];

const GENERAL_NEGATIVE = [
  'terrible','horrible','awful','bad','worst','disappointing','disappointed','poor',
  'waste','never again','not recommend','do not recommend','avoid','upset','unhappy',
  'disgusting','shocking','unacceptable','not worth','overpriced','scam','fraud',
  'pathetic','dreadful','below average','mediocre',
];

// Negation words (flip the next word's polarity)
const NEGATION_WORDS = ['not','no','never','neither','nor','cannot','can\'t','won\'t','don\'t','didn\'t','isn\'t','wasn\'t','hardly','barely','rarely'];

// Intensifier words (multiply score effect)
const INTENSIFIERS = { 'very': 1.5, 'extremely': 2.0, 'really': 1.5, 'so': 1.3, 'too': 1.4, 'absolutely': 2.0, 'totally': 1.5, 'highly': 1.5, 'incredibly': 2.0, 'super': 1.4 };

// ── CORE ANALYSIS ───────────────────────────────────────────────────────────

function tokenize(text) {
  return text.toLowerCase().replace(/[^a-z0-9'\s-]/g, ' ').split(/\s+/).filter(Boolean);
}

/**
 * Check if a keyword (which may be a phrase) exists in tokens at position i.
 * Returns true if it matches.
 */
function matchKeyword(tokens, keyword, startIdx) {
  const kTokens = keyword.split(/\s+/);
  for (let k = 0; k < kTokens.length; k++) {
    if (tokens[startIdx + k] !== kTokens[k]) return false;
  }
  return true;
}

/**
 * Detect if any negation word appears within 3 words before position i.
 */
function isNegated(tokens, i) {
  const window = Math.max(0, i - 3);
  for (let j = window; j < i; j++) {
    if (NEGATION_WORDS.includes(tokens[j])) return true;
  }
  return false;
}

/**
 * Get intensifier multiplier from the 2 words before position i.
 */
function getIntensifier(tokens, i) {
  for (let j = Math.max(0, i - 2); j < i; j++) {
    if (INTENSIFIERS[tokens[j]]) return INTENSIFIERS[tokens[j]];
  }
  return 1.0;
}

/**
 * Score a text against a keyword list. Returns { score, found[] }.
 */
function scoreAgainstList(tokens, keywords, baseScore) {
  let total = 0;
  const found = [];
  for (let i = 0; i < tokens.length; i++) {
    for (const kw of keywords) {
      const kwTokens = kw.split(/\s+/);
      if (matchKeyword(tokens, kw, i)) {
        const neg     = isNegated(tokens, i);
        const intens  = getIntensifier(tokens, i);
        const score   = (neg ? -baseScore : baseScore) * intens;
        total += score;
        found.push({ keyword: kw, negated: neg, score: Math.round(score * 100) / 100 });
        i += kwTokens.length - 1; // skip matched tokens
        break;
      }
    }
  }
  return { score: total, found };
}

/**
 * Analyse a single category.
 */
function analyseCategory(tokens, catKeywords) {
  const pos = scoreAgainstList(tokens, catKeywords.positive, +1);
  const neg = scoreAgainstList(tokens, catKeywords.negative, -1);
  const raw = pos.score + neg.score;

  return {
    score:     Math.round(raw * 100) / 100,
    sentiment: raw > 0.2 ? 'positive' : raw < -0.2 ? 'negative' : 'neutral',
    positive:  pos.found.map(f => f.keyword),
    negative:  neg.found.map(f => f.keyword),
    mentioned: pos.found.length > 0 || neg.found.length > 0,
  };
}

/**
 * Main export: analyse a review text + optional star rating.
 * @param {string} text         - review text
 * @param {number} [stars=null] - 1–5 star rating (optional)
 * @returns {object}            - full sentiment result
 */
function analyseReview(text, stars = null) {
  if (!text || typeof text !== 'string') {
    return { sentiment: 'neutral', score: 0, confidence: 0, categories: {}, keywords: { positive: [], negative: [] }, summary: 'No review text provided.' };
  }

  const tokens = tokenize(text);

  // ── Category scores ────────────────────────────────────────────────────────
  const categories = {};
  let catScoreSum = 0;
  let catCount    = 0;
  for (const [catName, kwLists] of Object.entries(CATEGORIES)) {
    categories[catName] = analyseCategory(tokens, kwLists);
    if (categories[catName].mentioned) {
      catScoreSum += categories[catName].score;
      catCount++;
    }
  }

  // ── General sentiment ──────────────────────────────────────────────────────
  const genPos = scoreAgainstList(tokens, GENERAL_POSITIVE, +1);
  const genNeg = scoreAgainstList(tokens, GENERAL_NEGATIVE, -1);
  const generalScore = genPos.score + genNeg.score;

  // ── Combine: categories (60%) + general (40%) ──────────────────────────────
  let combinedScore = catCount > 0
    ? (catScoreSum / catCount) * 0.6 + generalScore * 0.4
    : generalScore;

  // ── Star rating boost/penalty (±0.5 max effect) ────────────────────────────
  if (stars !== null && stars >= 1 && stars <= 5) {
    const starNorm    = (stars - 3) / 2;    // maps 1→-1, 3→0, 5→+1
    combinedScore     = combinedScore * 0.75 + starNorm * 0.5;
  }

  // ── Normalize to [-1, +1] ─────────────────────────────────────────────────
  const score      = Math.max(-1, Math.min(1, combinedScore));
  const roundScore = Math.round(score * 100) / 100;

  // ── Final label ────────────────────────────────────────────────────────────
  let sentiment;
  if (roundScore >= 0.15)       sentiment = 'positive';
  else if (roundScore <= -0.15) sentiment = 'negative';
  else                          sentiment = 'neutral';

  // ── Confidence (0–100) ─────────────────────────────────────────────────────
  const allFound = genPos.found.length + genNeg.found.length + catCount;
  const confidence = Math.min(100, Math.round(Math.abs(roundScore) * 60 + allFound * 5));

  // ── Top keywords ──────────────────────────────────────────────────────────
  const positiveKws = genPos.found.map(f => f.keyword);
  const negativeKws = genNeg.found.map(f => f.keyword);
  for (const cat of Object.values(categories)) {
    positiveKws.push(...cat.positive);
    negativeKws.push(...cat.negative);
  }

  // ── Summary string ────────────────────────────────────────────────────────
  const catMentioned = Object.entries(categories)
    .filter(([, v]) => v.mentioned)
    .map(([k]) => k);
  const summary = buildSummary(sentiment, catMentioned, categories);

  return {
    sentiment,
    score:      roundScore,
    confidence,
    categories,
    keywords: {
      positive: [...new Set(positiveKws)],
      negative: [...new Set(negativeKws)],
    },
    summary,
  };
}

function buildSummary(sentiment, catMentioned, categories) {
  if (catMentioned.length === 0) {
    return sentiment === 'positive' ? 'Overall positive review.' : sentiment === 'negative' ? 'Overall negative review.' : 'Neutral or mixed review.';
  }
  const negCats = catMentioned.filter(c => categories[c].sentiment === 'negative');
  const posCats = catMentioned.filter(c => categories[c].sentiment === 'positive');
  let parts = [];
  if (posCats.length) parts.push(`Praised: ${posCats.join(', ')}`);
  if (negCats.length) parts.push(`Issues with: ${negCats.join(', ')}`);
  return parts.join('. ') + '.';
}

// ── INSIGHTS GENERATOR ───────────────────────────────────────────────────────

/**
 * Generate aggregate insights from an array of sentiment results.
 * @param {Array} sentimentResults - array of analyseReview() outputs
 * @returns {object} insights
 */
function generateInsights(sentimentResults) {
  const total    = sentimentResults.length;
  if (total === 0) return { total: 0 };

  const counts   = { positive: 0, negative: 0, neutral: 0 };
  const catScores = { cleanliness: [], staff: [], food: [], service: [], comfort: [] };
  const allPosKw = [];
  const allNegKw = [];

  sentimentResults.forEach(r => {
    counts[r.sentiment]++;
    allPosKw.push(...(r.keywords?.positive || []));
    allNegKw.push(...(r.keywords?.negative || []));
    for (const [cat, data] of Object.entries(r.categories || {})) {
      if (data.mentioned) catScores[cat].push(data.score);
    }
  });

  // Category averages
  const categoryInsights = {};
  for (const [cat, scores] of Object.entries(catScores)) {
    if (scores.length === 0) {
      categoryInsights[cat] = { avgScore: 0, sentiment: 'neutral', reviewCount: 0 };
    } else {
      const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
      categoryInsights[cat] = {
        avgScore:    Math.round(avg * 100) / 100,
        sentiment:   avg >= 0.15 ? 'positive' : avg <= -0.15 ? 'negative' : 'neutral',
        reviewCount: scores.length,
      };
    }
  }

  // Top keyword frequencies
  const freqCount = (arr) => {
    const map = {};
    arr.forEach(w => { map[w] = (map[w] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([word, count]) => ({ word, count }));
  };

  const satisfactionRate = Math.round((counts.positive / total) * 100);
  const overallScore     = sentimentResults.reduce((s, r) => s + r.score, 0) / total;

  return {
    total,
    counts,
    satisfactionRate,
    overallScore:        Math.round(overallScore * 100) / 100,
    overallSentiment:    overallScore >= 0.15 ? 'positive' : overallScore <= -0.15 ? 'negative' : 'neutral',
    categories:          categoryInsights,
    topComplaints:       freqCount(allNegKw),
    topPraises:          freqCount(allPosKw),
    recommendations:     buildRecommendations(categoryInsights),
  };
}

function buildRecommendations(cats) {
  const recs = [];
  const negCats = Object.entries(cats).filter(([, v]) => v.sentiment === 'negative' && v.reviewCount > 0);
  negCats.forEach(([cat]) => {
    const messages = {
      cleanliness: 'Schedule more frequent room cleaning inspections and add checklist accountability.',
      staff:       'Conduct staff training on guest communication and hospitality standards.',
      food:        'Review kitchen quality control, meal variety, and serving temperature.',
      service:     'Improve response times and streamline the check-in/check-out process.',
      comfort:     'Audit room furniture and amenities; prioritize maintenance of reported issues.',
    };
    if (messages[cat]) recs.push({ category: cat, recommendation: messages[cat] });
  });
  return recs;
}

module.exports = { analyseReview, generateInsights };
