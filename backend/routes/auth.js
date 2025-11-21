// backend/routes/auth.js
const express = require("express");
const { body } = require("express-validator");
const validateRequest = require("../middleware/validate");
const { register, login } = require("../controllers/authController");

const router = express.Router();

// -------------------------------
// Registration route
// -------------------------------
router.post(
  "/register",
  [
    body("name")
      .isString()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Name is required and must be at least 2 characters long"),
    body("phone")
      .isString()
      .trim()
      .isLength({ min: 6 })
      .withMessage("Phone number is required and must be at least 6 characters"),
    body("email")
      .optional()
      .isEmail()
      .withMessage("Email must be a valid format"),
    body("password")
      .isString()
      .isLength({ min: 8 })
      .withMessage("Password is required and must be at least 8 characters long"),
  ],
  validateRequest,
  register
);

// -------------------------------
// Login route
// -------------------------------
router.post(
  "/login",
  [
    body("phone")
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Phone number is required"),
    body("password")
      .isString()
      .notEmpty()
      .withMessage("Password is required"),
  ],
  validateRequest,
  login
);

module.exports = router;
