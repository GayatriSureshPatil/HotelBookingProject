const db = require('../database/connection');
const { analyseReview, generateInsights } = require('./sentimentAnalyzer');

/**
 * GET /ramkrishna/sentiment/reviews
 * Returns all reviews with sentiment analysis attached.
 */
exports.getReviewsWithSentiment = (req, res) => {
  const sql = 'SELECT id, name, stars, review_text, created_at FROM reviews ORDER BY created_at DESC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ status: 'error', message: err.message });

    const enriched = results.map(row => ({
      ...row,
      sentiment: analyseReview(row.review_text, row.stars),
    }));

    res.status(200).json({ status: 'success', count: enriched.length, data: enriched });
  });
};

/**
 * POST /ramkrishna/sentiment/analyse
 * Analyse a single review text on the fly (no DB write).
 * Body: { text, stars? }
 */
exports.analyseOne = (req, res) => {
  const { text, stars } = req.body;
  if (!text) return res.status(400).json({ status: 'error', message: 'text is required' });
  const result = analyseReview(text, stars ? Number(stars) : null);
  res.status(200).json({ status: 'success', data: result });
};

/**
 * GET /ramkrishna/sentiment/insights
 * Aggregate insights across all reviews — for the admin dashboard.
 */
exports.getInsights = (req, res) => {
  const sql = 'SELECT id, name, stars, review_text, created_at FROM reviews ORDER BY created_at DESC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ status: 'error', message: err.message });

    const sentimentResults = results.map(row => analyseReview(row.review_text, row.stars));
    const insights = generateInsights(sentimentResults);

    // Recent 5 reviews for dashboard preview
    const recentReviews = results.slice(0, 5).map((row, i) => ({
      id:          row.id,
      name:        row.name,
      stars:       row.stars,
      review_text: row.review_text,
      created_at:  row.created_at,
      sentiment:   sentimentResults[i],
    }));

    res.status(200).json({
      status: 'success',
      insights,
      recentReviews,
    });
  });
};
