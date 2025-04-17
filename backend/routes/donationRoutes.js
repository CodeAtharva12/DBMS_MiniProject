const express = require("express");
const router = express.Router();
const donationController = require("../controllers/donationController");
const { authenticateToken, isAdmin } = require("../middlewares/auth");
const donorController = require("../controllers/donorController");

// All routes are protected
router.use(authenticateToken);

// Get all donations
router.get("/", donationController.getAllDonations);

// Get donations by date range
router.get("/date-range", donationController.getDonationsByDateRange);

// Get donation statistics
router.get("/stats", donationController.getDonationStats);

// Get donations by donor ID
router.get("/donor/:id", donorController.getDonorDonations);

// Get a single donation
router.get("/:id", donationController.getDonationById);

// Create a new donation
router.post("/", donationController.createDonation);

// Update donation status
router.put("/:id/status", isAdmin, donationController.updateDonationStatus);

module.exports = router;
