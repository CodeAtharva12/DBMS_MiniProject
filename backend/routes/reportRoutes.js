const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, isAdmin } = require('../middlewares/auth');

// All routes are protected
router.use(authenticateToken);

// Get overview dashboard stats
router.get('/overview', reportController.getOverviewStats);

// Get inventory report
router.get('/inventory', reportController.getInventoryReport);

// Get donation report
router.get('/donations', reportController.getDonationReport);

// Get request report
router.get('/requests', reportController.getRequestReport);

// Get activity logs (admin only)
router.get('/activity-logs', isAdmin, reportController.getActivityLogs);

module.exports = router; 