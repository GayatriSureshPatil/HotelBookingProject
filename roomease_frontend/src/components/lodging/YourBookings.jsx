import "../../styles/yourbookings.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function YourBookings() {
  const [yourBookings, setyourBookings] = useState([]);

  const [formData, setFormData] = useState(() => {
      const savedData = localStorage.getItem("user");
      return savedData
        ? JSON.parse(savedData)
        : { GuestFName: "", GuestLName: "", GuestContactNo: "", GuestEmail: "", GuestAddress: "", GuestCity: "" };
    });
  

  useEffect(() => {
    console.log("Fetching bookings...");
    axios
      .get("http://127.0.0.1:8000/ramkrishna/lodging/yourbookings", {
        params: { guestId: formData.GuestId },
      })
      .then((response) => {
        console.log("Bookings", response.data.data);
        setyourBookings(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching bookings:", error);
      });
  }, []);

  console.log(yourBookings);

  return (
    <div className="yb-page-container">
      <Heading bookings={yourBookings} handleyourBookings={setyourBookings} />
    </div>
  );
}
function Heading({ bookings, handleyourBookings }) {
  return (
    <div>
      <h1 style={{ fontSize: "48px", color: "#D2AF84" }}>Your Reservations</h1>
      <BookedRoomCardBox
        bookings={bookings}
        handleyourBookings={handleyourBookings}
      />
      {/* <BookedRoomCardBox /> */}
    </div>
  );
}

function BookedRoomCardBox({ bookings, handleyourBookings }) {
  return (
    <div className="yb-booked-room-card-container">
      {bookings.map((booking) => {
        return (
          <BookedRoomCard
            booking={booking}
            handleyourBookings={handleyourBookings}
            key={booking.BookingID}
          />
        );
      })}
      {/* <BookedRoomCard />; */}
    </div>
  );
}

function BookedRoomCard({
  booking,
  startDate = "2027-10-01",
  handleyourBookings,
}) {
  // console.log(booking["CheckinDate"]);
  const startDateFormatted = new Date(booking["CheckinDate"]).getTime();
  console.log(startDateFormatted);
  console.log("Current date", Date.now());
  const status = startDateFormatted > Date.now() ? "Upcoming" : "Past";
  console.log(status);

  return (
    <div className="yb-booked-room-card">
      <BookedRoomImg roomImg={booking.RoomNo} />
      <div className="yb-room-card-info">
        <BookedRoomCardHeading booking={booking} />
        <BookedRoomDuration booking={booking} />
        <BookedRoomPriceGuest booking={booking} />
      </div>
      {status == "Upcoming" ? (
        <DeleteButton
          booking={booking}
          handleyourBookings={handleyourBookings}
        />
      ) : (
        ""
      )}
    </div>
  );
}

function BookedRoomImg({ roomImg = "room2" }) {
  return (
    <div>
      <img src={`/assets/rooms/room${roomImg}.jpg`} alt={roomImg} />
    </div>
  );
}

function BookedRoomCardHeading({ booking }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <h3>Room {booking.RoomNo}</h3>
      <StatusBadge booking={booking} />
    </div>
  );
}

function StatusBadge({ booking, startDate = "2027-01-02" }) {
  const startDateFormatted = new Date(booking.CheckinDate).getTime();
  const status = startDateFormatted > Date.now() ? "Upcoming" : "Past";
  return (
    <span
      className={`yb-badge ${
        status === "Upcoming" ? "yb-upcoming" : "yb-past"
      }`}
    >
      {status}
    </span>
  );
}

const formatDate = (dbDate) => {
  const date = new Date(dbDate);
  let formattedDate = date.toLocaleDateString("en-US", {
    weekday: "short", // "Tue"
    month: "short", // "Jan"
    day: "2-digit", // "07"
    year: "numeric", // "2025"
  });

  // Remove the comma between day and year
  formattedDate = formattedDate.replace(/(\d{2}),/, "$1");

  return formattedDate;
};

function BookedRoomDuration({
  booking,
  startDate = "2025-01-02",
  endDate = "2025-01-07",
}) {
  return (
    <div>
      <span className="yb-date">{formatDate(booking.CheckinDate)}</span>
      <span
        style={{ fontWeight: "600", display: "inline-block", margin: "0 8px" }}
      >
        &mdash;
      </span>
      <span className="yb-date">{formatDate(booking.CheckOutDate)}</span>
    </div>
  );
}

function BookedRoomPriceGuest({ booking }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "102px ",
        marginTop: "54px",
        alignItems: "end",
      }}
    >
      <BookedRoomPrice total_Amt={booking.total_amt} />
      <BookedRoomGuests adult={booking.Adult} children={booking.Child} />
    </div>
  );
}

function BookedRoomPrice({ total_Amt, roomPrice = 700 }) {
  return (
    <div>
      <span style={{ fontSize: "24px", fontWeight: "700", color: "#D2AF84" }}>
        ₹ {total_Amt}
      </span>
    </div>
  );
}

function BookedRoomGuests({ adult = 4, children = 2 }) {
  return (
    <div>
      <span style={{ fontSize: "20px", fontWeight: "700" }}>{adult} adult</span>
      <span style={{ fontSize: "20px", fontWeight: "700" }}>
        {children == 0 ? "" : `, ${children} children`}
      </span>
    </div>
  );
}

function DeleteButton(booking, handleyourBookings) {
  const [showPopup, setShowPopup] = useState(false);
  // console.log("booking id", booking.booking.BookingID);
  const id = booking.booking.BookingID;
  console.log("bookingid", id);

  const deleteBooking = async () => {
    if (confirm("Do you want to delete your booking?")) {
      try {
        const response = await axios.post(
          "http://localhost:8000/ramkrishna/lodging/yourbookings/deletebooking",
          {
            bookingId: id, // Send bookingId inside the request body
          }
        );

        if (response.status === 200) {
          location.reload();
        } else {
          console.error("Failed to save data.");
        }
      } catch (err) {
        console.error("Save Error:", err.response?.data || err);
      }
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    }
  };

  return (
    <div className="yb-delete-btn-div">
      <button className="yb-delete-btn" onClick={deleteBooking}>
        Delete <ion-icon name="trash-outline"></ion-icon>
      </button>
      {/* ✅ Success Popup Notification */}
      {showPopup && (
        <div className="yb-popup">✔ Booking deleted successfully!</div>
      )}
    </div>
  );
}

export default YourBookings;
