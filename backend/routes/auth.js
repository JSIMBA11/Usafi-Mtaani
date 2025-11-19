// backend/routes/auth.js
const express = require("express");
const { body } = require("express-validator");
const validateRequest = require("../middleware/validate");
const { register, login } = require("../controllers/authController");

const router = express.Router();

// Registration route
router.post(
  "/register",
  [
    body("name")
      .isString()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Name required"),
    body("phone")
      .isString()
      .trim()
      .isLength({ min: 6 })
      .withMessage("Valid phone required"),
    body("email")
      .optional()
      .isEmail()
      .withMessage("Invalid email"),
    body("password")
      .isString()
      .isLength({ min: 8 })
      .withMessage("Password must be 8+ chars"),
  ],
  validateRequest,
  register
);

// Login route
router.post(
  "/login",
  [
    body("phone")
      .isString()
      .trim()
      .withMessage("Phone required"),
    body("password")
      .isString()
      .withMessage("Password required"),
  ],
  validateRequest,
  login
);

module.exports = router;
