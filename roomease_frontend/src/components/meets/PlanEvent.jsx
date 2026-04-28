import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./PlanEvent.css";

const PlanEvent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const storedHallDetails =
    JSON.parse(localStorage.getItem("hallDetails")) || {};

  const {
    hallId = "Default Hall Id",
    capacity = "Default Capacity",
    price = "Default Price",
    venueTitle = "Default venue Title",
  } = storedHallDetails;

  const [user, setUser] = useState(() => {
    const savedData = localStorage.getItem("user");
    return savedData
      ? JSON.parse(savedData)
      : {
        firstName: "",
        lastName: "",
        contactNo: "",
        email: "",
        address: "",
        city: "",
      };
  });

  const formatDate = (date) => {
    const options = { month: "short", day: "2-digit", year: "numeric" };
    return new Intl.DateTimeFormat("en-US", options)
      .format(date)
      .replace(",", "");
  };

  // Save data to localStorage on change
  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(user));
  }, [user]);

  const currentDate = new Date();
  const formattedCurrentDate = formatDate(currentDate);

  const minEventDate = new Date();
  minEventDate.setDate(minEventDate.getDate() + 2);
  const minDate = minEventDate.toISOString().split("T")[0];

  const [eventDate, setEventDate] = useState(
    currentDate.toISOString().split("T")[0]
  );
  const [eventTitle, setEventTitle] = useState("");
  const [firstName, setFirstName] = useState(user.GuestFName);
  const [lastName, setLastName] = useState(user.GuestLName);
  const [contactNumber, setContactNumber] = useState(user.GuestContactNo);
  const [emailAddress, setEmailAddress] = useState(user.GuestEmail);
  const [companyName, setCompanyName] = useState(user.CompanyName);
  const [address, setAddress] = useState(user.GuestAddress);
  const [city, setCity] = useState(user.GuestCity);

  const handleDateChange = (e) => {
    setEventDate(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      eventTitle,
      eventDate,
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
    };

    console.log("Form Data Submitted:", formData);

    // handlePayment(); // Trigger Razorpay payment
  };

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

    const customerDetails = {
      GuestFName: firstName,
      GuestLName: lastName,
      GuestEmail: emailAddress,
      GuestContactNo: contactNumber,
      GuestAddress: address,
      GuestCity: city,
      CompanyName: companyName,
      GuestId: user.GuestId,
    };
    localStorage.setItem("user", JSON.stringify(customerDetails));

    const totalPrice = parseFloat(price) || 0; // Ensure price is a number
    const options = {
      key: "YOUR_RAZORPAY_KEY_ID_HERE", // TODO: Replace with your Razorpay Test Key ID
      amount: totalPrice * 100, // Convert total price to paise
      currency: "INR",
      name: "Room Ease",
      description: "Event Payment",
      image: "/assets/meets/main.jpg", // Replace with your logo URL
      handler: async (response) => {
        const paymentId = response.razorpay_payment_id;

        // // Fetch payment method from backend
        // const res = await fetch(
        //   `http://localhost:8000/ramkrishna/lodging/bookings/create-invoice`
        // );
        // const data = await res.json();
        // console.log(data);
        // // const paymentMethod = data;

        // Navigate to the bill page with payment and event details

        navigate("/ramkrishna/meets/Bill", {
          state: {
            invoiceNumber,
            paymentDetails: response,
            eventDetails: {
              eventTitle,
              eventDate,
              hallId,
              capacity,
              price,
              venueTitle,
            },
            customerDetails,
          },
        });
      },
      prefill: {
        name: `${firstName} ${lastName}`,
        email: emailAddress,
        contact: contactNumber,
      },
      notes: {
        address: "Hotel Management System",
      },
      theme: {
        color: "#c69963",
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

    rzp.on("payment.failed", (response) => {
      console.error("Payment failed:", response.error);
      alert(`Payment failed. Reason: ${response.error.description}`);
    });

    rzp.open();
    console.log("image", image);
  };

  function goToMeetsEvents() {
    navigate("/ramkrishna/meets");
  }

  return (
    <>
      {/* Event Planning Section */}
      <div className="main">
        <div className="plan-event-container">
          <form className="plan-event-form" onSubmit={handleSubmit}>
            <h1 className="plan-event-h1">Event Information</h1>
            <div className="form-row">
              <div className="form-group">
                <label>Hall Number</label>
                <input
                  className="input-field"
                  type="text"
                  value={hallId || "Hall Id"}
                  readOnly
                  required
                />
              </div>
              <div className="form-group">
                <label>Capacity</label>
                <input
                  className="input-field"
                  type="text"
                  value={capacity || "Capacity"}
                  readOnly
                  required
                />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input
                  className="input-field"
                  type="text"
                  value={price || ""}
                  readOnly
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group title-group">
                <label>Event Title</label>
                <input
                  className="input-field"
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Event Title"
                  required
                  pattern="[A-Za-z0-9\s]+" // Only alphanumeric characters and spaces
                  title="Event Title can only contain alphanumeric characters and spaces."
                />
              </div>
              <div className="form-group date-group">
                <label name="eventDate">Event Date:</label>
                <input
                  className="input-field"
                  type="date"
                  id="eventDate"
                  value={eventDate}
                  onChange={handleDateChange}
                  min={minDate}
                />
              </div>
            </div>
          </form>
          <form className="plan-event-form" onSubmit={handleSubmit}>
            <h1 className="plan-event-h1">Contact Information</h1>
            <p className="plan-event-text">
              Already a member?{" "}
              <Link to="/sign-in" className="sign-in-link">
                <strong>Sign-In</strong>
              </Link>{" "}
              for faster booking, or continue as a guest.
            </p>

            <div className="form-row">
              <div className="form-group">
                <label>*First Name</label>
                <input
                  className="input-field"
                  type="text"
                  value={user.GuestFName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                  required
                  pattern="[A-Za-z]+"
                  title="First Name can only contain alphabetic characters."
                />
              </div>
              <div className="form-group">
                <label>*Last Name</label>
                <input
                  className="input-field"
                  type="text"
                  value={user.GuestLName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                  required
                  pattern="[A-Za-z]+"
                  title="Last Name can only contain alphabetic characters."
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>*Contact Number</label>
                <input
                  className="input-field"
                  type="text"
                  value={user.GuestContactNo}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="Contact Number"
                  required
                  pattern="\d{10}" // 10-digit contact number pattern
                  title="Please enter a 10-digit contact number."
                />
              </div>
              <div className="form-group">
                <label>*Email Address</label>
                <input
                  className="input-field"
                  type="email"
                  value={user.GuestEmail}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="Email Address"
                  required
                  pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}" // Basic email validation pattern
                  title="Please enter a valid email address."
                />
              </div>
            </div>

            <div className="form-group">
              <label>*Company Name</label>
              <input
                className="input-field"
                type="text"
                value={user.CompanyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Company Name"
                required
                pattern="[A-Za-z\s]+" // Alphabetic characters and spaces only
                title="Please enter a valid company name ."
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                className="input-field"
                type="text"
                value={user.GuestAddress}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Address"
                required
                pattern="[A-Za-z0-9\s,.-]+" // Address with alphanumeric characters, spaces, and some common punctuation
                title="Enter a correct address."
              />
            </div>

            <div className="form-group">
              <label>City</label>
              <input
                className="input-field"
                type="text"
                value={user.GuestCity}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                required
                pattern="[A-Za-z\s]+" // City name with alphabetic characters and spaces
                title="City can only contain alphabetic characters and spaces."
              />
            </div>

            <button
              type="submit"
              onClick={handlePayment}
              className="plan-event-btn plan-event-btn-primary"
            >
              Pay Now
            </button>
            <button
              onClick={goToMeetsEvents}
              className="plan-event-btn plan-event-btn-primary"
            >
              Back
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default PlanEvent;
