const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticateToken, isAdmin } = require('../middlewares/auth');

// All routes are protected
router.use(authenticateToken);

// Get all inventory
router.get('/', inventoryController.getAllInventory);

// Get inventory by blood group
router.get('/blood-group/:blood_group', inventoryController.getInventoryByBloodGroup);

// Get inventory statistics
router.get('/stats', inventoryController.getInventoryStats);

// Update inventory (admin only)
router.post('/update', isAdmin, inventoryController.updateInventory);

// Get expiring donations
router.get('/expiring', inventoryController.getExpiringDonations);

module.exports = router; 