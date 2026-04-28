const express    = require('express');
const router     = express.Router();
const ctrl       = require('../controllers/sentimentController');

// GET  /ramkrishna/sentiment/reviews   – all reviews with sentiment
router.get('/reviews',  ctrl.getReviewsWithSentiment);

// POST /ramkrishna/sentiment/analyse   – analyse a single text on the fly
router.post('/analyse', ctrl.analyseOne);

// GET  /ramkrishna/sentiment/insights  – admin aggregate insights
router.get('/insights', ctrl.getInsights);

module.exports = router;
