const express = require('express');
const router = express.Router();
const donorController = require('../controllers/donorController');
const { authenticateToken } = require('../middlewares/auth');

// All routes are protected
router.use(authenticateToken);

// Get all donors
router.get('/', donorController.getAllDonors);

// Get a single donor
router.get('/:id', donorController.getDonorById);

// Create a new donor
router.post('/', donorController.createDonor);

// Update a donor
router.put('/:id', donorController.updateDonor);

// Delete a donor
router.delete('/:id', donorController.deleteDonor);

// Get donor's donation history
router.get('/:id/donations', donorController.getDonorDonations);

module.exports = router; 