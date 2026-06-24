const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// @route   POST /api/auth/register
// @desc    Register a new user (Customer or Provider)
// @access  Public
router.post("/register", authController.register);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", authController.login);

// @route   POST /api/auth/logout
// @desc    Logout an user
// @access  Public
router.post("/logout", authController.logout);

// @route   GET /api/auth/me
// @desc    Authenticate an user
// @access  Public
router.get("/me", authController.getMe);

module.exports = router;
