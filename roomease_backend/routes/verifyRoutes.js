const express = require("express");
const morgan = require("morgan");
const { body, validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Controller
const verifyController = require("../controllers/verifyController");

const router = express.Router();

router.route("/send-otp").post(verifyController.sendOtp);
router.route("/resend-otp").post(verifyController.resendOtp);
router.route("/verify-otp").post(verifyController.verifyOtp);
router.route("/signup").post(verifyController.signup);
router.route("/login").post(verifyController.login);

module.exports = router;