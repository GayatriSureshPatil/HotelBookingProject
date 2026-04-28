const express = require("express");
const morgan = require("morgan");

// Controller
const meetsBookingController = require("../controllers/meetsBookingController");

const router = express.Router();

router.route("/plan-event").post(meetsBookingController.planEvents);
// router.route("/getPaymentMethod").get(meetsBookingController.getPaymentMethod);
router.route("/confirm-booking").post(meetsBookingController.confirmBooking);

module.exports = router;