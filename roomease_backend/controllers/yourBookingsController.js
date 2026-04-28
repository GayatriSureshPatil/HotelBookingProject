const db = require("../database/connection");
const nodemailer = require("nodemailer");
require("dotenv").config();

exports.getYourBookings = (req, res) => {
  const { guestId } = req.query;
  const sqlQuery = "SELECT * FROM bookings WHERE GuestID = ? AND deleted_status = 'active'";

  db.query(sqlQuery, [guestId], (err, results) => {
    if (err) {
      console.error("Database query failed:", err.message);
      res.status(500).json({ status: "fail", message: "Database query failed" });
    } else {
      res.status(200).json({ status: "success", requestedAt: req.requestTime, data: results });
    }
  });
};

exports.deleteBooking = (req, res) => {
  const { bookingId } = req.body;

  if (!bookingId) {
    return res.status(400).json({ status: "fail", message: "Booking ID is required" });
  }

  const sqlQuery = "UPDATE bookings SET deleted_status = 'deleted' WHERE BookingID = ?";

  db.query(sqlQuery, [bookingId], (err, results) => {
    if (err) {
      console.error("Database query failed:", err.message);
      return res.status(500).json({ status: "fail", message: "Database query failed" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ status: "fail", message: "Booking not found" });
    }

  // Updated query with join
const fetchEmailQuery = `
SELECT g.GuestEmail, b.RoomNo 
FROM bookings b 
JOIN guest g ON b.GuestID = g.GuestID 
WHERE b.BookingID = ?
`;

db.query(fetchEmailQuery, [bookingId], (err, result) => {
if (err) {
  console.error("Failed to fetch guest email:", err.message);
} else if (result.length > 0) {
  const guestEmail = result[0].GuestEmail;
  const roomNo = result[0].RoomNo;

  // nodemailer setup
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Manager email
  const mailOptionsToManager = {
    from: process.env.EMAIL,
    to: process.env.EMAIL,
    subject: "Booking Cancellation Notice",
    text: `Booking with ID ${bookingId} for Room No. ${roomNo} has been cancelled.`,
  };

  // User email
  const mailOptionsToUser = {
    from: process.env.EMAIL,
    to: guestEmail,
    subject: "Booking Cancellation Approved",
    text: `Your booking (ID: ${bookingId}) has been successfully cancelled. You will be refunded within the next 4 days.`,
  };

  // Send emails
  transporter.sendMail(mailOptionsToManager, (error, info) => {
    if (error) {
      console.error("Error sending email to manager:", error.message);
    } else {
      console.log("Email sent to hotel manager:", info.response);
    }
  });

  transporter.sendMail(mailOptionsToUser, (error, info) => {
    if (error) {
      console.error("Error sending email to guest:", error.message);
    } else {
      console.log("Email sent to guest:", info.response);
    }
  });
}
});


    res.status(200).json({
      status: "success",
      message: "Booking deleted successfully",
      requestedAt: req.requestTime,
    });
  });
};
