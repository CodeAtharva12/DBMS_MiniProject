const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

// Load env vars
dotenv.config();

// Import route files
const authRoutes = require("./routes/authRoutes");
const donorRoutes = require("./routes/donorRoutes");
const bankRoutes = require("./routes/bankRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const donationRoutes = require("./routes/donationRoutes");
const requestRoutes = require("./routes/requestRoutes");
const recipientRoutes = require("./routes/recipientRoutes");
const reportRoutes = require("./routes/reportRoutes");
const activityRoutes = require("./routes/activityRoutes");
const testRoutes = require("./routes/testRoutes");

// Create Express app
const app = express();

// Middleware
app.use(
  cors({
    origin: "*", // Allow all origins for development
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(bodyParser.json());

// Log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Base route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to BloodHaven API - Blood Bank Management System",
    version: "1.0.0",
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/banks", bankRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/recipients", recipientRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/test", testRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Handle 404 routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

// Set port and start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`📝 Documentation available at http://localhost:${PORT}/\n`);
});

// Import database connection to test it on startup
require("./db");

// Scheduled task to check for expired blood (in production would use cron job)
const pool = require("./db");
let dbConnected = false;

// Test database connection before setting up scheduled tasks
pool
  .getConnection()
  .then((connection) => {
    dbConnected = true;
    connection.release();

    // Only set up scheduled tasks if database is connected
    setInterval(async () => {
      try {
        await pool.execute("CALL update_expired_blood()");
        console.log("✅ Checked for expired blood units");
      } catch (error) {
        console.error("❌ Error checking expired blood:", error.message);
      }
    }, 24 * 60 * 60 * 1000); // Check once per day
  })
  .catch((err) => {
    console.warn(
      "⚠️ Scheduled tasks disabled due to database connection issues"
    );
  });

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});
