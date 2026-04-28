const db = require("../database/connection");
const { body, validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
require("dotenv").config();
let otpStore = {}; // In-memory OTP store
// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD, // Use app-specific password
  },
  tls: {
    rejectUnauthorized: false,
  },
});
// Function to send OTP email
const sendOtpEmail = (email, otp, res) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Your OTP for Login",
    text: `Your OTP is: ${otp}`,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ message: "Error sending OTP." });
    }
    res.status(200).json({ success: true, message: "OTP sent to your email!" });
  });
};
exports.sendOtp = (req, res) => {
  const { email } = req.body;
  // Validate if the email exists in the database
  const query = "SELECT * FROM guest WHERE GuestEmail = ?";
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error!" });
    }
    if (results.length === 0) {
      return res.status(400).json({ message: "Email not registered!" });
    }
    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Save OTP with email in memory
    otpStore[email] = otp;
    // Send OTP to the provided email address
    sendOtpEmail(email, otp, res);
  });
}
exports.resendOtp = (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required!" });
  }
  // Validate if the email exists in the database
  const query = "SELECT * FROM guest WHERE GuestEmail = ?";
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error!" });
    }
    if (results.length === 0) {
      return res.status(400).json({ message: "Email not registered!" });
    }
    // Generate a new random 6-digit OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    // Store the new OTP in memory
    otpStore[email] = newOtp;
    // Resend the OTP
    sendOtpEmail(email, newOtp, res);
  });
}
exports.verifyOtp = (req, res) => {
  const { email, otp } = req.body;
  if (otpStore[email] && otpStore[email] === otp) {
    delete otpStore[email]; // Delete OTP after successful verification
    // Fetch user details from the database
    const query = "SELECT * FROM guest WHERE GuestEmail = ?";
    db.query(query, [email], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error!" });
      }
      if (results.length === 0) {
        return res.status(400).json({ message: "User not found!" });
      }
      const userDetails = results[0]; // Extract user details
      return res.status(200).json({
        success: true,
        message: "OTP verified successfully!",
        user: userDetails, // Send user details
      });
    });
  } else {
    res.status(400).json({ message: "Invalid OTP. Please try again." });
  }
};
exports.signup = (req, res) => {
  const { firstName, lastName, contactNumber, emailAddress, companyName, address, city } = req.body;
  // Check if the email already exists
  const checkQuery = "SELECT * FROM guest WHERE GuestEmail = ?";
  db.query(checkQuery, [emailAddress], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error!" });
    }
    if (results.length > 0) {
      return res.status(409).json({ message: "User is already registered. Please log in." });
    }
    // If email does not exist, insert the new user
    const insertQuery = "INSERT INTO guest (GuestFName, GuestLName, GuestContactNo, GuestEmail, CompanyName, GuestAddress, GuestCity) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(insertQuery, [firstName, lastName, contactNumber, emailAddress, companyName, address, city], (insertErr, result) => {
      if (insertErr) {
        console.error("Error inserting data:", insertErr);
        return res.status(500).json({ message: "Database error" });
      }
      res.status(200).json({ message: "User registered successfully!" });
    });
  });
}
exports.login = (req, res) => {
  const { email, otp } = req.body;
  if (!otpStore[email]) {
    return res.status(400).json({ message: "Please request an OTP first!" });
  }
  // Verify the OTP
  if (otpStore[email] !== otp) {
    return res.status(400).json({ message: "Invalid OTP!" });
  }
  // If OTP is valid, check if the email exists in the database
  const query = "SELECT * FROM guest WHERE GuestEmail = ?";
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error!" });
    }
    if (results.length === 0) {
      return res.status(401).json({ message: "Email not registered!" });
    }
    delete otpStore[email]; // Clear OTP after successful login
    res.status(200).json({ success: true, message: "Login successful!", user: results[0] });
  });
}