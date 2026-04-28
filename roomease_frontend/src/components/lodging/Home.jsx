import React, { useState } from "react";
import "../../styles/home.css";
import { Link } from "react-router-dom";
import room1 from "/assets/rooms/room005.jpg";

// import NavBar from "../../../NavBar";

export default function Home() {
  return (
    <>
      <FullScreenHotelImage />
      <ImmersiveSection />
      <SliderSection />
      <AmenitiesSection />
      <HotelMapBox />
      <Footer />
    </>
  );
}

function NavBar() {
  return (
    <nav className="nav">
      <Link to="/" className="nav-links">
        <div className="nav-links">HOTEL NAME</div>
      </Link>
      <div className="nav-events">
        <Link to="/ramkrishna/meets" className="nav-links">
          <div>Events & Meets</div>
        </Link>
        <Link to="/ramkrishna/reviews" className="nav-links">
          <div>Reviews</div>
        </Link>

        <Link
          to="/ramkrishna/lodging/rooms"
          className="nav-links"
          style={{
            backgroundColor: "#c69963",
            padding: "8px 16px",
            color: "#141c24ff",
          }}
        >
          <div>Book Now</div>
        </Link>
        <Link to="/ramkrishna/verify/login" className="nav-links">
          <div style={{ display: "flex", gap: "8px" }}>
            <ion-icon name="person-circle"></ion-icon> Login
          </div>
        </Link>
      </div>
    </nav>
  );
}

function FullScreenHotelImage({ url, altText }) {
  return (
    <div className="image-container">
      <img
        src="https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2022/04/12/1329/MUMGH-P0765-Inner-Courtyard-Hotel-Exterior-Evening.jpg/MUMGH-P0765-Inner-Courtyard-Hotel-Exterior-Evening.16x9.jpg?imwidth=1920"
        alt={altText}
      />
    </div>
  );
}

function ImmersiveSection() {
  return (
    <div className="immersive-container">
      <div className="immersive-content">
        <h1>Immerse Yourself in the Best of Mumbai</h1>
        <p>
          Step into grand style and stand out in the city that never fails to
          surprise. With theatrics in every corner, and the unexpected at every
          turn, you'll experience the iconic best of Mumbai’s streets and our
          rooms and suites. Set out for bustling Bandra or scenic Colaba, then
          end your day on a grand note with us.
        </p>
      </div>
      <div className="immersive-image">
        <div id="immersive-img1">
          <img
            src="https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2022/04/12/1329/MUMGH-P0765-Inner-Courtyard-Hotel-Exterior-Evening.jpg/MUMGH-P0765-Inner-Courtyard-Hotel-Exterior-Evening.16x9.jpg?imwidth=1920"
            alt="Hotel View"
          />
        </div>
      </div>
    </div>
  );
}

function SliderSection() {
  const slides = [
    {
      image:
        "https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2021/01/28/0325/Grand-Hyatt-Mumbai-P660-Grand-Suite-Patio.jpg/Grand-Hyatt-Mumbai-P660-Grand-Suite-Patio.16x9.jpg?imwidth=320 320w",
      title: "Slide 1",
    },
    {
      image:
        "https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2021/01/28/0325/Grand-Hyatt-Mumbai-P660-Grand-Suite-Patio.jpg/Grand-Hyatt-Mumbai-P660-Grand-Suite-Patio.16x9.jpg?imwidth=320 480w",
      title: "Slide 2",
    },
    {
      image:
        "https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2021/01/28/0325/Grand-Hyatt-Mumbai-P660-Grand-Suite-Patio.jpg/Grand-Hyatt-Mumbai-P660-Grand-Suite-Patio.16x9.jpg?imwidth=480 640w",
      title: "Slide 3",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="slider-section">
      <h1 className="slider-title">Explore</h1>
      <div className="slider-container">
        <button className="arrow prev-arrow" onClick={prevSlide}>
          &lt;
        </button>
        <div
          className="slide"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`slider-item ${
                index === currentSlide ? "active" : ""
              }`}
            >
              <img
                src={slide.image}
                alt={`Slide ${index + 1}`}
                className="slide-image"
              />
              <p className="slide-title">{slide.title}</p>
            </div>
          ))}
        </div>
        <button className="arrow next-arrow" onClick={nextSlide}>
          &gt;
        </button>
      </div>
    </div>
  );
}

function AmenitiesSection() {
  const amenities = [
    { icon: "local_laundry_service", name: "Laundry" },
    { icon: "wifi", name: "Free Internet Access" },
    { icon: "local_parking", name: "Free Parking" },
    { icon: "business", name: "Meeting Facilities" },
    { icon: "directions_car", name: "Valet Parking" },
    { icon: "pets", name: "Pet Friendly" },
    { icon: "pool", name: "Pool" },
    { icon: "restaurant", name: "Restaurant On-Site" },
    { icon: "room_service", name: "Room Service" },
  ];

  return (
    <div className="amenities-section">
      <h2 className="amenities-title">Our Amenities</h2>
      <div className="amenities-grid">
        {amenities.map((amenity, index) => (
          <div className="amenity-item" key={index}>
            <span className="material-icons amenity-icon">{amenity.icon}</span>
            <span className="amenity-name">{amenity.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HotelMapBox() {
  return (
    <div className="hotel-map-box">
      <div className="hotel-map-inner-box">
        <div className="hotel-map-info">
          <h1>
            GETTING <br></br>HERE
          </h1>
          <p>
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Laborum,
            velit?
          </p>
        </div>
        <HotelMap />
      </div>
    </div>
  );
}

function HotelMap() {
  return (
    <div className="hotel-map">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12288.704835007773!2d74.25274105349149!3d16.689797210170994!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc1002e3f732899%3A0xbd46c7b4413d3652!2sGovernment%20Polytechnic%20Kolhapur!5e0!3m2!1sen!2sin!4v1736688971279!5m2!1sen!2sin"
        width="600"
        height="450"
        style={{ border: "0", height: "100%", width: "100%" }}
        allowfullscreen=""
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-hotel-info">
        <h1>
          HOTEL
          <br /> NAME
        </h1>
      </div>
      <div className="footer-cols">
        <h1>About</h1>
        <div className="footer-cols-links-box">
          <Link to="#" className="footer-cols-links">
            About
          </Link>
          <Link to="#" className="footer-cols-links">
            About
          </Link>
          <Link to="#" className="footer-cols-links">
            About
          </Link>
          <Link to="#" className="footer-cols-links">
            About
          </Link>
        </div>
      </div>
      <div className="footer-cols">
        <h1>Policy</h1>
        <div className="footer-cols-links-box">
          <Link to="#" className="footer-cols-links">
            Policy
          </Link>
          <Link to="#" className="footer-cols-links">
            Policy
          </Link>
          <Link to="#" className="footer-cols-links">
            Policy
          </Link>
          <Link to="#" className="footer-cols-links">
            Policy
          </Link>
        </div>
      </div>
      <div className="footer-cols">
        <h1>Contact</h1>
        <div className="footer-cols-links-box" style={{ gap: "16px" }}>
          <Link to="#" className="footer-cols-links">
            <ion-icon
              name="logo-instagram"
              style={{ color: "#fff" }}
            ></ion-icon>
            Instagram
          </Link>
          <Link to="#" className="footer-cols-links">
            <ion-icon name="logo-facebook" style={{ color: "#fff" }}></ion-icon>
            Facebook
          </Link>
          <Link to="#" className="footer-cols-links">
            <ion-icon name="call" style={{ color: "#fff" }}></ion-icon>
            +91 9323456789
          </Link>
          {/* style={{ color: "#fff" }} */}
        </div>
      </div>
      <div className="footer-img">
        <img
          src="https://www.hyatt.com/hds/static/images/0.latest/themes/grand/separator-decorative-on-dark.svg"
          altText="Footer Image"
        />
      </div>
    </footer>
  );
}
