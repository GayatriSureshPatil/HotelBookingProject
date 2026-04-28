const csv = require("csv-parser");
const fs  = require("fs");
const db  = require("../database/connection");
const { analyseReview } = require("./sentimentAnalyzer");

exports.submitReviews = async (req, res) => {
    let { name, rating, review } = req.body;

    if (!name || !rating || !review) {
        return res.status(400).json({ message: "All fields are required" });
    }

    rating = parseInt(rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Run sentiment analysis before saving
    const sentiment = analyseReview(review, rating);

    const sql = "INSERT INTO reviews (name, stars, review_text) VALUES (?, ?, ?)";
    db.query(sql, [name, rating, review], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error inserting review", error: err });
        }
        res.status(201).json({
            message:   "Review added successfully",
            reviewId:  result.insertId,
            sentiment, // returned so frontend can display it immediately
        });
    });
}

exports.submitCSV = async (req,res)=>{
    const filePath = "E:/PROJECT/ramkrishna_frontend/uploads/Finale_Reviews.csv"; // Path to your CSV file

    if (!fs.existsSync(filePath)) {
        return res.status(400).json({ message: "CSV file not found" });
    }

    const reviews = [];

    fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
            // Map CSV columns to database fields
            const name = row["Reviewer's Name"] ? row["Reviewer's Name"].trim() : null;
            const review = row["reviews"] ? row["reviews"].trim() : null;
            let rating = Math.floor(Math.random() * 5) + 1; // Since rating is missing, assign random 1-5
            const created_at = new Date(row["Date"]).toISOString().slice(0, 19).replace("T", " "); // Convert Date format

            if (name && review) {
                reviews.push([name, rating, review, created_at]);
            }
        })
        .on("end", () => {
            if (reviews.length === 0) {
                return res.status(400).json({ message: "CSV file is empty or invalid format" });
            }

            const sql = "INSERT INTO reviews (name, stars, review_text, created_at) VALUES ?";
            db.query(sql, [reviews], (err) => {
                if (err) {
                    return res.status(500).json({ message: "Error inserting CSV data", error: err });
                }
                res.status(201).json({ message: "CSV data inserted successfully" });
            });
        })
        .on("error", (err) => {
            res.status(500).json({ message: "Error reading CSV file", error: err.message });
        });
}

exports.getReviews = async (req, res)=>{
    try {
        const query = "SELECT name, stars, review_text, created_at FROM reviews ORDER BY created_at DESC";
        db.query(query, (err, results) => {
          if (err) {
            console.error("Error fetching reviews:", err);
            return res.status(500).json({ message: "Error fetching reviews" });
          }
          res.json(results);
        });
      } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
}