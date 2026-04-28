const express = require('express');
const router  = express.Router();
const pricingController = require('../controllers/pricingController');

// GET  /ramkrishna/lodging/pricing  – full pricing info + breakdowns
router.get('/', pricingController.getPricingInfo);

// PUT  /ramkrishna/lodging/pricing  – admin update pricing factors
router.put('/', pricingController.updatePricingData);

module.exports = router;
