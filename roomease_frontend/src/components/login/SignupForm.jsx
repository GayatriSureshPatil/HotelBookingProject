import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";
import "../../styles/SignUpForm.css"; // Import CSS file
const SignUpForm = ({ email }) => {
  const navigate = useNavigate(); // Initialize navigate
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    contactNumber: "",
    emailAddress: email || "",
    companyName: "",
    address: "",
    city: "",
  });
  const [message, setMessage] = useState("");
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8000/ramkrishna/verify/signup",
        formData
      );
      if (response.status === 200) {
        setMessage("Sign up successful!");
        alert("Signup successful! Redirecting to login...");
        navigate("/ramkrishna/verify/login"); // Redirect to login page
      }
    } catch (error) {
      console.error("Sign-up error:", error);
      if (error.response?.status === 409) {
        setMessage("User is already registered. Please log in.");
      } else if (error.code === "ERR_NETWORK") {
        setMessage("Cannot connect to the server. Please make sure the backend is running.");
      } else {
        setMessage(error.response?.data?.message || "Error during sign-up. Please try again.");
      }
    }
  };
  return (
    <div className="signup-page">
      <div className="signup-container">
        <h2 className="signup-h2">Sign Up</h2>
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="signup-form-row">
            <div className="signup-form-group">
              <label>*First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                required
                pattern="[A-Za-z]+"
                title="First Name can only contain alphabetic characters."
              />
            </div>
            <div className="signup-form-group">
              <label>*Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                required
                pattern="[A-Za-z]+"
                title="Last Name can only contain alphabetic characters."
              />
            </div>
          </div>
          <div className="signup-form-group">
            <label>*Contact Number</label>
            <input
              type="text"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="Contact Number"
              required
              pattern="^\d{10,15}$"
              title="Contact Number must be 10-15 digits long."
            />
          </div>
          <div className="signup-form-group">
            <label>*Email Address</label>
            <input
              type="email"
              name="emailAddress"
              value={formData.emailAddress}
              onChange={handleChange}
              placeholder="Email Address"
              required
              pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
              title="Enter a valid email address."
            />
          </div>
          <div className="signup-form-group">
            <label>Company Name</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Company Name"
              pattern="^[A-Za-z0-9\s,\.]+$"
              title="Company Name can contain letters, numbers, and spaces."
            />
          </div>
          <div className="signup-form-group">
            <label>*Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Address"
              required
              pattern="^[A-Za-z0-9\s,\.]+$"
              title="Address can contain letters, numbers, and spaces."
            />
          </div>
          <div className="signup-form-group">
            <label>*City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              required
              pattern="[A-Za-z\s]+"
              title="City can only contain alphabetic characters and spaces."
            />
          </div>
          <button type="submit" className="signup-button">
            Sign Up
          </button>
        </form>
        {message && <p className="signup-message">{message}</p>}
      </div>
    </div>
  );
};
export default SignUpForm;