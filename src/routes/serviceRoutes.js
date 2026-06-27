const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

// @route   POST /api/services
// @desc    Create a new campus service counter
// @access  Protected (Providers & Admins only)
router.post(
  "/",
  protect,
  restrictTo("PROVIDER", "ADMIN"),
  serviceController.createService,
);

// @route   GET /api/services
// @desc    Get all active campus service counters with provider details
// @access  Protected
router.get("/", protect, serviceController.getAllServices);

module.exports = router;
