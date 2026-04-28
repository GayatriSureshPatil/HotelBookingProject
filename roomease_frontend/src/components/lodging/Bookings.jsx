import React from "react";
import "../../styles/bookings.css";

export default function Bookings() {
  return (
    <div className="container">
      <h1>Bookings</h1>
      <BookedRoomCardBox />
    </div>
  );
}

function BookedRoomCardBox() {
  return (
    <div className="booked-room-card-container">
      <div>Room</div>
      <BookedRoomCard />
    </div>
  );
}

function BookedRoomCard() {
  return <div className="booked-room-card">Room</div>;
}
