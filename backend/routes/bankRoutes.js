const express = require("express");
const router = express.Router();
const bankController = require("../controllers/bankController");
const { authenticateToken } = require("../middlewares/auth");

// All routes are protected
router.use(authenticateToken);

// Get all blood banks
router.get("/", bankController.getAllBanks);

// Get a single blood bank
router.get("/:id", bankController.getBankById);

// Create a new blood bank
router.post("/", bankController.createBank);

// Update a blood bank
router.put("/:id", bankController.updateBank);

// Delete a blood bank
router.delete("/:id", bankController.deleteBank);

// Get bank's inventory
router.get("/:id/inventory", bankController.getBankInventory);

// Get bank's donation history
router.get("/:id/donations", bankController.getBankDonations);

// Get bank's request history
router.get("/:id/requests", bankController.getBankRequests);

module.exports = router;
