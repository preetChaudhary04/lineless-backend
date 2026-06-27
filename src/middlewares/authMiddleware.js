const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Guard Middleware: Verifies the HttpOnly token cookie and hydrates req.user
const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        message: "Access denied. No active session token found. Please log in.",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        message:
          "Session expired or invalid token signature. Please re-authenticate.",
      });
    }

    const currentUser = await User.findByPk(decoded.userId);

    if (!currentUser) {
      return res.status(401).json({
        message: "The user account tied to this session no longer exists.",
      });
    }

    if (currentUser.accountStatus === "SUSPENDED") {
      return res
        .status(403)
        .json({ message: "Your account has been suspended." });
    }

    req.user = currentUser;
    next();
  } catch (error) {
    console.error("Security Gateway Exception:", error);
    return res
      .status(500)
      .json({ message: "Internal server error during authentication guard." });
  }
};

/**
 * Authorization Middleware: Restricts access to specific string roles
 * @param  {...string} allowedRoles - e.g., restrictTo("PROVIDER", "ADMIN")
 */
const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(500).json({
        message: "Role authorization check failed due to missing user context.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message:
          "Forbidden. You do not have permission to perform this action.",
      });
    }

    next();
  };
};

module.exports = { protect, restrictTo };
