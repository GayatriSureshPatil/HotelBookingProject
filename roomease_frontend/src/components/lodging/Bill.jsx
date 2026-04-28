import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import axios from "axios";
import "../../styles/bill.css";
import html2canvas from "html2canvas";

const Bill = () => {
  const location = useLocation();
  const { invoiceNumber, paymentDetails, roomDetails, guestDetails } =
    location.state || {};

  console.log("invoice number", invoiceNumber);

  const [paymentMethod, setPaymentMethod] = useState("Fetching...");
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false); // ✅ Popup state
  const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(false); // ✅ Disable Save Button
  // const [invoiceNumber, setInvoiceNumber] = useState();
  const [invoiceNo, setInvoiceNo] = useState(invoiceNumber);

  if (!paymentDetails || !roomDetails || !invoiceNumber) {
    return <p>Loading...</p>;
  }
  localStorage.removeItem("roomSelectedData");
  console.log(guestDetails);
  localStorage.setItem("user", JSON.stringify(guestDetails));

  useEffect(() => {
    const isRoomBookingConfirmed = localStorage.getItem(
      `RoomBookingConfirmed_${invoiceNumber}`
    );

    if (invoiceNumber && !isRoomBookingConfirmed) {
      handleSave();
      localStorage.setItem(`RoomBookingConfirmed_${invoiceNumber}`, "true");
    }
  }, [invoiceNumber]);

  useEffect(() => {
    if (paymentDetails?.razorpay_payment_id) {
      axios
        .get("http://localhost:8000/ramkrishna/lodging/getPaymentMethod", {
          params: { paymentId: paymentDetails.razorpay_payment_id },
        })
        .then((response) => {
          console.log(response);
          setPaymentMethod(response.data.paymentMethod || "Unknown");
        })
        .catch((error) => {
          console.error("Error fetching payment method:", error);
          setPaymentMethod("Error Fetching Method");
        });
    }
  }, [paymentDetails]);

  const {
    room_no: roomNo,
    room_category: category,
    price: rate,
    checkInDate,
    checkOutDate,
    adults,
    children,
  } = roomDetails;

  const { razorpay_payment_id: razorpayPaymentId } = paymentDetails;

  const {
    GuestFName: firstName,
    GuestLName: lastName,
    GuestContactNo: contactNo,
    GuestEmail: guestEmail,
    GuestAddress: guestAddress,
    GuestCity: guestCity,
  } = guestDetails;

  const checkIn = new Date(checkInDate);
  console.log("checkIn", checkIn);
  const checkOut = new Date(checkOutDate);
  const daysStayed = Math.max((checkOut - checkIn) / (1000 * 60 * 60 * 24), 1);
  const totalAmount = rate * daysStayed;
  const currentDate = new Date().toLocaleString();

  const handleSave = async () => {
    const payload = {
      guestDetails,
      bookingDetails: {
        checkInDate: checkIn,
        checkOutDate: checkOut,
        roomNo,
        adults,
        children,
      },
      paymentDetails: {
        razorpay_payment_id: razorpayPaymentId,
        paymentMethod,
        paymentAmount: totalAmount,
      },
    };

    console.log("Sending payload:", payload);

    try {
      const response = await axios.post(
        "http://localhost:8000/ramkrishna/lodging/bookings/saveBooking",
        payload
      );

      if (response.status === 200) {
        setIsSaved(true);
        setIsSaveButtonDisabled(true); // ✅ Disable Save button after success
        setShowPopup(true); // ✅ Show popup on success
        setTimeout(() => setShowPopup(false), 3000); // ✅ Hide popup after 3s
      } else {
        setError("Failed to save data.");
      }
    } catch (err) {
      console.error("Save Error:", err.response?.data || err);
      setError("Failed to save booking details.");
    }
  };

  const handleDownloadPDF = () => {
    const billElement = document.querySelector(".bill_myroom-container");

    html2canvas(billElement, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("invoice.pdf");
    });
  };

  return (
    <div className="bill_myroom-container">
      <h2 className="bill_myroom-title">RAMKRISHNA LODGING</h2>
      <p className="bill_myroom-address" style={{ textAlign: "center" }}>
        123 Flavor Lane, Culinary Heights, Mumbai, Maharashtra, 400001, India
        <br />
        +91-123-1234-5678
      </p>

      <div className="bill_myroom-section">
        <div className="bill_myroom-info">
          <h3>Invoice To: {invoiceNumber}</h3>
          <p>
            Customer Name: {firstName} {lastName}
          </p>
          <p>Email: {guestEmail}</p>
          <p>Contact: {contactNo}</p>
          <p>Address: {guestAddress}</p>
          <p>City: {guestCity}</p>
          <p>Check-In-Date: {new Date(checkInDate).toLocaleDateString()}</p>
        </div>

        <div className="bill_myroom-room-info">
          <h3>Room Info:</h3>
          <p>Room No: {roomNo}</p>
          <p>Room Category: {category}</p>
          <p>Room Rate (per day): ₹{rate}</p>
          <p>Adults: {adults}</p>
          <p>Children: {children}</p>
          <p>Days Stayed: {daysStayed}</p>
        </div>
      </div>

      <div className="bill_myroom-payment">
        <h3 style={{ fontSize: "24px" }}>Payment Details</h3>
        <table>
          <tbody>
            <tr>
              <td>Razorpay Payment ID:</td>
              <td>{razorpayPaymentId}</td>
            </tr>
            <tr>
              <td>Payment Method:</td>
              <td>{paymentMethod.toUpperCase()}</td>
            </tr>
            <tr>
              <td>Date & Time:</td>
              <td>{currentDate}</td>
            </tr>
            <tr>
              <td>Total Amount:</td>
              <td>₹{totalAmount}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="bill_myroom-footer">
        <p style={{ fontSize: "14px" }}>
          We appreciate your visit & look forward to welcoming you again!
        </p>
        {/* <button
          className="bill_myroom-save-btn"
          onClick={handleSave}
          disabled={isSaveButtonDisabled} // ✅ Disable Save button after clicked
        >
          Save
        </button> */}
        <button
          className="bill_myroom-download-btn"
          onClick={handleDownloadPDF} // ✅ Disabled until saved
        >
          Download
        </button>
      </div>

      {/* ✅ Success Popup Notification */}
      {showPopup && (
        <div className="bill_myroom_popup">✔ Booking saved successfully!</div>
      )}
    </div>
  );
};

export default Bill;
