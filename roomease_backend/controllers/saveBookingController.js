const axios = require("axios");
const Razorpay = require("razorpay");
const db = require("../database/connection");
require("dotenv").config();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET;

exports.saveBookings = async (req, res) => {
  const { guestDetails, bookingDetails, paymentDetails } = req.body;

  // Check if all required details are provided
  if (!guestDetails || !bookingDetails || !paymentDetails) {
    return res.status(400).json({ error: "Guest details, booking, and payment details are required." });
  }

  const { GuestId, GuestFName, GuestLName, GuestEmail, GuestContactNo, GuestAddress, GuestCity } = guestDetails;
  const { checkInDate, checkOutDate, roomNo, adults = 0, children = 0 } = bookingDetails;
  const { razorpay_payment_id, paymentAmount, paymentStatus = "Success" } = paymentDetails;

  function formatDateLocal(input) {
    const date = new Date(input);
    if (isNaN(date)) {
      throw new Error("Invalid date passed to formatDateLocal: " + input);
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  const checkIn = formatDateLocal(new Date(checkInDate)+1);
const checkOut = formatDateLocal(new Date(checkOutDate));
console.log("check in date", checkIn);



//   const checkInDateObj = new Date(checkInDate);
// checkInDateObj.setDate(checkInDateObj.getDate() + 1);

// const checkOutDateObj = new Date(checkOutDate);
// checkOutDateObj.setDate(checkOutDateObj.getDate() + 1);

  // Validate if roomNo is provided
  if (!roomNo) {
    console.error("Error: Room number is missing in payload", bookingDetails);
    return res.status(400).json({ error: "Room number is required." });
  }

  try {
    // Fetch payment details from Razorpay API using razorpay_payment_id
    const authHeader = `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_SECRET}`).toString('base64')}`;

    const razorpayResponse = await axios.get(
      `https://api.razorpay.com/v1/payments/${razorpay_payment_id}`,
      {
        headers: {
          Authorization: authHeader,
        },
      }
    );

    // Extract payment method from the response
    const paymentMethod = razorpayResponse.data?.method || "Unknown";

    // SQL queries to insert guest, booking, and payment details
    // const guestQuery = `INSERT INTO guest (GuestFName, GuestLName, GuestContactNo, GuestEmail, GuestAddress, GuestCity) VALUES (?, ?, ?, ?, ?, ?)`;
    const guestUpdateQuery = `UPDATE guest SET GuestFName = ?, GuestLName = ?, GuestContactNo = ?, GuestEmail = ?, GuestAddress = ?, GuestCity = ? WHERE GuestID = ?`;
    const bookingQuery = `INSERT INTO bookings (BookingDate, CheckinDate, CheckOutDate, GuestID, RoomNo, Adult, Child, total_amt) VALUES (NOW(), ?, ?, ?, ?, ?, ?, ?)`;
    const paymentQuery = `INSERT INTO payments (PaymentMethod, PaymentAmount, PaymentStatus, razorpay_payment_id, BookingID) VALUES (?, ?, ?, ?, ?)`;

    db.beginTransaction((err) => {
      if (err) {
        console.error("Error starting transaction:", err);  
        return res.status(500).json({ error: "Transaction failed to start" });
      }

      // Insert guest details
      db.query(
        guestUpdateQuery,
        [GuestFName, GuestLName, GuestContactNo, GuestEmail, GuestAddress, GuestCity, GuestId],
        (err, result) => {
          if (err) {
            console.error("Error inserting guest details:", err); 
            return db.rollback(() => {
              res.status(500).json({ error: "Failed to insert guest details" });
            });
          }

          const guestID = result.insertId;

          // Insert booking details
          db.query(
            bookingQuery,
            [checkIn, checkOut, GuestId, roomNo, adults, children, paymentAmount],
            (err, result) => {
              if (err) {
                console.error("Error inserting booking details:", err); 
                return db.rollback(() => {
                  res.status(500).json({ error: "Failed to insert booking details" });
                });
              }

              const bookingID = result.insertId;

              // Insert payment details
              db.query(
                paymentQuery,
                [paymentMethod, paymentAmount, paymentStatus, razorpay_payment_id, bookingID],
                (err, result) => {
                  if (err) {
                    console.error("Error inserting payment details:", err); 
                    return db.rollback(() => {
                      res.status(500).json({ error: "Failed to insert payment details" });
                    });
                  }

                  const paymentID = result.insertId;
                  console.log("Auto-incremented PaymentID:", paymentID);

                  // Commit transaction
                  db.commit((err) => {
                    if (err) {
                      console.error("Error committing transaction:", err); 
                      return db.rollback(() => {
                        res.status(500).json({ error: "Failed to commit transaction" });
                      });
                    }

                    // Send success response
                    res.status(200).json({
                      message: "Booking, payment, and guest details saved successfully.",
                      GuestId,
                      bookingID,
                      paymentID,
                      razorpayPaymentID: razorpay_payment_id,
                      paymentMethod,
                    });
                  });
                }
              );
            }
          );
        }
      );
    });
  } catch (error) {
    console.error("Error fetching payment details from Razorpay:", error.response ? error.response.data : error);
    return res.status(500).json({ error: "Failed to fetch payment details from Razorpay.", details: error.message });
  }
};

const razorpay = new Razorpay({
key_id: RAZORPAY_KEY_ID,
key_secret: RAZORPAY_SECRET,
});
exports.getInvoiceNo = async (req, res) => {

  const { name, email, contact, amount } = req.body;

  const invoiceData = {
    type: "invoice",
    description: "Invoice for Test Payment",
    customer: { name, email, contact },
    line_items: [
      {
        name: "Test Product",
        description: "Product Description",
        amount: amount * 100, // Convert to paisa
        currency: "INR",
        quantity: 1,
      },
    ],
    sms_notify: 1,
    email_notify: 1,
    receipt: `INV_${Date.now()}`,
    expire_by: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days expiry
  };

  try {
    const invoice = await razorpay.invoices.create(invoiceData);
    res.json({ invoiceId: invoice.id, invoiceUrl: invoice.short_url });
  } catch (error) {
    res.status(500).send(error);
  }

};