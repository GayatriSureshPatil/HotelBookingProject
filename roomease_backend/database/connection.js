const mysql2 = require("mysql2");
require("dotenv").config();

const db = mysql2.createPool({
  host: process.env.MYSQLHOST || "switchyard.proxy.rlwy.net",
  user: process.env.MYSQLUSER || "root",
  password: process.env.MYSQLPASSWORD || "BPixaGdApCOEltZRiSjgUAQOFnEiOkaA",
  database: process.env.MYSQLDATABASE || "ramkrishna_my",
  port: process.env.MYSQLPORT || 28442,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err.message);
    return;
  }
  console.log("Connected to the MySQL database");
  connection.release();
});

module.exports = db;