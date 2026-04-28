-- Create Database
CREATE DATABASE IF NOT EXISTS ramkrishna_my;
USE ramkrishna_my;

-- 1. Create table `guest`
CREATE TABLE IF NOT EXISTS guest (
    GuestID INT AUTO_INCREMENT PRIMARY KEY,
    GuestFName VARCHAR(100) NOT NULL,
    GuestLName VARCHAR(100) NOT NULL,
    GuestContactNo VARCHAR(20) NOT NULL,
    GuestEmail VARCHAR(150) UNIQUE NOT NULL,
    GuestAddress VARCHAR(255),
    GuestCity VARCHAR(100),
    CompanyId VARCHAR(150),
    CompanyName VARCHAR(150),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create table `room`
CREATE TABLE IF NOT EXISTS room (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_no INT UNIQUE NOT NULL,
    room_category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'available',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create table `bookings`
CREATE TABLE IF NOT EXISTS bookings (
    BookingID INT AUTO_INCREMENT PRIMARY KEY,
    BookingDate DATETIME,
    CheckinDate DATE NOT NULL,
    CheckOutDate DATE NOT NULL,
    GuestID INT NOT NULL,
    RoomNo INT NOT NULL,
    Adult INT DEFAULT 0,
    Child INT DEFAULT 0,
    total_amt DECIMAL(10, 2),
    deleted_status ENUM('active', 'deleted') DEFAULT 'active',
    FOREIGN KEY (GuestID) REFERENCES guest(GuestID) ON DELETE CASCADE
);

-- 4. Create table `event_book`
CREATE TABLE IF NOT EXISTS event_book (
    BookingID INT AUTO_INCREMENT PRIMARY KEY,
    BookingDate DATE,
    EventTitle VARCHAR(255),
    EventDate DATE,
    GuestID INT NOT NULL,
    HallID INT,
    Capacity INT,
    Price DECIMAL(10, 2),
    deleted_status ENUM('active', 'deleted') DEFAULT 'active',
    FOREIGN KEY (GuestID) REFERENCES guest(GuestID) ON DELETE CASCADE
);

-- 5. Create table `payments`
CREATE TABLE IF NOT EXISTS payments (
    PaymentID INT AUTO_INCREMENT PRIMARY KEY,
    PaymentMethod VARCHAR(100),
    PaymentAmount DECIMAL(10, 2) NOT NULL,
    BookingID INT NOT NULL,
    PaymentStatus VARCHAR(100) DEFAULT 'Success',
    PaymentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    razorpay_payment_id VARCHAR(255)
);

-- 6. Create table `reviews`
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    stars INT NOT NULL CHECK (stars >= 1 AND stars <= 5),
    review_text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Insert some dummy rooms
INSERT IGNORE INTO room (room_no, room_category, price) VALUES 
(101, 'Standard', 1500.00),
(102, 'Standard', 1500.00),
(201, 'Deluxe', 3000.00),
(202, 'Deluxe', 3000.00),
(301, 'Suite', 5000.00);
