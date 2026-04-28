// import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Rooms from "./components/lodging/Rooms";
import SingleRoom from "./components/lodging/SingleRoom";
import Bookings from "./components/lodging/Bookings";
import Home from "./components/lodging/Home";
import RoomDetails from "./components/lodging/RoomDetails";
import GenerateInvoice from "./components/lodging/GenerateInvoice";
import Bill from "./components/lodging/Bill";
import YourBookings from "./components/lodging/YourBookings";
import VenueList from "./components/meets/VenueList";
import PlanEvent from "./components/meets/PlanEvent";
import BillPage from "./components/meets/BillPage";
import ReviewsPage from "./ReviewsPage";
import AdminSentimentDashboard from "./components/lodging/AdminSentimentDashboard";
import LoginForm from "./components/login/LoginForm";
import SignUpForm from "./components/login/SignupForm";
import OtpVerification from "./components/login/OtpVerification";
import React, { useState } from "react";
import NavBar from "../src/components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [email, setEmail] = useState(null);
  const [step, setStep] = useState(1); // 1: Login, 2: OTP Verify, 3: Sign Up

  const handleLoginSuccess = (email) => {
    setEmail(email);
    setStep(2); // Move to OTP verification step
  };

  const handleNavigateToSignUp = () => {
    setStep(3); // Switch to sign-up form
  };

  return (
    <>
      {/* <Rooms /> */}
      {/* <SingleRoom /> */}

      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route
            path="/ramkrishna/verify/login"
            element={
              <LoginForm
                onLoginSuccess={handleLoginSuccess}
                onNavigateToSignUp={handleNavigateToSignUp}
              />
            }
          />
          <Route
            path="/ramkrishna/verify/verify-otp"
            element={<OtpVerification email={email} />}
          />
          <Route
            path="/ramkrishna/verify/signup"
            element={<SignUpForm email={email} />}
          />
          <Route path="/ramkrishna/lodging/rooms" element={<Rooms />}></Route>
          <Route
            path="/ramkrishna/lodging/rooms/:roomno"
            element={<SingleRoom />}
          ></Route>
          <Route
            path="/ramkrishna/lodging/bookings"
            element={<Bookings />}
          ></Route>
          <Route
            path="/ramkrishna/lodging/rooms/room-details"
            element={
              <ProtectedRoute>
                <RoomDetails />
              </ProtectedRoute>
            }
          ></Route>
          <Route
            path="/ramkrishna/lodging/generate-invoice"
            element={<GenerateInvoice />}
          ></Route>
          <Route path="/ramkrishna/lodging/bill" element={<Bill />} />
          <Route
            path="/ramkrishna/lodging/yourbookings"
            element={<YourBookings />}
          />
          <Route path="/ramkrishna/meets" element={<VenueList />} />

          <Route
            path="/ramkrishna/meets/PlanEvent"
            element={
              <ProtectedRoute>
                <PlanEvent />
              </ProtectedRoute>
            }
          />

          <Route path="/ramkrishna/meets/Bill" element={<BillPage />} />
          <Route path="/ramkrishna/reviews" element={<ReviewsPage />} />
          <Route path="/ramkrishna/admin/sentiment" element={<AdminSentimentDashboard />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
