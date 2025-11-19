// backend/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

// Import routes
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "Usafi-Mtaani Backend" });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);

// Environment variables
const PORT = process.env.PORT || 4000;
const DB_PATH = process.env.DB_PATH || "./waste_app.db";
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.warn("⚠️ Warning: JWT_SECRET not set. Please configure it in Render environment variables.");
}

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📂 Using database at: ${DB_PATH}`);
});

module.exports = app;
