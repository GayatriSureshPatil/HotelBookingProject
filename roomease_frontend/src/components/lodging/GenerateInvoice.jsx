import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/invoice.css";

const GenerateInvoice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { roomDetails, totalPrice } = location.state || {}; // Fetch total price and room details from the passed state
  const user = 0;

  const handlePayment = () => {
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(
      now.getMonth() + 1
    ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(
      now.getHours()
    ).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(
      now.getSeconds()
    ).padStart(2, "0")}`;

    // Create invoice number with timestamp and random suffix
    const invoiceNumber = `INV-${timestamp}-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`;

    if (!totalPrice || !roomDetails) {
      alert("Room details is missing. Please go back and try again.");
      return;
    }

    const options = {
      key: "rzp_test_ypUZQmsPpyZrAR", // Razorpay key from environment
      amount: totalPrice * 100, // Convert total price to paise (smallest currency unit)
      currency: "INR",
      name: "Hotel Management",
      description: "Room Payment",
      image: "https://example.com/logo.png", // Optional: Replace with your logo URL
      handler: (response) => {
        navigate("/bill", {
          state: {
            invoiceNumber,
            paymentDetails: response,
            roomDetails: roomDetails,
            // Pass room details for the bill
          },
        });
      },
      prefill: {
        name: "Customer Name", // Replace with customer's name
        email: "customer@example.com", // Replace with customer's email
        contact: "9999999999", // Replace with customer's phone number
      },
      notes: {
        address: "Hotel Management System",
      },
      theme: {
        color: "#c69963", // Customize Razorpay form color
      },
      modal: {
        ondismiss: () => {
          alert("Payment process was cancelled by the user.");
        },
      },
      method: {
        netbanking: true,
        card: true,
        upi: true,
        wallet: true,
        emi: true,
        paylater: true,
      },
    };

    const rzp = new window.Razorpay(options);

    // Handle payment failure
    rzp.on("payment.failed", (response) => {
      console.error("Payment failed:", response.error);
      alert(`Payment failed. Reason: ${response.error.description}`);
    });

    rzp.open();
  };

  return (
    <div className="invoice-container">
      <h2>Generate Invoice</h2>
      <p>
        Room Details: {roomDetails.roomNo} ({roomDetails.category})
      </p>
      <p>Total Price: ₹{totalPrice || "N/A"}</p>
      <button onClick={handlePayment}>Pay Now</button>
    </div>
  );
};

export default GenerateInvoice;
