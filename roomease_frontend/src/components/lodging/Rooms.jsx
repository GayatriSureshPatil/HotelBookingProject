import { useEffect, useState } from "react";
import "../../styles/room_style.css";
import "../../styles/dynamic_pricing.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { PricingBadge } from "./DynamicPricing";
import AdminPricingPanel from "./AdminPricingPanel";

export default function Rooms() {
  const navigate = useNavigate();
  function goToRoom(roomno) {
    navigate(`/ramkrishna/lodging/rooms/${roomno}`);
  }
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [guestsNumFilter, setGuestsNumFilter] = useState(0);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/ramkrishna/lodging/rooms")
      .then((response) => {
        setRooms(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching rooms:", error);
        setError("Could not load rooms. Please make sure the backend server is running.");
        setLoading(false);
      });
  }, []);

  function handleGuestsNum(selectedNum) {
    setGuestsNumFilter(selectedNum);
  }

  const filteredRooms = rooms.filter(
    (room) => guestsNumFilter === 0 || room.capacity >= guestsNumFilter
  );

  return (
    <div className="main">
      <div className="room-page">
        <div className="guest-selection">
          <GuestSelection
            onGuestsNum={handleGuestsNum}
            guestsNumFilter={guestsNumFilter}
          />
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "60px", color: "#c69963" }}>
            <h2>Loading rooms…</h2>
          </div>
        )}
        {error && (
          <div style={{ textAlign: "center", padding: "60px", color: "#e74c3c" }}>
            <h2>⚠️ {error}</h2>
            <p style={{ color: "#aaa", marginTop: "10px" }}>
              Run <code>node server.js</code> in the backend directory to start the server.
            </p>
          </div>
        )}

        {!loading && !error && (
          <div className="rooms-cards-grid">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.room_no}
                roomNo={room.room_no}
                roomImg={room.img}
                roomName={room.room_category}
                roomPrice={room.price}
                roomCapacity={room.capacity}
                pricingInfo={room.pricingInfo}
                goToRoom={goToRoom}
              />
            ))}
          </div>
        )}
      </div>

      {/* Admin floating button — visible to admins on this page */}
      <AdminPricingPanel />
    </div>
  );
}

function GuestSelection({ onGuestsNum, guestsNumFilter }) {
  const options = [
    { num: 0, label: "All rooms" },
    { num: 3, label: "3 guests" },
    { num: 5, label: "5 guests" },
    { num: 7, label: "7 guests" },
  ];
  return (
    <div>
      {options.map((option) => (
        <GuestButton
          key={option.num}
          num={option.num}
          onGuestsNum={onGuestsNum}
          guestsNumFilter={guestsNumFilter}
        >
          {option.label}
        </GuestButton>
      ))}
    </div>
  );
}

function Button({ children, classes = "", onClick, style = { fontWeight: 500 } }) {
  return (
    <button className={`btn ${classes}`} onClick={onClick} style={style}>
      {children}
    </button>
  );
}

function GuestButton({ children, guestsNumFilter, onGuestsNum, num }) {
  const isSelected = guestsNumFilter === num;
  return (
    <Button classes={isSelected ? "selected" : ""} onClick={() => onGuestsNum(num)}>
      {children}
    </Button>
  );
}

function RoomCard({ roomImg, roomName, roomPrice, roomCapacity, roomNo, goToRoom, pricingInfo }) {
  return (
    <div className="room-card">
      <RoomCardImg roomImg={`room${roomNo}`} />
      <div className="room-card-info">
        <RoomCardDetails
          roomName={roomName}
          roomPrice={roomPrice}
          roomCapacity={roomCapacity}
          pricingInfo={pricingInfo}
        />
        <RoomCardButton roomNo={roomNo} goToRoom={goToRoom} />
      </div>
    </div>
  );
}

function RoomCardImg({ roomImg = "room002" }) {
  return <img src={`/assets/rooms/${roomImg}.jpg`} alt={roomImg} />;
}

function RoomCardDetails({ roomName, roomPrice, roomCapacity, pricingInfo }) {
  return (
    <div className="room-card-info-details">
      <RoomCardHeading roomName={roomName} />
      <RoomCardGuestNum roomCapacity={roomCapacity} />
      {/* Dynamic pricing badge */}
      {pricingInfo && <PricingBadge pricingInfo={pricingInfo} />}
      <RoomCardPrice roomPrice={roomPrice} pricingInfo={pricingInfo} />
    </div>
  );
}

function RoomCardHeading({ roomName = "Room 001" }) {
  return <h3>{roomName}</h3>;
}

function RoomCardGuestNum({ roomCapacity = 2 }) {
  return (
    <div className="room-car-guestnum">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4c6b8a" aria-hidden="true" data-slot="icon">
        <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
      </svg>
      <p>
        For up to <span style={{ fontWeight: 700 }}>{roomCapacity}</span> guests
      </p>
    </div>
  );
}

function RoomCardPrice({ roomPrice = 700, pricingInfo }) {
  const basePrice = pricingInfo?.basePrice;
  const showStrikethrough = basePrice && basePrice !== roomPrice;

  return (
    <div className="room-card-price">
      {showStrikethrough && (
        <span className="dp-base-price" style={{ fontSize: 14, display: "block", marginBottom: 2 }}>
          ₹{basePrice}
        </span>
      )}
      <span style={{ fontSize: "36px" }}>₹ {roomPrice} </span>
      <span>/ night</span>
    </div>
  );
}

function RoomCardButton({ roomNo, goToRoom }) {
  return (
    <>
      <div></div>
      <div className="room-card-btn">
        <Button classes="details-btn" onClick={() => goToRoom(roomNo)}>
          Details &amp; reservation &rarr;
        </Button>
      </div>
    </>
  );
}
