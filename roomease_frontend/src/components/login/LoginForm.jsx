import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/LoginForm.css";

const LoginForm = ({ onLoginSuccess, onNavigateToSignUp }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // Use navigate instead of history

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:8000/ramkrishna/verify/send-otp",
        { email }
      );
      if (response.status === 200) {
        setMessage("OTP sent to your email!");
        onLoginSuccess(email);
        navigate("/ramkrishna/verify/verify-otp");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong!");
    }
  };

  const handleSignUpRedirect = () => {
    onNavigateToSignUp(); // Navigate to the sign-up step
    navigate("/ramkrishna/verify/signup");
  };

  return (
    <div className="lf-card-container">
      <div className="lf-card-left">
        <img src="/assets/rooms/room008.jpg" alt="Room" />
      </div>
      <div className="lf-card-right">
        <h2>Login</h2>
        <form onSubmit={handleSubmit} className="lf-form">
          <div>
            <input
              placeholder="Enter your Email"
              className="lf-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button className="lf-btn" type="submit">
            Send OTP
          </button>
        </form>
        {message && <p className="lf-p">{message}</p>}

        <p className="lf-p">
          Don't have an account?
          <span className="lf-sign-in-link" onClick={handleSignUpRedirect}>
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
