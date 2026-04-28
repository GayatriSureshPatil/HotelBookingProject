const express = require("express");
const morgan = require("morgan");

// Controller
const reviewsController = require("../controllers/reviewsController");

const router = express.Router();

// router.route("/").get(yourBookingsController.getYourBookings);
// router.route("/deletebooking").post(yourBookingsController.deleteBooking);
router.route("/reviews").post(reviewsController.submitReviews);
router.route("/upload-csv").post(reviewsController.submitCSV);
router.route("/reviews").get(reviewsController.getReviews);

module.exports = router;