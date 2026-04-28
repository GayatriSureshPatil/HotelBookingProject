const express = require("express");
const morgan = require("morgan");

// Controller
const yourBookingsController = require("../controllers/yourBookingsController");

const router = express.Router();

router.route("/").get(yourBookingsController.getYourBookings);
router.route("/deletebooking").post(yourBookingsController.deleteBooking);

module.exports = router;