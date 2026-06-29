const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticketController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

router.use(protect);

/**
 * @route   POST /api/tickets/join
 * @desc    Enters a student into a specific service counter queue
 * @access  Protected (Students Only)
 */
router.post("/join", restrictTo("CUSTOMER"), ticketController.joinQueue);

/**
 * @route   PATCH /api/tickets/next/:serviceId
 * @desc    Advances the line by serving the next waiting student
 * @access  Protected (Providers / Admins only)
 */
router.patch(
  "/next/:serviceId",
  restrictTo("PROVIDER", "ADMIN"),
  ticketController.callNextTicket,
);

/**
 * @route   GET /api/tickets/my-tickets
 * @desc    Fetches the history of line tokens belonging to the logged-in student
 * @access  Protected (Students Only)
 */
router.get(
  "/my-tickets",
  restrictTo("CUSTOMER"),
  ticketController.getMyTickets,
);

/**
 * @route   GET /api/tickets/active-line/:serviceId
 * @desc    Returns full live line arrays for provider dashboard displays
 * @access  Protected (Providers / Admins only)
 */
router.get(
  "/active-line/:serviceId",
  restrictTo("PROVIDER", "ADMIN"),
  ticketController.getServiceLine,
);

module.exports = router;
