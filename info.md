# RoomEase — Hotel Management System
## Project Documentation & Dynamic Pricing Implementation Guide

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Database Schema](#4-database-schema)
5. [API Endpoints](#5-api-endpoints)
6. [Dynamic Pricing Module](#6-dynamic-pricing-module)
7. [Sentiment Analysis Module](#7-sentiment-analysis-module)
8. [Setup & Running](#8-setup--running)

---

## 1. Project Overview

**RoomEase** is a full-stack hotel management system for **Ramkrishna Lodging**. Core features:

- Browse and filter rooms by guest capacity
- Room booking with date-picker (unavailable dates blocked in real time)
- Online payment via **Razorpay** with PDF invoice download
- Banquet/event hall booking ("Meets")
- Guest reviews (1–5 stars)
- OTP-based email authentication
- **Dynamic Pricing** — room prices adjust automatically based on season, weekends,
  holidays, room demand, real-time occupancy, weather, and competitor rates

---

## 2. Tech Stack

| Layer      | Technology                                          |
|------------|-----------------------------------------------------|
| Frontend   | React 18 (Vite), React Router v6, Axios             |
| Styling    | Vanilla CSS (custom design system, Josefin Sans)    |
| Backend    | Node.js + Express.js                                |
| Database   | MySQL (mysql2 driver)                               |
| Payments   | Razorpay (payment orders + verification)            |
| Email Auth | Nodemailer (Gmail SMTP + OTP flow)                  |
| PDF Export | jsPDF + html2canvas                                 |
| Dev Tools  | nodemon (backend), Vite dev server (frontend)       |

---

## 3. Project Structure

```
g patil project/
├── info.md                                  ← This file
│
├── roomease_backend/
│   ├── controllers/
│   │   ├── calculateDynamicPrice.js         ← CORE pricing engine (pure function)
│   │   ├── pricingController.js             ← Pricing API: GET + PUT
│   │   ├── roomController.js                ← Rooms API (uses pricing engine)
│   │   ├── saveBookingController.js         ← Save booking + Razorpay
│   │   ├── meetsBookingController.js        ← Event hall bookings
│   │   ├── reviewsController.js             ← Guest reviews
│   │   ├── yourBookingsController.js        ← View / cancel bookings
│   │   └── verifyController.js              ← OTP email authentication
│   ├── routes/
│   │   ├── pricingRoute.js                  ← /ramkrishna/lodging/pricing
│   │   ├── roomsRoute.js                    ← /ramkrishna/lodging/rooms
│   │   ├── saveBookingRoute.js
│   │   ├── paymentRoutes.js
│   │   ├── yourBookingsRoute.js
│   │   ├── meetsBooking.js
│   │   ├── reviewsRoutes.js
│   │   └── verifyRoutes.js
│   ├── database/
│   │   ├── connection.js                    ← MySQL connection pool
│   │   └── schema.sql                       ← Table definitions + seed data
│   ├── src/
│   │   └── dynamic_pricing_data.json        ← Live pricing config (admin editable)
│   ├── index.js                             ← Express app + all route mounts
│   ├── server.js                            ← HTTP server (port 8000)
│   └── .env                                 ← DB creds, Razorpay keys, email creds
│
└── roomease_frontend/
    ├── src/
    │   ├── components/
    │   │   ├── lodging/
    │   │   │   ├── DynamicPricing.jsx       ← PricingBadge + PricingBreakdown
    │   │   │   ├── AdminPricingPanel.jsx    ← Floating admin control panel
    │   │   │   ├── Rooms.jsx                ← Room listing (shows badges)
    │   │   │   ├── SingleRoom.jsx           ← Room detail + breakdown panel
    │   │   │   ├── RoomDetails.jsx          ← Booking form + price summary
    │   │   │   ├── Bill.jsx                 ← Invoice/payment confirmation
    │   │   │   ├── YourBookings.jsx
    │   │   │   ├── Home.jsx
    │   │   │   └── GenerateInvoice.jsx
    │   │   ├── meets/                       ← Event booking components
    │   │   ├── login/                       ← Auth forms (Login, Signup, OTP)
    │   │   ├── NavBar.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── styles/
    │   │   ├── dynamic_pricing.css          ← All pricing UI styles
    │   │   ├── room_style.css
    │   │   ├── room_details.css
    │   │   ├── bill.css
    │   │   └── ...
    │   ├── App.jsx
    │   └── main.jsx
    └── public/assets/rooms/                 ← Room images (room101.jpg, etc.)
```

---

## 4. Database Schema

### `room` table (key columns)
| Column        | Type          | Notes                                              |
|---------------|---------------|----------------------------------------------------|
| id            | INT PK AI     |                                                    |
| room_no       | INT UNIQUE    | Room number (101, 201, 301 …)                      |
| room_category | VARCHAR(100)  | Standard / Deluxe / Suite                          |
| price         | DECIMAL(10,2) | **Base price only** — dynamic price calculated live|
| status        | VARCHAR(50)   | available / occupied                               |

> The DB always stores **base price**. Dynamic price is computed at request time and never written back.

### `bookings` table
| Column         | Type          | Notes                                   |
|----------------|---------------|-----------------------------------------|
| BookingID      | INT PK AI     |                                         |
| CheckinDate    | DATE          |                                         |
| CheckOutDate   | DATE          |                                         |
| GuestID        | INT FK        |                                         |
| RoomNo         | INT           |                                         |
| total_amt      | DECIMAL(10,2) | Dynamic price × nights (actual charged) |
| deleted_status | ENUM          | active / deleted                        |

### Other tables: `guest`, `payments`, `event_book`, `reviews`
See `database/schema.sql` for full definitions.

---

## 5. API Endpoints

### Rooms
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/ramkrishna/lodging/rooms` | All rooms with dynamic prices + pricingInfo |
| GET | `/ramkrishna/lodging/rooms/:roomno` | Single room + unavailable dates |

### Dynamic Pricing
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/ramkrishna/lodging/pricing` | Full breakdown per category + live occupancy |
| PUT | `/ramkrishna/lodging/pricing` | Admin: update pricing configuration |

**Sample GET /pricing response:**
```json
{
  "status": "success",
  "pricingData": { "season": "High", "isWeekend": true, ... },
  "breakdowns": {
    "Deluxe": {
      "finalPrice": 4726,
      "basePrice": 3000,
      "percentChange": 57,
      "reasons": [
        { "factor": "Peak Season", "impact": "+25%", "icon": "🌞", "type": "increase" },
        { "factor": "Weekend Pricing", "impact": "+10%", "icon": "🎉", "type": "increase" },
        { "factor": "Room Demand: 97%", "impact": "+24%", "icon": "📈", "type": "increase" }
      ],
      "breakdown": [
        { "label": "Base Price", "value": 3000, "multiplier": 1 },
        { "label": "Season Adjustment", "value": 3750, "multiplier": 1.25 },
        { "label": "Weekend Surcharge", "value": 4125, "multiplier": 1.10 }
      ]
    }
  },
  "occupancy": {
    "Deluxe":   { "total": 2, "booked": 1 },
    "Standard": { "total": 2, "booked": 2 },
    "Suite":    { "total": 1, "booked": 0 }
  }
}
```

### Bookings / Payments / Auth / Events / Reviews
See full list in `index.js` for all mounted routes.

---

## 6. Dynamic Pricing Module

### How It Works

Price is calculated by multiplying the base price through 7 sequential factors:

```
Final Price = Base × Season × Weekend × Event × Demand × Occupancy × Temperature × Market
             (clamped to 50% – 300% of base price)
```

The engine returns a full object with `finalPrice`, `basePrice`, `percentChange`, `reasons[]` (shown to customers), and `breakdown[]` (shown to admins).

---

### Pricing Factors

| # | Factor | Trigger | Multiplier | Impact |
|---|--------|---------|------------|--------|
| 1 | **Season** | High Season | ×1.25 | +25% |
| 1 | **Season** | Regular Season | ×1.00 | ±0% |
| 1 | **Season** | Low Season | ×0.85 | −15% |
| 2 | **Weekend** | Sat or Sun | ×1.10 | +10% |
| 3 | **Local Event / Holiday** | Event flag = true | ×1.15 | +15% |
| 4 | **Room Demand** | 0–100 per category | ×0.75 – ×1.25 | −25% to +25% |
| 5 | **Occupancy (live DB)** | ≥80% rooms booked | ×1.20 | +20% |
| 5 | **Occupancy (live DB)** | 60–79% rooms booked | ×1.10 | +10% |
| 5 | **Occupancy (live DB)** | 21–40% rooms booked | ×0.90 | −10% |
| 5 | **Occupancy (live DB)** | ≤20% rooms booked | ×0.80 | −20% |
| 6 | **Temperature** | ≤15°C | ×0.90 | −10% |
| 6 | **Temperature** | ≥35°C | ×0.85 | −15% |
| 7 | **Competitor Pricing** | Competitor > our base | ×0.95 | −5% |
| 7 | **Competitor Pricing** | Competitor < our base | ×1.05 | +5% |

**Demand formula:**
```
demandFactor = 0.75 + (demand / 100) × 0.50
demand=0 → ×0.75 (−25%)  |  demand=50 → ×1.00 (neutral)  |  demand=100 → ×1.25 (+25%)
```

---

### Pricing Engine — `calculateDynamicPrice.js`

Pure function signature:
```js
calculateDynamicPrice(roomType, basePrice, pricingData)
// Returns: { finalPrice, basePrice, percentChange, totalMultiplier, reasons[], breakdown[], pricingFactors }
```

**Key properties of the engine:**
- **Pure function** — no DB calls, no side effects, fully testable
- **Room-type-specific demand** — Deluxe, Standard, Suite tracked independently
- **Live occupancy injected** — `deluxe_occupancy_rate` computed from DB queries and passed in
- **Price safety clamp** — result always between 50% and 300% of base price

---

### Real-Time Occupancy (from DB)

The `roomController.js` and `pricingController.js` both run these queries before pricing:

```sql
-- Total rooms per category
SELECT room_category, COUNT(*) AS total FROM room GROUP BY room_category;

-- Currently checked-in bookings (today falls between checkin and checkout)
SELECT r.room_category, COUNT(b.BookingID) AS booked_count
FROM bookings b
JOIN room r ON b.RoomNo = r.room_no
WHERE b.deleted_status = 'active'
  AND CURDATE() BETWEEN b.CheckinDate AND b.CheckOutDate
GROUP BY r.room_category;
```

`occupancyRate = Math.round((booked / total) × 100)`

This rate is injected into the pricing data as `deluxe_occupancy_rate` etc. before calling the engine — so prices **automatically rise when most rooms are booked** and **automatically drop when many rooms are empty**.

---

### Admin Pricing API

**PUT /ramkrishna/lodging/pricing** — writes to `dynamic_pricing_data.json`:

```bash
curl -X PUT http://localhost:8000/ramkrishna/lodging/pricing \
  -H "Content-Type: application/json" \
  -d '{
    "season": "Low",
    "isWeekend": false,
    "localEvent": true,
    "temperature": 22,
    "competitorPrice": 2800,
    "deluxe_room_demand": 40,
    "standard_room_demand": 30,
    "suite_room_demand": 60
  }'
```

Changes apply to the **next request** — no restart needed.

---

### Frontend Integration

#### Where pricing is shown to customers:

**`Rooms.jsx` — Room Cards**
- Colored badge: `▲ 57% Dynamic Pricing` (red) or `▼ 12% Discounted` (green)
- Base price crossed out above the dynamic price

**`SingleRoom.jsx` — Room Detail Page**
- Full `PricingBreakdown` panel with all reasons (icons + descriptions) and step-by-step table
- Customer sees exactly why the price changed
- Collapsible with "Show price factors ▼" button

**`RoomDetails.jsx` — Booking Summary**
- Original rate shown struck through
- Dynamic rate with `+35% Dynamic` badge
- Compact "⚡ Why this price?" list of active reasons

#### Admin Panel — `AdminPricingPanel.jsx`

Floating `⚡ Pricing Admin` button on the Rooms page opens a modal showing:
- 📊 **Live occupancy bars** (red/yellow/green) per room category
- 🎛️ **Factor controls**: season selector, temperature, competitor price, demand (0–100 per category)
- **Toggle switches** for Weekend and Local Event/Holiday
- 💰 **Price breakdown table**: Base → Dynamic → % change → Top reason per category
- 💾 **Save button** — instantly writes to config file

---

### Files Changed Summary

**Backend (new/modified):**

| File | Change |
|------|--------|
| `controllers/calculateDynamicPrice.js` | **Rewritten** — returns full breakdown object |
| `controllers/pricingController.js` | **New** — GET + PUT pricing API |
| `controllers/roomController.js` | **Rewritten** — async/await, live occupancy, returns `pricingInfo` |
| `routes/pricingRoute.js` | **New** — route file for pricing endpoints |
| `index.js` | **Modified** — registers pricing route |
| `src/dynamic_pricing_data.json` | **Modified** — added holidays array + occupancy fields |

**Frontend (new/modified):**

| File | Change |
|------|--------|
| `components/lodging/DynamicPricing.jsx` | **New** — `PricingBadge` + `PricingBreakdown` components |
| `components/lodging/AdminPricingPanel.jsx` | **New** — Admin modal with live data |
| `styles/dynamic_pricing.css` | **New** — All pricing UI styles |
| `components/lodging/Rooms.jsx` | **Modified** — Badge + strikethrough + admin panel |
| `components/lodging/SingleRoom.jsx` | **Modified** — Full breakdown panel |
| `components/lodging/RoomDetails.jsx` | **Modified** — Reasons list + original price display |

---

## 7. Sentiment Analysis Module

The **Sentiment Analysis Module** automatically reads and evaluates guest reviews, providing hotel admins with deep insights into customer satisfaction without needing manual review. It works completely offline without any external APIs.

### Key Features
- **Keyword-based Engine**: Analyzes text using categorized keywords, handling negation (e.g., "not clean") and intensifiers (e.g., "very helpful").
- **Five Hotel Categories**: Evaluates reviews based on *Cleanliness, Staff, Food, Service, and Comfort*.
- **Star Rating Integration**: Balances the text sentiment with the numerical star rating given by the user.
- **Actionable Insights**: Generates recommendations based on the negative categories (e.g., if "Comfort" has negative sentiment, it suggests auditing room furniture).
- **Admin Dashboard**: A comprehensive visual dashboard at `/ramkrishna/admin/sentiment` displaying donut charts, top praised/complained keywords, category bars, and recent review summaries.

### Endpoints
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/ramkrishna/sentiment/reviews` | All reviews with attached sentiment data |
| POST | `/ramkrishna/sentiment/analyse` | Analyze a single text string on the fly |
| GET | `/ramkrishna/sentiment/insights` | Aggregate insights, scores, and frequencies for the admin dashboard |

---

## 8. Setup & Running

### Prerequisites
- Node.js ≥ 18, npm ≥ 9
- MySQL running locally
- Razorpay test account

### Database
```sql
-- In MySQL Workbench or CLI:
SOURCE roomease_backend/database/schema.sql;
```

### Backend `.env`
```
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_password
DB_NAME=ramkrishna_my
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_SECRET=your_razorpay_secret
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
PORT=8000
```

### Install & Run
```bash
# Backend (port 8000)
cd roomease_backend && npm install && npm test

# Frontend (port 5173)  
cd roomease_frontend && npm install && npm run dev
```

Visit: **http://localhost:5173**

### Quick Test — Dynamic Pricing
```bash
# Check current prices + breakdown
curl http://localhost:8000/ramkrishna/lodging/pricing | jq .

# Simulate Low season + lots of empty rooms
curl -X PUT http://localhost:8000/ramkrishna/lodging/pricing \
  -H "Content-Type: application/json" \
  -d '{"season":"Low","isWeekend":false,"standard_room_demand":20}'

# Prices should drop — verify:
curl http://localhost:8000/ramkrishna/lodging/rooms | jq '.data[].price'
```

---

*RoomEase Hotel Management System — Dynamic Pricing Module*
*Implemented April 2026*
