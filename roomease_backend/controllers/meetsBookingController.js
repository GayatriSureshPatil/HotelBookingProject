const db = require("../database/connection");

exports.confirmBooking = (req, res) =>{
    
  console.log(req.body);
  
  const { paymentDetails,paymentMethod,
    customerDetails,
    eventDetails,
    invoiceNumber, } = req.body; 

    const { razorpay_payment_id, paymentAmount, paymentStatus = "Success" } = paymentDetails;

    console.log('paymentDetails',paymentDetails);
    console.log('cus',customerDetails);
    console.log('event',eventDetails);
    console.log('invoice',invoiceNumber);
    

  // if (!paymentDetails || !customerDetails || !eventDetails || !invoiceNumber) {
  //   return res.status(400).json({ message: "Invalid request or missing data" });
  // }


  // Insert guest data
  const guestQuery = `UPDATE guest SET GuestFName = ?, GuestLName = ?, GuestContactNo = ?, GuestEmail = ?, GuestAddress = ?, GuestCity = ?, CompanyName = ? WHERE GuestID = ?;`;
  const guestData = [
    customerDetails.GuestFName,
    customerDetails.GuestLName,
    customerDetails.GuestContactNo,
    customerDetails.GuestEmail,
    customerDetails.GuestAddress,
    customerDetails.GuestCity,
    customerDetails.CompanyName || "N/A", 
    customerDetails.GuestId
  ];

  db.query(guestQuery, guestData, (err, guestResult) => {
    if (err) {
      console.error("Error inserting guest data:", err);
      return res.status(500).json({ message: "Error inserting guest data", error: err });
    }

    const guestId = customerDetails.GuestId;
    const bookingDate = new Date().toISOString().split("T")[0];

    // Insert event booking data
    const eventQuery = `INSERT INTO event_book (BookingDate, EventTitle, EventDate, GuestID, HallID, Capacity, Price) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const eventData = [
      bookingDate,
      eventDetails.eventTitle,
      eventDetails.eventDate,
      guestId,
      eventDetails.hallId,
      eventDetails.capacity,
      eventDetails.price,
    ];
    
    db.query(eventQuery, eventData, (err, eventResult) => {
      if (err) {
        console.error("Error inserting event data:", err);
        return res.status(500).json({ message: "Error inserting event data", error: err });
      }

      const bookingId = eventResult.insertId;
      const paymentId = razorpay_payment_id;

      // Insert payment data
      const paymentQuery = `INSERT INTO payments (PaymentMethod, PaymentAmount, BookingID, PaymentStatus, PaymentDate,razorpay_payment_id) VALUES (?, ?, ?, ?, ?,?)`;
      const paymentData = [
        paymentMethod,
        eventDetails.price,
        bookingId,
        "Successful",
        new Date().toISOString().slice(0, 19).replace("T", " "),
        paymentId,
      
      ];

      db.query(paymentQuery, paymentData, (err) => {
        if (err) {
          console.error("Error inserting payment data:", err);
          return res.status(500).json({ message: "Error inserting payment data", error: err });
        }

        // Clear temporary data
        temporaryData = {};
        res.status(200).json({ message: "Booking confirmed successfully" });
      });
    });
  });
}

exports.planEvents = (req, res) =>{
    const {
        firstName,
        lastName,
        contactNumber,
        emailAddress,
        companyName,
        address,
        city,
        hallId,
        capacity,
        price,
        eventTitle,
        eventDate,
      } = req.body;
    
      // Store the data temporarily (or save to a temporary table)
      temporaryData = {
        firstName,
        lastName,
        contactNumber,
        emailAddress,
        companyName,
        address,
        city,
        hallId,
        capacity,
        price,
        eventTitle,
        eventDate,
      };
    
      res.status(200).json({ message: "Data collected successfully", data: temporaryData });
}

// exports.getPaymentMethod = (req, res) =>{
//     const paymentId = req.query.paymentId;

//   if (!paymentId) {
//       return res.status(400).json({ error: "Payment ID is required" });
//   }

//   // Simulate fetching payment method
//   const paymentMethod = "Credit Card";  // Replace with actual logic

//   res.json({ paymentMethod });
// }