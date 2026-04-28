const fs   = require('fs');
const path = require('path');
const db   = require('../database/connection');
const calculateDynamicPrice = require('./calculateDynamicPrice');

const DATA_PATH = path.join(__dirname, '../src/dynamic_pricing_data.json');

/** Read pricing data synchronously (called per-request so always fresh) */
function readPricingData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  } catch (e) {
    console.error('Could not read pricing data:', e.message);
    return {};
  }
}

/** Compute today's occupancy per room category */
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

// Cache rooms array so getRoom() can filter without a second DB call
let cachedRooms = [];

/** GET /ramkrishna/lodging/rooms */
exports.getAllRooms = async (req, res) => {
  try {
    const [results]    = await db.promise().query('SELECT * FROM room');
    const pricingData  = readPricingData();
    const occupancyMap = await computeOccupancy();

    // Inject live occupancy rates
    const enriched = { ...pricingData };
    Object.entries(occupancyMap).forEach(([cat, { total, booked }]) => {
      const rate = total > 0 ? Math.round((booked / total) * 100) : 0;
      enriched[`${cat.toLowerCase()}_occupancy_rate`] = rate;
    });

    cachedRooms = results.map(room => {
      const pricing = calculateDynamicPrice(room.room_category, parseFloat(room.price), enriched);
      return {
        ...room,
        price:       pricing.finalPrice,
        pricingInfo: pricing,
      };
    });

    res.status(200).json({
      status:      'success',
      requestedAt: req.requestTime,
      data:        cachedRooms,
    });
  } catch (err) {
    console.error('getAllRooms error:', err);
    res.status(500).json({ status: 'fail', message: 'Database query failed' });
  }
};

/** Helper: build array of date strings between two dates */
function getDateRange(startDate, endDate) {
  const dateArray = [];
  let cur = new Date(startDate);
  cur.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  while (cur <= end) {
    const y  = cur.getFullYear();
    const m  = String(cur.getMonth() + 1).padStart(2, '0');
    const d  = String(cur.getDate()).padStart(2, '0');
    dateArray.push(`${y}-${m}-${d}`);
    cur.setDate(cur.getDate() + 1);
  }
  return dateArray;
}

/** GET /ramkrishna/lodging/rooms/:roomno */
exports.getRoom = (req, res) => {
  const roomno = Number(req.params.roomno);

  // Use cached rooms (populated by getAllRooms); fall back to DB if cache empty
  const roomArr = cachedRooms.filter(r => r.room_no === roomno);

  const sqlBookingQuery = `
    SELECT CheckinDate, CheckOutDate FROM bookings
    WHERE RoomNo = ? AND deleted_status = 'active'
  `;

  db.query(sqlBookingQuery, [roomno], (err, results) => {
    if (err) {
      console.error('getRoom booking query failed:', err.message);
      return res.status(500).json({ status: 'fail', message: 'Database query failed' });
    }

    let unavailableDates = [];
    results.forEach(b => {
      unavailableDates = unavailableDates.concat(getDateRange(b.CheckinDate, b.CheckOutDate));
    });
    unavailableDates = [...new Set(unavailableDates)];

    res.status(200).json({
      status: 'success',
      data:   { room: roomArr, unavailableDates },
    });
  });
};
