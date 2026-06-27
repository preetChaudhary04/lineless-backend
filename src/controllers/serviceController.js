const Service = require("../models/Services");
const User = require("../models/User");

// @route   POST /api/services
// @desc    Create a new campus service counter
// @access  Protected (Providers & Admins only)
const createService = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Basic incoming validation check
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Service name is required." });
    }

    // Creating the service
    const newService = await Service.create({
      name: name.trim(),
      description: description ? description.trim() : null,
      providerId: req.user.userId,
      serviceStatus: "CLOSED",
    });

    // Returning response
    return res.status(201).json({
      message: "Service counter registered successfully!",
      service: {
        serviceId: newService.serviceId,
        name: newService.name,
        description: newService.description,
        serviceStatus: newService.serviceStatus,
        providerId: newService.providerId,
      },
    });
  } catch (error) {
    console.error("Error inside createService controller:", error);
    return res.status(500).json({
      message: "Internal server error while initializing service counter.",
    });
  }
};

// @route   GET /api/services
// @desc    Get all active campus service counters with provider details
// @access  Protected
const getAllServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      attributes: [
        "serviceId",
        "name",
        "description",
        "serviceStatus",
        "createdAt",
      ],
      include: [
        {
          model: User,
          as: "provider",
          attributes: ["fullName", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      count: services.length,
      services,
    });
  } catch (error) {
    console.error("Error inside getAllServices controller:", error);
    return res.status(500).json({
      message: "Internal server error fetching active service listings.",
    });
  }
};

module.exports = {
  createService,
  getAllServices,
};
