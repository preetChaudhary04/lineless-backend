const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000,
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
const register = async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber, role } = req.body;

    // Basic Input Validation
    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({ message: "Full name, email, and password are required." });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "A user with this email already exists." });
    }

    // Hash the plain text password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create and save the new user
    const newUser = await User.create({
      fullName,
      email,
      passwordHash,
      phoneNumber: phoneNumber || null,
      role: role || "CUSTOMER",
    });

    // Generating JWT Token
    const token = jwt.sign(
      { userId: newUser.userId, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    // Returning response
    return res
      .status(201)
      .cookie("token", token, cookieOptions)
      .json({
        message: "User registered successfully!",
        user: {
          userId: newUser.userId,
          fullName: newUser.fullName,
          email: newUser.email,
          phoneNumber: newUser.phoneNumber,
          role: newUser.role,
          accountStatus: newUser.accountStatus,
        },
      });
  } catch (error) {
    console.error("Error inside register controller:", error);
    return res
      .status(500)
      .json({ message: "Internal server error during registration." });
  }
};

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input Validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Block suspended users from accessing the system
    if (user.accountStatus === "SUSPENDED") {
      return res.status(403).json({
        message:
          "Your account has been suspended. Please contact the administrator.",
      });
    }

    // Comparing passwords
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Generate a new JWT token
    const token = jwt.sign(
      { userId: user.userId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    // Sending response
    return res
      .status(200)
      .cookie("token", token, cookieOptions)
      .json({
        message: "Login successful!",
        user: {
          userId: user.userId,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          accountStatus: user.accountStatus,
        },
      });
  } catch (error) {
    console.error("Error inside login controller:", error);
    return res
      .status(500)
      .json({ message: "Internal server error during login." });
  }
};

// @route   POST /api/auth/logout
// @desc    Clear auth cookie and logout user
// @access  Public
const logout = async (req, res) => {
  try {
    return res
      .status(200)
      .clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      })
      .json({ message: "Logged out successfully!" });
  } catch (error) {
    console.error("Error inside logout controller:", error);
    return res
      .status(500)
      .json({ message: "Internal server error during logout." });
  }
};

// @route   GET /api/auth/me
// @desc    Verify cookie token and return current database user profile
// @access  Protected
const getMe = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res
        .status(401)
        .json({ message: "No session token found. Please log in." });
    }

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        message: "Session expired or invalid. Please re-authenticate.",
      });
    }

    // Query PostgreSQL using the decoded userId to get fresh data
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res
        .status(404)
        .json({ message: "User account no longer exists." });
    }

    // Double check if they got suspended in the background
    if (user.accountStatus === "SUSPENDED") {
      return res
        .status(403)
        .json({ message: "Your account has been suspended." });
    }

    // Send back verified data
    return res.status(200).json({
      user: {
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        accountStatus: user.accountStatus,
      },
    });
  } catch (error) {
    console.error("Error inside getMe controller:", error);
    return res
      .status(500)
      .json({ message: "Internal server error verifying profile session." });
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
};
