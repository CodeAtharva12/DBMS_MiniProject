const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middlewares/auth");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Debug route
router.get("/debug-table", authController.debugTableStructure);

// Protected routes
router.get("/profile", authenticateToken, authController.getProfile);

module.exports = router;
