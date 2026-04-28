const mysql2 = require("mysql2");
require("dotenv").config();

const db = mysql2.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "gayatri",
  password: process.env.DB_PASSWORD || "23052006",
  database: process.env.DB_NAME || "ramkrishna_my",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.message);
    return;
  }
  console.log("Connected to the database");
});

module.exports = db;