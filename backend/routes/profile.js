// backend/routes/profile.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const pool = require("../db");

// Protected profile route
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      "SELECT id, email, name, created_at FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ profile: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Database error", detail: err.message });
  }
});

module.exports = router;
