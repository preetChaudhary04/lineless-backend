const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Global Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

// Importing Routes
const authRoutes = require("./routes/authRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const ticketRoutes = require("./routes/ticketRoutes");

// Using Routes
app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/tickets", ticketRoutes);

module.exports = app;
