const express = require("express");
const router = express.Router();
const requestController = require("../controllers/requestController");
const {
  authenticateToken,
  isAdmin,
  isHospital,
} = require("../middlewares/auth");

// All routes are protected
router.use(authenticateToken);

// Get all blood requests
router.get("/", requestController.getAllRequests);

// Get a single blood request
router.get("/:id", requestController.getRequestById);

// Create a new blood request (hospital/recipient only)
router.post("/", isHospital, requestController.createRequest);

// Update blood request status (admin only)
// Temporarily removed isAdmin middleware for testing
router.put("/:id/status", requestController.updateRequestStatus);

// Get blood requests by recipient
router.get(
  "/recipient/:recipient_id",
  requestController.getRequestsByRecipient
);

// Get request statistics
router.get("/stats", requestController.getRequestStats);

module.exports = router;
