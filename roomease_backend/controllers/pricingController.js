const fs   = require('fs');
const path = require('path');
const db   = require('../database/connection');
const calculateDynamicPrice = require('./calculateDynamicPrice');

const DATA_PATH = path.join(__dirname, '../src/dynamic_pricing_data.json');

function readPricingData() {
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
}
function writePricingData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

/** Compute today's occupancy per room category from the DB */
async function computeOccupancy() {
  const [rooms]  = await db.promise().query(
    'SELECT room_category, COUNT(*) AS total FROM room GROUP BY room_category'
  );
  const [booked] = await db.promise().query(`
    SELECT r.room_category, COUNT(b.BookingID) AS booked_count
    FROM bookings b
    JOIN room r ON b.RoomNo = r.room_no
    WHERE b.deleted_status = 'active'
      AND CURDATE() BETWEEN b.CheckinDate AND b.CheckOutDate
    GROUP BY r.room_category
  `);
  const map = {};
  rooms.forEach(r  => { map[r.room_category] = { total: Number(r.total), booked: 0 }; });
  booked.forEach(b => { if (map[b.room_category]) map[b.room_category].booked = Number(b.booked_count); });
  return map;
}

/**
 * GET /ramkrishna/lodging/pricing
 * Returns current pricing factors, real occupancy, and full price breakdown per room type.
 */
exports.getPricingInfo = async (req, res) => {
  try {
    const pricingData  = readPricingData();
    const occupancyMap = await computeOccupancy();

    // Inject live occupancy rates into pricing data
    const enriched = { ...pricingData };
    Object.entries(occupancyMap).forEach(([cat, { total, booked }]) => {
      const rate = total > 0 ? Math.round((booked / total) * 100) : 0;
      enriched[`${cat.toLowerCase()}_occupancy_rate`] = rate;
    });

    // Get base prices per category
    const [prices] = await db.promise().query(
      'SELECT room_category, price FROM room'
    );

    // Group prices by category (use actual per-room prices)
    const categoryPrices = {};
    prices.forEach(r => {
      if (!categoryPrices[r.room_category]) categoryPrices[r.room_category] = [];
      categoryPrices[r.room_category].push(parseFloat(r.price));
    });

    // Compute breakdown per category
    const breakdowns = {};
    Object.entries(categoryPrices).forEach(([cat, priceList]) => {
      const basePrice = priceList[0]; // use first room's base price
      breakdowns[cat] = calculateDynamicPrice(cat, basePrice, enriched);
    });

    res.status(200).json({
      status: 'success',
      pricingData: enriched,
      breakdowns,
      occupancy: occupancyMap,
    });
  } catch (err) {
    console.error('Pricing info error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

/**
 * PUT /ramkrishna/lodging/pricing
 * Admin: update pricing configuration factors.
 */
exports.updatePricingData = (req, res) => {
  try {
    const current = readPricingData();
    const updated  = { ...current, ...req.body };
    writePricingData(updated);
    res.status(200).json({ status: 'success', message: 'Pricing data updated', data: updated });
  } catch (err) {
    console.error('Pricing update error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};
