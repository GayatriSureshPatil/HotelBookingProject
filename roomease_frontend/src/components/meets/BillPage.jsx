import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./Bill.css";

const BillPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { invoiceNumber, paymentDetails, eventDetails, customerDetails } =
    location.state || {};

  if (!paymentDetails || !eventDetails || !customerDetails) {
    return <h2>Error: Missing booking details</h2>;
  }

  const [paymentMethod, setPaymentMethod] = useState("Fetching...");

  console.log("Payment Details:", paymentDetails);
  const venueTitle = eventDetails?.venueTitle || "Unknown Venue";
  console.log("Event Details received:", eventDetails); // Debugging

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const eventPrice = parseFloat(eventDetails.price) || 0;
  const subTotal = eventPrice;
  const tax = subTotal * 0.1; // 10% tax
  const total = subTotal + tax;

  // Generate a random invoice number
  const [invoiceNo, setInvoiceNo] = useState(invoiceNumber);

  const { razorpay_payment_id: razorpayPaymentId } = paymentDetails;

  // useEffect(() => {
  //   const randomInvoice = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
  //   setInvoiceNo(randomInvoice);
  // }, []);
  localStorage.removeItem("hallDetails");

  useEffect(() => {
    const isBookingConfirmed = localStorage.getItem(
      `bookingConfirmed_${invoiceNumber}`
    );

    if (invoiceNumber && !isBookingConfirmed) {
      handleConfirmBooking();
      localStorage.setItem(`bookingConfirmed_${invoiceNumber}`, "true");
    }
  }, [invoiceNumber]);

  // Fetch payment method from the backend
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

  const handleConfirmBooking = () => {
    setIsButtonDisabled(true); // Disable button on click
    fetch("http://localhost:8000/ramkrishna/meets/confirm-booking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentDetails,
        paymentMethod,
        customerDetails,
        eventDetails,
        invoiceNumber, // Send invoice number with request
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Booking confirmed successfully") {
          alert("Booking confirmed!");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        //alert("Error confirming booking");
      });
  };

  // const handleDownloadPDF = () => {
  //   const billContainer = document.querySelector(".bill-container"); // Capture only the bill section

  //   // Hide buttons before capturing
  //   const elementsToHide = document.querySelectorAll(".hide-in-pdf");
  //   elementsToHide.forEach((el) => (el.style.display = "none"));

  //   // Wait for the DOM to update before capturing
  //   setTimeout(() => {
  //     html2canvas(billContainer, {
  //       scale: 3, // Higher scale for better quality
  //       useCORS: true,
  //       backgroundColor: "#fff", // Ensures white background
  //     }).then((canvas) => {
  //       // Convert canvas to image
  //       const imgData = canvas.toDataURL("image/png");

  //       // Initialize jsPDF (Portrait, A4 size)
  //       const pdf = new jsPDF("p", "mm", "a4");
  //       const pdfWidth = pdf.internal.pageSize.getWidth();
  //       const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  //       // Add image to PDF
  //       pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight - 20);
  //       pdf.save(`invoice_${invoiceNumber}.pdf`);

  //       // Restore hidden elements after screenshot
  //       elementsToHide.forEach((el) => (el.style.display = "block"));
  //     });
  //   }, 100); // Small delay to ensure everything is rendered
  // };

  const handleDownloadPDF = () => {
    const billContainer = document.querySelector(".bill-details"); // Capture only the bill details section

    if (!billContainer) {
      console.error("Bill details container not found.");
      return;
    }

    // Hide elements before capturing
    const elementsToHide = document.querySelectorAll(".hide-in-pdf");
    elementsToHide.forEach((el) => (el.style.display = "none"));

    setTimeout(() => {
      html2canvas(billContainer, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        backgroundColor: "#fff", // Ensures white background
      }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");

        // Initialize jsPDF (Portrait, A4 size)
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight - 20);
        pdf.save(`invoice_${invoiceNumber}.pdf`);

        // Restore hidden elements after screenshot
        elementsToHide.forEach((el) => (el.style.display = "block"));
      });
    }, 100); // Small delay to ensure everything is rendered
  };

  return (
    <div className="bill-container">
      {/* Background Image with Hotel Name */}
      <div className="bill-header">
        <div className="background-image">
          <div className="overlay">
            <h2 className="hotel-name">Room Ease</h2>
            <p className="hotel-address">
              123 Flavor Lane, Culinary Heights, Mumbai, Maharashtra, 400001,
              India
            </p>
            <p className="hotel-contact">+91-123-1234-5678</p>
          </div>
        </div>
      </div>

      <div className="bill-details">
        {/* Customer & Invoice Details */}
        <div className="invoice-header">
          <div className="text-left">
            <h2 className="meets-bill-h2">Invoice To:</h2>
            <p className="text-left-p">
              {customerDetails.GuestFName} {customerDetails.GuestLName}
            </p>
            <p className="text-left-p">{customerDetails.GuestContactNo}</p>
            <p className="text-left-p">{customerDetails.GuestEmail}</p>
          </div>
          <div className="text-right">
            <p>
              <strong>Invoice No:</strong> {invoiceNumber}
            </p>
            {/* <p>
              <strong>Razorpay Id:</strong> {razorpayPaymentId}
            </p> */}
            <p>
              <strong>Invoice Date:</strong> {new Date().toLocaleDateString()}
            </p>
            <p>
              <strong>Company Name:</strong> {customerDetails.companyName}
            </p>
            <p>
              <strong>Event Date:</strong> {eventDetails.eventDate}
            </p>
          </div>
        </div>

        {/* Order Details Table */}
        <table className="invoice-table">
          <thead>
            <tr>
              <th>DESCRIPTION</th>
              <th>PRICE</th>
              <th>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{venueTitle} (1 day)</td>
              <td>{eventPrice.toFixed(2)}</td>
              <td>{eventPrice.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <hr className="custom-hr" />

        {/* Billing Summary */}
        <div className="pricing">
          <p>
            <strong>SUB TOTAL</strong> <span>{subTotal.toFixed(2)}</span>
          </p>
          <p>
            <strong>TAX (10%)</strong> <span>{tax.toFixed(2)}</span>
          </p>
          <p className="total-payable">
            <strong>TOTAL</strong> <strong>{total.toFixed(2)}</strong>
          </p>

          <hr className="custom-hr" />

          <p>
            <strong>PAYMENT METHOD</strong>
            {paymentMethod || "Not Available"}
          </p>

          <hr className="custom-hr" />
        </div>

        <p className="billpage-thanks">
          We appreciate your visit and look forward to welcoming you again..!
        </p>
        <button onClick={handleDownloadPDF} className="hide-in-pdf">
          Download Invoice
        </button>
      </div>
    </div>
  );
};

export default BillPage;
