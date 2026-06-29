// src/controllers/ticketController.js
const QueueTicket = require("../models/QueueTicket");
const Service = require("../models/Services");
const User = require("../models/User");

/**
 * @route   POST /api/tickets/join
 * @desc    Enters a student into a specific service counter queue
 * @access  Protected (Students Only)
 */
const joinQueue = async (req, res) => {
  try {
    const { serviceId } = req.body;

    // Verify the target campus service counter exists
    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res
        .status(404)
        .json({ message: "The selected service counter does not exist." });
    }

    // Prevent a user from joining a completely closed queue
    if (service.serviceStatus === "CLOSED") {
      return res.status(400).json({
        message:
          "This service counter is currently closed. Tickets are not being issued.",
      });
    }

    // Prevent duplicate active tickets
    const existingTicket = await QueueTicket.findOne({
      where: {
        userId: req.user.userId,
        serviceId,
        status: ["WAITING", "SERVING"],
      },
    });

    if (existingTicket) {
      return res.status(400).json({
        message: "You are already holding an active position in this line!",
        ticketNumber: existingTicket.ticketNumber,
      });
    }

    // Find the highest ticket token number issued today for this service
    const lastTicket = await QueueTicket.findOne({
      where: { serviceId },
      order: [["ticketNumber", "DESC"]],
    });

    // If a ticket exists, increment by 1; otherwise start fresh at 1
    const nextTicketNumber = lastTicket ? lastTicket.ticketNumber + 1 : 1;

    // Build and commit the new ticket row
    const newTicket = await QueueTicket.create({
      ticketNumber: nextTicketNumber,
      userId: req.user.userId,
      serviceId,
      status: "WAITING",
    });

    return res.status(201).json({
      message: "Successfully checked into line!",
      ticket: {
        ticketId: newTicket.ticketId,
        ticketNumber: newTicket.ticketNumber,
        status: newTicket.status,
        createdAt: newTicket.createdAt,
      },
    });
  } catch (error) {
    console.error("Error in joinQueue controller:", error);
    return res
      .status(500)
      .json({ message: "Internal server error issuing ticket." });
  }
};

/**
 * @route   PATCH /api/tickets/next/:serviceId
 * @desc    Advances the line by serving the next waiting student
 * @access  Protected (Providers / Admins only)
 */
const callNextTicket = async (req, res) => {
  try {
    const { serviceId } = req.params;

    // Verify that the logged-in Provider actually owns this service counter
    const service = await Service.findOne({
      where: { serviceId, providerId: req.user.userId },
    });

    if (!service && req.user.role !== "ADMIN") {
      return res.status(403).json({
        message:
          "Unauthorized. You do not have ownership management permissions over this counter.",
      });
    }

    // Clear out any ticket currently marked as "SERVING" for this desk (Mark it COMPLETED)
    await QueueTicket.update(
      { status: "COMPLETED" },
      { where: { serviceId, status: "SERVING" } },
    );

    // Locate the oldest ticket currently still "WAITING" in the queue system
    const nextTicket = await QueueTicket.findOne({
      where: { serviceId, status: "WAITING" },
      include: [
        { model: User, as: "student", attributes: ["fullName", "email"] },
      ],
      order: [["ticketNumber", "ASC"]],
    });

    // If no more tickets are waiting, let the provider know the room is clear
    if (!nextTicket) {
      return res.status(200).json({
        message: "The line is completely empty! No waiting tickets remaining.",
        currentTicket: null,
      });
    }

    // Advance the waiting ticket to SERVING
    nextTicket.status = "SERVING";
    await nextTicket.save();

    return res.status(200).json({
      message: `Now calling Ticket #${nextTicket.ticketNumber}!`,
      currentTicket: {
        ticketId: nextTicket.ticketId,
        ticketNumber: nextTicket.ticketNumber,
        status: nextTicket.status,
        studentName: nextTicket.student?.fullName,
      },
    });
  } catch (error) {
    console.error("Error in callNextTicket controller:", error);
    return res
      .status(500)
      .json({ message: "Internal server error shifting queue state." });
  }
};

/**
 * @route   GET /api/tickets/my-tickets
 * @desc    Fetches the history of line tokens belonging to the logged-in student
 * @access  Protected (Students Only)
 */
const getMyTickets = async (req, res) => {
  try {
    const history = await QueueTicket.findAll({
      where: { userId: req.user.userId },
      include: [
        {
          model: Service,
          as: "service",
          attributes: ["name", "serviceStatus"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ count: history.length, tickets: history });
  } catch (error) {
    console.error("Error in getMyTickets controller:", error);
    return res
      .status(500)
      .json({ message: "Internal server error pulling ticket summary." });
  }
};

/**
 * @route   GET /api/tickets/active-line/:serviceId
 * @desc    Returns full live line arrays for provider dashboard displays
 * @access  Protected (Providers / Admins only)
 */
const getServiceLine = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const activeTickets = await QueueTicket.findAll({
      where: { serviceId, status: ["WAITING", "SERVING"] },
      include: [
        { model: User, as: "student", attributes: ["fullName", "email"] },
      ],
      order: [["ticketNumber", "ASC"]],
    });

    return res
      .status(200)
      .json({ count: activeTickets.length, lineup: activeTickets });
  } catch (error) {
    console.error("Error in getServiceLine controller:", error);
    return res
      .status(500)
      .json({ message: "Internal server error generating desk lineup view." });
  }
};

module.exports = {
  joinQueue,
  callNextTicket,
  getMyTickets,
  getServiceLine,
};
