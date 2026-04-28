import React, { useState } from "react";
import "./VenueList.css"; // Import the single CSS file
import { Link, useNavigate } from "react-router-dom";
import separator from "/separator1.svg";
// import { IonIcon } from "@ionic/react";
// import { openOutline } from "ionicons/icons";
import "../../styles/home.css";
import PlanEvent from "./PlanEvent";

const VenueCard = ({
  image,
  title,
  size,
  capacity,
  description,
  hallId,
  price,
}) => {
  const navigate = useNavigate();

  console.log("image", image);

  const handleRequestPricing = () => {
    localStorage.setItem(
      "hallDetails",
      JSON.stringify({ hallId, capacity, price, venueTitle: title })
    );

    navigate("/ramkrishna/meets/PlanEvent"); // Navigate without state

    // navigate("/ramkrishna/meets/PlanEvent", {
    //   state: { hallId, capacity, price, venueTitle: title }, // Pass dynamic data here
    // });
  };
  return (
    <div className="vl-card">
      <img
        src={`/assets/meets/${image}`}
        alt={title}
        className="vl-card-image"
      />
      <div className="vl-card-content">
        <h5 className="vl-card-title">{title}</h5>
        <p className="vl-card-text">
          <strong>{size} sq ft</strong> <br />
          Capacity: <strong>{capacity} Guests</strong>
        </p>
        <p className="vl-card-description">{description}</p>
        <div className="vl-card-footer">
          <button className="vl-button" onClick={handleRequestPricing}>
            <span className="vl-text">Book Now</span>
            {/* <IonIcon icon={openOutline} className="icon" /> */}
          </button>
        </div>
      </div>
    </div>
  );
};

const VenueList = () => {
  const venues = [
    {
      hallId: "H1",
      image: "imag1.png", // Replace with actual image path or URL
      title: "The Grand Showroom",
      size: "19,217",
      capacity: "300",
      price: 15000,
      description:
        "Step into a realm where the extraordinary becomes the standard, and every event is a masterpiece in the making. At the Grand Showroom, we transcend the ordinary, elevating every moment.",
    },
    {
      hallId: "H2",
      image: "image2.png", // Replace with actual image path or URL
      title: "Grand Ballroom",
      size: "11,480",
      capacity: "250",
      price: 11000,
      description:
        "The elegant pillar-less Grand Ballroom is the highlight of Grand Hyatt Mumbai. Naturally lit on two sides and overlooking the Courtyard with a contemporary waterfall.",
    },
    {
      hallId: "H3",
      image: "imag3.png", // Replace with actual image path or URL
      title: "Grand Lawns",
      size: "38,425 ",
      capacity: "600",
      price: 14000,
      description:
        "A versatile outdoor venue in Mumbai for grand celebrations, Grand Lawns is a stunning venue surrounded by a canopy of trees and is an ideal setting to host spectacular events and weddings.",
    },
    {
      hallId: "H4",
      image: "image4.png", // Replace with actual image path or URL
      title: "Mahogany",
      size: "1,104",
      capacity: "100",
      price: 10000,
      description:
        "Mahogany is a quaint venue that offers phenomenal cuisine and unparalleled service, that will make for great intimate gatherings. Modern and elegant, Grand Salon a venue along with the pre-function area is the perfect setting for any social or corporate events.",
    },
    {
      hallId: "H5",
      image: "image5.png", // Replace with actual image path or URL
      title: "Grand Salon",
      size: "2,184",
      capacity: "150",
      price: 13000,
      description:
        "Modern and elegant, Grand Salon a venue along with the pre-function area is the perfect setting for any social or corporate events.Modern and elegant, Grand Salon a venue along with the pre-function area is the perfect setting for any social or corporate events.",
    },
    {
      hallId: "H6",
      image: "image6.png", // Replace with actual image path or URL
      title: "Boardroom",
      size: "800",
      capacity: "50",
      price: 5000,
      description:
        "Our chic Boardrooms, equipped with state-of-the-art technology are the perfect venues to host private business meetings and discussions. The boardrooms can also be used as breakaway rooms for larger functions.",
    },
  ];

  return (
    <div>
      {/* Section for the header image */}
      <div className="vl-header-image">
        <img
          src="/assets/meets/main.jpg"
          alt="Hotel View"
          className="vl-main-image"
        />
      </div>

      <div className="vl-immersive-container">
        <div className="vl-immersive-content">
          <h1>Meetings & Events</h1>
        </div>
        <div className="vl-immersive-image">
          <p>
            Step into grand style and stand out in the city that never fails to
            surprise. With theatrics in every corner, and the unexpected at
            every turn, you'll experience the iconic best of Mumbai’s streets
            and our rooms and suites. Set out for bustling Bandra or scenic
            Colaba, then end your day on a grand note with us.
          </p>
        </div>
      </div>
      <div className="vl-separator-container">
        <img src={separator} alt="Separator" className="vl-separator-image" />
      </div>
      <div className="vl-totalspace">
        <span>
          Total Spaces:<strong>6</strong>
        </span>
        <span>
          Largest Space:<strong>38,425 sq ft</strong>
        </span>
      </div>

      {/* Section for the venue cards */}
      <div className="vl-venue-container">
        {venues.map((venue, index) => (
          <VenueCard
            key={index}
            image={venue.image}
            title={venue.title}
            size={venue.size}
            capacity={venue.capacity}
            description={venue.description}
            hallId={venue.hallId}
            price={venue.price}
          />
        ))}
      </div>
    </div>
  );
};

export default VenueList;
