const express = require("express");
const axios = require("axios");
require('dotenv').config();


const router = express.Router();

// Endpoint to fetch payment method for a given paymentId
router.get("/getPaymentMethod", async (req, res) => {
  const { paymentId } = req.query;

  if (!paymentId) {
    return res.status(400).json({ error: "Payment ID is required" });
  }

  try {
    // Log paymentId to verify it's being passed correctly
    console.log("Fetching payment details for Razorpay Payment ID:", paymentId);
    
    const response = await axios.get(
      `https://api.razorpay.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_SECRET}`
          ).toString("base64")}`,
        },
      }
    );
  
    // Log the response from Razorpay
    console.log("Razorpay Response:", response.data);
  
    const paymentMethod = response.data?.method || "Unknown";  // Extract the payment method
    res.status(200).json({ paymentMethod });
  } catch (error) {
    console.error("Error fetching payment method from Razorpay:", error.response ? error.response.data : error.message);
    res.status(500).json({
      error: "Failed to fetch payment method",
      details: error.response ? error.response.data : error.message,
    });
  }
  
});

module.exports = router;
