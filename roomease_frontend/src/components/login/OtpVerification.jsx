import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/OtpVerification.css";

const OtpVerification = ({ email }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [message, setMessage] = useState("");
  const [resendTimer, setResendTimer] = useState(30);
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const [sendEmail, setSendEmail] = useState(email);

  useEffect(() => {
    if (resendTimer > 0) {
      const timerId = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [resendTimer]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (/[^0-9]/.test(value)) return;
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value && index < 5) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const otpString = otp.join("");
      const response = await axios.post(
        "http://localhost:8000/ramkrishna/verify/verify-otp",
        {
          email,
          otp: otpString,
        }
      );

      if (response.status === 200) {
        const userDetails = response.data.user; // Extract user details

        // Store user details in localStorage
        localStorage.setItem("user", JSON.stringify(userDetails));
        localStorage.setItem("isLoggedIn", "true");

        setMessage("OTP verified successfully!");

        // Clear OTP and stop timer
        setOtp(["", "", "", "", "", ""]);
        setResendTimer(0);

        // Navigate to the signup page after 1 second
        // Assume OTP is verified successfully
        const redirectPath = localStorage.getItem("redirectAfterLogin") || "/"; // Default to home if no path
        localStorage.removeItem("redirectAfterLogin"); // Clear stored path
        // navigate(redirectPath); // Redirect to the original page
        setTimeout(() => navigate(redirectPath), 1000);
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Invalid OTP. Please try again."
      );
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setMessage("");

    try {
      const response = await axios.post(
        "http://localhost:8000/ramkrishna/verify/resend-otp",
        {
          email,
        }
      );
      if (response.status === 200) {
        setMessage("OTP resent successfully!");
        setResendTimer(30); // Restart timer
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to resend OTP. Please try again."
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="card-container">
      <div className="otp-card">
        <img
          src="/assets/verify_otp.jpeg"
          alt="Verification"
          className="otp-logo"
        />
        <h2>Verify OTP</h2>
        <form onSubmit={handleSubmit}>
          <div className="otp-input-container">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-input-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                required
                className="otp-input"
              />
            ))}
          </div>
          <button type="submit" className="otp-btn">
            Verify OTP
          </button>
        </form>

        {/* Resend OTP Section */}
        {resendTimer > 0 ? (
          <p className="otp-p">Resend OTP in {resendTimer} seconds</p>
        ) : (
          <button
            onClick={handleResendOtp}
            disabled={isResending}
            className="resend-otp-btn otp-btn"
          >
            {isResending ? "Resending..." : "Resend OTP"}
          </button>
        )}

        <div className="message-container">
          {message && (
            <div
              className={`message-box ${
                message.includes("successfully") ? "success" : "error"
              }`}
            >
              <span className="icon">
                {message.includes("successfully") ? "✔️" : "❌"}
              </span>
              <span className="message-text">{message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
