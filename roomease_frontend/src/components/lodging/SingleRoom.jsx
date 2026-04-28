import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/room_style.css";
import "../../styles/dynamic_pricing.css";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { PricingBreakdown } from "./DynamicPricing";

function getDayCount(startDate, endDate) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

export default function SingleRoom() {
  const { roomno } = useParams();
  const [room, setRoom] = useState(null);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/ramkrishna/lodging/rooms/${roomno}`)
      .then((response) => {
        setRoom(response.data.data.room[0]);
        const dates = response.data.data.unavailableDates.map(
          (d) => new Date(d)
        );
        setUnavailableDates(dates);
        setLoading(false);
      })
      .catch((e) => {
        console.error("Error fetching room:", e.message);
        setLoading(false);
      });
  }, [roomno]);

  const handleRoomClick = () => {
    const roomSelectedData = { ...room, checkInDate, checkOutDate, adults, children };
    localStorage.setItem("roomSelectedData", JSON.stringify(roomSelectedData));
    navigate("/ramkrishna/lodging/rooms/room-details");
  };

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading…</h2>
      </div>
    );
  }

  return (
    <div className="main">
      <div style={{ display: "flex", flexDirection: "column", gap: "48px", alignItems: "center" }}>
        <SingleRoomBox room={room} />

        {/* Dynamic Pricing Breakdown — shown to customer */}
        {room?.pricingInfo && (
          <div style={{ width: "120rem" }}>
            <PricingBreakdown pricingInfo={room.pricingInfo} collapsed={false} />
          </div>
        )}

        <div>
          <h1 style={{ fontSize: "48px", color: "#D2AF84" }}>Reserve this room today.</h1>
        </div>

        <SingleRoomInputs
          unavailableDates={unavailableDates}
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          setCheckInDate={setCheckInDate}
          setCheckOutDate={setCheckOutDate}
          adults={adults}
          children={children}
          setAdults={setAdults}
          setChildren={setChildren}
          room={room}
          handleRoomClick={handleRoomClick}
        />
      </div>
    </div>
  );
}

function SingleRoomBox({ room }) {
  return (
    <div className="single-room">
      <SingleRoomImage roomImg={room.room_no} />
      <SingleRoomDetails room={room} />
    </div>
  );
}

function SingleRoomImage({ roomImg }) {
  return (
    <div className="single-room-img-box" style={{ width: "70%", overflowX: "hidden" }}>
      <img src={`/assets/rooms/room${roomImg}.jpg`} alt="room" style={{ transform: "translateX(-20%)" }} />
    </div>
  );
}

function SingleRoomDetails({ room }) {
  return (
    <div className="single-room-details">
      <div className="single-room-heading">
        <h1>{room.room_category}</h1>
      </div>
      <div style={{ maxWidth: "108rem", textAlign: "left", marginBottom: "24px" }}>
        <span>{room.features}</span>
      </div>
      <div>
        <ul>
          <li>
            <ion-icon name="people"></ion-icon>
            <span>For upto <b>{room.capacity}</b> guests</span>
          </li>
          <li>
            <ion-icon name="location"></ion-icon>
            <span>Located in <b>India</b></span>
          </li>
          <li>
            <ion-icon name="close-outline"></ion-icon>
            <span>{room.policies}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function SingleRoomInputs({
  unavailableDates, checkInDate, checkOutDate, setCheckInDate, setCheckOutDate,
  adults, children, setAdults, setChildren, room, handleRoomClick,
}) {
  return (
    <div className="single-room">
      <SingleRoomCalendarsTotalPrice
        unavailableDates={unavailableDates}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
        setCheckInDate={setCheckInDate}
        setCheckOutDate={setCheckOutDate}
        room={room}
      />
      <SingleRoomGuestsInput
        room={room}
        adults={adults}
        children={children}
        setAdults={setAdults}
        setChildren={setChildren}
        handleRoomClick={handleRoomClick}
      />
    </div>
  );
}

function SingleRoomCalendarsTotalPrice({
  unavailableDates, checkInDate, checkOutDate, setCheckInDate, setCheckOutDate, room,
}) {
  return (
    <div className="single-room-calendars-total-price">
      <div style={{ borderRight: "1px solid #2c3d4f", paddingTop: "48px" }}>
        <Calendars
          unavailableDates={unavailableDates}
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          setCheckInDate={setCheckInDate}
          setCheckOutDate={setCheckOutDate}
        />
        <SingleRoomPriceBar checkInDate={checkInDate} checkOutDate={checkOutDate} room={room} />
      </div>
    </div>
  );
}

function SingleRoomPriceBar({ room, checkInDate, checkOutDate }) {
  const roomPrice = room?.price;
  const basePrice = room?.pricingInfo?.basePrice;
  let noOfDays = null;
  if (checkInDate && checkOutDate) noOfDays = getDayCount(checkInDate, checkOutDate);

  return (
    <div className="single-room-price-details">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexGrow: "1" }}>
        <div>
          {basePrice && basePrice !== roomPrice && (
            <span className="dp-base-price" style={{ fontSize: 14 }}>₹{basePrice}</span>
          )}
          <span>₹ {roomPrice} </span>
          <span style={{ fontSize: "16px" }}>/ night</span>
        </div>
        {noOfDays && (
          <>
            <div style={{ backgroundColor: "#B78343", padding: "2px 8px" }}>x {noOfDays}</div>
            <div style={{ fontWeight: "700", fontSize: "20px" }}>
              <span>TOTAL </span>
              <span>₹ {roomPrice * noOfDays}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SingleRoomGuestsInput({ room, adults, children, setAdults, setChildren, handleRoomClick }) {
  return (
    <div className="single-room-guests-input">
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "48px" }}>
        <div className="single-input">
          <label>Adults</label>
          <select onChange={(e) => setAdults(e.target.value)} required value={adults}>
            {Array.from({ length: room?.capacity || 4 }, (_, i) => i + 1).map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div className="single-input">
          <label>Children</label>
          <select onChange={(e) => setChildren(e.target.value)} required value={children}>
            {Array.from({ length: (room?.capacity || 4) + 1 }, (_, i) => i).map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="single-room-btns">
        <button onClick={() => window.history.back()}>Back</button>
        <button onClick={handleRoomClick}>Next</button>
      </div>
    </div>
  );
}

function Calendars({ unavailableDates, checkInDate, checkOutDate, setCheckInDate, setCheckOutDate }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stripTime = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const isUnavailable = (d) =>
    unavailableDates.some(u => stripTime(u).getTime() === stripTime(d).getTime());
  const dayClass = (d) => (isUnavailable(d) || d < today ? "grayed-out" : undefined);

  return (
    <div style={{ display: "flex", gap: "48px", marginBottom: "32px", paddingLeft: "48px", paddingRight: "48px" }}>
      <div>
        <p style={{ color: "#c69963", marginBottom: "20px", fontSize: "16px" }}>Select a Check-In Date:</p>
        <DatePicker
          selected={checkInDate}
          onChange={setCheckInDate}
          dayClassName={dayClass}
          filterDate={(d) => d >= today && !isUnavailable(d)}
          inline
          calendarClassName="custom-calendar"
        />
      </div>
      <div>
        <p style={{ color: "#c69963", marginBottom: "20px", fontSize: "16px" }}>Select a Check-Out Date:</p>
        <DatePicker
          selected={checkOutDate}
          onChange={(d) => { if (checkInDate && d > checkInDate) setCheckOutDate(d); }}
          dayClassName={dayClass}
          filterDate={(d) => d >= today && d > checkInDate && !isUnavailable(d)}
          inline
          calendarClassName="custom-calendar"
        />
      </div>
    </div>
  );
}
