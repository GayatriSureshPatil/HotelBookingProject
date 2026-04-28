const express = require("express");
const morgan = require("morgan"); // Third Party MiddleWare
const app = express();


app.use(express.json());
const cors = require('cors');
app.use(express.json());  // Ensure JSON parsing is enabled



// Enable CORS for all routes
app.use(cors());

const roomRouter = require("./routes/roomsRoute");
const saveBookingRouter = require("./routes/saveBookingRoute");
const paymentRoutes = require("./routes/paymentRoutes");
const yourBookingsRouter = require("./routes/yourBookingsRoute");
const meetsBooking = require("./routes/meetsBooking");
const reviews = require("./routes/reviewsRoutes");
const verify = require("./routes/verifyRoutes");
const pricingRouter   = require("./routes/pricingRoute");
const sentimentRouter = require("./routes/sentimentRoute");


// MIDDLEWARE
app.use(morgan("dev"));

// CURRENT DATE
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString().split("T")[0];
  next();
});

// Routes (Middleware (Mounting a router))
app.use("/ramkrishna/lodging/rooms", roomRouter);
app.use("/ramkrishna/lodging/bookings", saveBookingRouter);
app.use("/ramkrishna/lodging", paymentRoutes);
app.use("/ramkrishna/lodging/yourbookings", yourBookingsRouter);
app.use("/ramkrishna/meets", meetsBooking);
app.use("/ramkrishna", reviews);
app.use("/ramkrishna/verify", verify);
app.use("/ramkrishna/lodging/pricing", pricingRouter);
app.use("/ramkrishna/sentiment",       sentimentRouter);


module.exports = app;
