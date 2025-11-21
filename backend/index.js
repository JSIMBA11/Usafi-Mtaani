// backend/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");

// Import routes
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");

const app = express();

// -------------------------------
// Middleware
// -------------------------------
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());

// -------------------------------
// Health check route
// -------------------------------
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Usafi-Mtaani Backend" });
});

// -------------------------------
// API routes
// -------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);

// -------------------------------
// Environment variables
// -------------------------------
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.warn(
    "⚠️ Warning: JWT_SECRET not set. Please configure it in your .env or Render environment variables."
  );
}

// -------------------------------
// Start server
// -------------------------------
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

module.exports = app;
