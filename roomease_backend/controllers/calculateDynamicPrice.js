/**
 * Dynamic Pricing Engine - RoomEase Hotel Management System
 * Calculates room price based on: Season, Weekend, Holidays, Demand, Occupancy, Temperature, Competitor Price
 * Returns final price + detailed breakdown of reasons shown to customers & admins.
 */
function calculateDynamicPrice(roomType, basePrice, pricingData) {
  const {
    season = 'Regular',
    isWeekend = false,
    localEvent = false,
    temperature = 25,
    competitorPrice = basePrice,
  } = pricingData;

  // Room-type-specific demand (0–100)
  let demand = 50;
  if (roomType === 'Deluxe')   demand = pricingData.deluxe_room_demand   ?? 50;
  else if (roomType === 'Standard') demand = pricingData.standard_room_demand ?? 50;
  else if (roomType === 'Suite')    demand = pricingData.suite_room_demand    ?? 50;

  // Real-time occupancy rate (0–100), computed from DB
  const occupancyKey  = `${roomType.toLowerCase()}_occupancy_rate`;
  const occupancyRate = pricingData[occupancyKey] ?? null;

  let price = basePrice;
  const reasons   = [];
  const breakdown = [{ label: 'Base Price', value: Math.floor(basePrice), multiplier: 1 }];

  // ── 1. SEASON ──────────────────────────────────────────────────────────────
  let seasonMultiplier = 1;
  if (season === 'High') {
    seasonMultiplier = 1.25;
    reasons.push({ factor: 'Peak Season', impact: '+25%', description: 'High tourist season boosts demand', icon: '🌞', type: 'increase' });
  } else if (season === 'Low') {
    seasonMultiplier = 0.85;
    reasons.push({ factor: 'Off Season', impact: '-15%', description: 'Low tourist season, discounted rates', icon: '🌧️', type: 'decrease' });
  } else {
    reasons.push({ factor: 'Regular Season', impact: '±0%', description: 'Standard season, base rates apply', icon: '🍂', type: 'neutral' });
  }
  price *= seasonMultiplier;
  breakdown.push({ label: 'Season Adjustment', value: Math.floor(price), multiplier: seasonMultiplier });

  // ── 2. WEEKEND ─────────────────────────────────────────────────────────────
  if (isWeekend) {
    price *= 1.10;
    reasons.push({ factor: 'Weekend Pricing', impact: '+10%', description: 'Higher weekend demand increases prices', icon: '🎉', type: 'increase' });
    breakdown.push({ label: 'Weekend Surcharge', value: Math.floor(price), multiplier: 1.10 });
  }

  // ── 3. LOCAL EVENT / HOLIDAY ───────────────────────────────────────────────
  if (localEvent) {
    price *= 1.15;
    reasons.push({ factor: 'Local Event / Holiday', impact: '+15%', description: 'Special event in the area boosts demand', icon: '🎊', type: 'increase' });
    breakdown.push({ label: 'Event Surcharge', value: Math.floor(price), multiplier: 1.15 });
  }

  // ── 4. DEMAND (0–100, neutral at 50) ──────────────────────────────────────
  const demandFactor = 0.75 + (demand / 100) * 0.50; // range 0.75–1.25
  const demandImpact = Math.round((demandFactor - 1) * 100);
  if (Math.abs(demandImpact) >= 1) {
    const sign = demandImpact > 0 ? '+' : '';
    reasons.push({
      factor: `Room Demand: ${demand}%`,
      impact: `${sign}${demandImpact}%`,
      description: demand >= 70 ? 'High demand for this room category' : demand <= 30 ? 'Low demand — prices reduced to attract guests' : 'Moderate demand levels',
      icon: demandImpact > 0 ? '📈' : '📉',
      type: demandImpact > 0 ? 'increase' : 'decrease',
    });
  }
  price *= demandFactor;
  breakdown.push({ label: 'Demand Factor', value: Math.floor(price), multiplier: Math.round(demandFactor * 100) / 100 });

  // ── 5. OCCUPANCY (real-time from DB) ───────────────────────────────────────
  if (occupancyRate !== null) {
    let occMultiplier = 1;
    if (occupancyRate >= 80) {
      occMultiplier = 1.20;
      reasons.push({ factor: `High Occupancy (${occupancyRate}% booked)`, impact: '+20%', description: 'Most rooms booked — prices increase due to scarcity', icon: '🏨', type: 'increase' });
    } else if (occupancyRate >= 60) {
      occMultiplier = 1.10;
      reasons.push({ factor: `Moderate Occupancy (${occupancyRate}% booked)`, impact: '+10%', description: 'Many rooms booked — moderate price increase', icon: '🏠', type: 'increase' });
    } else if (occupancyRate <= 20) {
      occMultiplier = 0.80;
      reasons.push({ factor: `Very Low Occupancy (${occupancyRate}% booked)`, impact: '-20%', description: 'Most rooms available — prices lowered to attract guests', icon: '🔑', type: 'decrease' });
    } else if (occupancyRate <= 40) {
      occMultiplier = 0.90;
      reasons.push({ factor: `Low Occupancy (${occupancyRate}% booked)`, impact: '-10%', description: 'Many rooms available — slight discount applied', icon: '🏡', type: 'decrease' });
    }
    if (occMultiplier !== 1) {
      price *= occMultiplier;
      breakdown.push({ label: 'Occupancy Factor', value: Math.floor(price), multiplier: occMultiplier });
    }
  }

  // ── 6. TEMPERATURE ─────────────────────────────────────────────────────────
  if (temperature < 15) {
    price *= 0.90;
    reasons.push({ factor: 'Cold Weather', impact: '-10%', description: `Temperature ${temperature}°C — reduced tourist activity`, icon: '❄️', type: 'decrease' });
    breakdown.push({ label: 'Weather Discount', value: Math.floor(price), multiplier: 0.90 });
  } else if (temperature > 35) {
    price *= 0.85;
    reasons.push({ factor: 'Extreme Heat', impact: '-15%', description: `Temperature ${temperature}°C — reduced travel demand`, icon: '🌡️', type: 'decrease' });
    breakdown.push({ label: 'Weather Discount', value: Math.floor(price), multiplier: 0.85 });
  }

  // ── 7. COMPETITOR PRICING ──────────────────────────────────────────────────
  if (competitorPrice > 0) {
    if (competitorPrice > basePrice) {
      price *= 0.95;
      reasons.push({ factor: 'Competitive Pricing', impact: '-5%', description: `Priced below competitor (₹${Math.floor(competitorPrice)}) for better value`, icon: '💡', type: 'decrease' });
      breakdown.push({ label: 'Market Comparison', value: Math.floor(price), multiplier: 0.95 });
    } else {
      price *= 1.05;
      reasons.push({ factor: 'Premium Market Position', impact: '+5%', description: `Above competitor (₹${Math.floor(competitorPrice)}), reflecting premium quality`, icon: '🏆', type: 'increase' });
      breakdown.push({ label: 'Market Comparison', value: Math.floor(price), multiplier: 1.05 });
    }
  }

  // ── CLAMP to 50%–300% of base ──────────────────────────────────────────────
  price = Math.max(price, basePrice * 0.50);
  price = Math.min(price, basePrice * 3.00);
  price = Math.floor(price);

  const totalMultiplier = basePrice > 0 ? price / basePrice : 1;
  const percentChange   = Math.round((totalMultiplier - 1) * 100);

  return {
    finalPrice: price,
    basePrice: Math.floor(basePrice),
    reasons,
    breakdown,
    totalMultiplier: Math.round(totalMultiplier * 100) / 100,
    percentChange,
    pricingFactors: { season, demand, occupancyRate, isWeekend, localEvent, temperature, competitorPrice },
  };
}

module.exports = calculateDynamicPrice;
