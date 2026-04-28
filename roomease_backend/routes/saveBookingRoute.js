const express = require("express");
const router = express.Router();
const saveBookingController = require("../controllers/saveBookingController");

// Ensure this handles POST requests
router.post("/saveBooking", saveBookingController.saveBookings);
router.post("/create-invoice", saveBookingController.getInvoiceNo);

module.exports = router;
